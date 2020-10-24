const {Cluster} = require('puppeteer-cluster');
const urllib = require('url');
const WebSite = require('../model/WebSite');
const OutSite = require('../model/OutSite');
const Pan = require('../model/Pan');
const CrawleDUrl = require('../model/CrawledUrl');


const launchOptions = {
    headless: false,
    ignoreHTTPSErrors: true,        // 忽略证书错误
    waitUntil: 'networkidle2',
    defaultViewport: {
        width: 1920,
        height: 1080
    },
    args: [
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-xss-auditor',    // 关闭 XSS Auditor
        '--no-zygote',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--allow-running-insecure-content',     // 允许不安全内容
        '--disable-webgl',
        '--disable-popup-blocking',
        //'--proxy-server=http://127.0.0.1:8080'      // 配置代理
    ],
    executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
};

const clusterLanuchOptions = {
    concurrency: Cluster.CONCURRENCY_PAGE,  // 单Chrome多tab模式
    maxConcurrency: 10,  // 并发的workers数
    sameDomainDelay: 200,
    retryLimit: 2,   // 重试次数
    skipDuplicateUrls: true,  // 不爬重复的url
    monitor: true,  // 显示性能消耗
    puppeteerOptions: launchOptions,
};

const clusterLanuchOptionsOut = {
    concurrency: Cluster.CONCURRENCY_PAGE,  // 单Chrome多tab模式
    maxConcurrency: 5,  // 并发的workers数
    retryLimit: 2,   // 重试次数
    skipDuplicateUrls: true,  // 不爬重复的url
    monitor: false,  // 显示性能消耗
    puppeteerOptions: launchOptions,
};

const clusterLanuchOptionsPan = {
    concurrency: Cluster.CONCURRENCY_PAGE,  // 单Chrome多tab模式
    maxConcurrency: 1,  // 并发的workers数
    retryLimit: 2,   // 重试次数
    skipDuplicateUrls: true,  // 不爬重复的url
    monitor: false,  // 显示性能消耗
    puppeteerOptions: launchOptions,
};

var whiteList = ['pan.baidu.com', 'lanzou.com', '.pdf', '.exe', '.tar.gz', '.zip'];

/**
 * 获取页面内所有链接和内容，其中外部链接和内部链接分开存储，资源的链接会单独再处理
 * @param siteId
 * @param url
 * @returns {Promise<void>}
 */
async function getAllPages(siteId, root) {
    // todo cluster 是爬取整站的调度器
    let rootHost = urllib.parse(root);
    // todo 下面有两个outSet，分别用于控制初始cluster中避免将相同hostname的重复加入到cluster2中，造成资源的浪费；第二个是用于控制避免将重复的加到数据库中去，
    // todo 其实理论上讲，第二个set是多余的。不过，对于资源爬虫来说，pan.baidu.com/lanzou.com 这两个资源的域名可以单独关注，也就是所谓的白名单
    let outSet1 = new Set();
    let outSet2 = new Set();
    const cluster = await Cluster.launch(clusterLanuchOptions);
    // todo cluster2 获取外站链接
    const cluster2 = await Cluster.launch(clusterLanuchOptionsOut);

    // todo 主要的任务池
    await cluster.task(async ({page, data}) => {
        let {url, siteId, siteUrl} = data;
        await page.goto(url);
        await page.waitForSelector('html');
        let title = await page.title();
        await page.content();
        // todo 存储到爬过的页面中
        let xx = await CrawleDUrl.create({
            url: url,
            title: title,
            site_id: siteId,
            site_url: siteUrl
        });
        let links = await page.$$eval('[src],[href],[action],[data-url],[longDesc],[lowsrc]', getSrcAndHrefLinks);
        let res = parseLinks(links, url);
        for (let i = 0; i < res.length; i++) {
            let flag = 0;
            for (let j = 0; j < whiteList.length; j++) {
                if (res[i].indexOf(whiteList[j]) !== -1) {
                    // todo 触发了资源白名单 将链接直接先存起来。资源的获取与校验不应该占用爬虫部分的性能
                    await Pan.create({
                        url: res[i],
                        code: '-',
                        title: '-',
                        site_id: siteId,
                        site_title: title,
                        site_url: url
                    });
                    flag = 1;
                    break;
                }
            }
            if (flag === 1) continue;
            let tmpHost = urllib.parse(res[i]);
            if (tmpHost.hostname !== rootHost.hostname) {
                if (!outSet1.has(tmpHost.hostname)) {
                    await cluster2.queue({
                        url: res[i],
                        siteId: siteId,
                        siteUrl: siteUrl
                    });
                    outSet1.add(tmpHost.hostname);
                }
            } else {
                await cluster.queue({
                    url: res[i],
                    siteId: siteId,
                    siteUrl: siteUrl
                });
            }
        }
    });

    // todo 外部链接任务池 定义外站链接访问时的操作
    await cluster2.task(async ({page, data}) => {
        let {url, siteId, siteUrl} = data;
        await page.goto(url);
        await page.waitForSelector('html');
        let title = await page.title();
        await page.content();
        let tmpHost = urllib.parse(url);
        if (tmpHost.hostname !== rootHost.hostname) {
            // todo 存储到外部页面，但是hostname不能重复
            if (!outSet2.has(tmpHost.hostname)) {
                await OutSite.create({
                    url: tmpHost.hostname,
                    title: title
                });
                outSet2.add(tmpHost.hostname);
            }
        }
    });

    await cluster.queue({
        url: root,
        siteId: siteId,
        siteUrl: root
    });
    // 与工作池保持心跳
    await cluster.idle();
    await cluster2.idle();
    // 关闭工作池
    await cluster.close();
}


async function handleResource() {
    const cluster = await Cluster.launch(clusterLanuchOptionsPan);
    await cluster.task(async ({page, data}) => {
        let {url, id} = data;
        await page.goto(url);
        await page.waitForSelector('html');
        let title = await page.title();
        await page.content();
        // todo 如果是
        console.log(title);
        if (title.indexOf('不存在') !== -1) {
            await Pan.update({
                check_status: true,
                reachable: false
            }, {
                where: {
                    id: id
                }
            });
        } else if (title.indexOf('无限制') !== -1) {
            await Pan.update({
                check_status: true,
                reachable: true,
                title: title
            }, {
                where: {
                    id: id
                }
            })
        } else if (title.indexOf('提取码') !== -1) {
            // todo code 为 + 表示需要进行code提取，但是目标可达
            await Pan.update({
                check_status: true,
                reachable: true,
                need_code: true
            }, {
                where: {
                    id: id
                }
            });
        } else {
            await Pan.update({
                check_status: true,
                reachable: true,
                title: title
            }, {
                where: {
                    id: id
                }
            })
        }
    });
    let pans = await Pan.findAll({
        where: {
            delete_mark: false,
            check_status: false
        }
    });
    // console.log(pans.length);
    for (let i = 0; i < pans.length; i++) {
        await cluster.queue({
            url: pans[i].url,
            id: pans[i].id
        });
    }

    await cluster.idle();
    await cluster.close();
    return true;
}


/**
 * 处理得到的url列表，格式化
 * @param links
 * @param url
 * @returns {Array}
 */
function parseLinks(links, url) {
    let result = [];
    let blacklists = ['mp4', 'mp3', 'ico', 'jpg', 'png', 'gif', 'css', 'js', 'swf', 'exe', 'pdf', 'txt', 'docx', 'xls', 'csv', 'zip', 'tar.gz', 'doc'];
    for (let link of links) {
        let parsedLink = urllib.parse(link);
        let hostname = parsedLink.hostname;       // 主机名不带端口号
        // 处理相对路径
        if (hostname == null && link.indexOf("/") === 0) {
            link = urllib.resolve(url, link);
        }
        // 相对路径还有一种是不以/开头的，如：resource.root/assets/images/favicon.ico

        // 处理url以 // 开头的情况
        else if (link.indexOf("//") === 0) {
            link = "http:" + link;
        } else {
            link = urllib.resolve(url, link);
        }
        // 去除静态文件
        if (parsedLink.pathname) {
            let filename = parsedLink.pathname.split('/').pop();
            if (blacklists.indexOf(filename.toLowerCase().split(".").pop()) !== -1) {
                continue;
            }
        }
        result.push(link);
    }
    return result;
}

/**
 * 获取节点中的herf和src链接，这里需要把base64给过滤掉
 * @param nodes
 * @returns {Array}
 */
function getSrcAndHrefLinks(nodes) {
    let result = [];
    for (let node of nodes) {
        let src = node.getAttribute("src");
        let href = node.getAttribute("href");
        if (src) {
            result.push(src)
        }
        if (href) {
            result.push(href);
        }
    }
    return result;
}




// (async () => {
//     await handleResource();
// })();

module.exports = {
    launchOptions,
    clusterLanuchOptions,
    clusterLanuchOptionsPan,
    clusterLanuchOptionsOut,
    getSrcAndHrefLinks,
    parseLinks
};




