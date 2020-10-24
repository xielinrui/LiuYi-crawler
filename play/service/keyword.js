const {Cluster} = require('puppeteer-cluster');
const urllib = require('url');
const SiteKeyword = require('../model/SiteKeyword');
const {clusterLanuchOptionsProxy,launchOptions} = require('../config');



/**
 * 获取页面内所有链接和内容，其中外部链接和内部链接分开存储，资源的链接会单独再处理
 * @param siteId
 * @param url
 * @returns {Promise<void>}
 */
async function getAllPages(siteId, root,keyword) {
    let rootHost = urllib.parse(root);
    const cluster = await Cluster.launch(clusterLanuchOptionsProxy);

    // todo 主要的任务池
    await cluster.task(async ({page, data}) => {
        let {url, siteId, siteUrl,keyword} = data;
        await page.goto(url);
        await page.waitForSelector('html');
        let title = await page.title();
        let content = await page.content();
        // todo 存储到爬过的页面中
        if (content.indexOf(keyword)!==-1){
            await SiteKeyword.create({
                url:url,
                keyword:keyword,
                title:title
            })
        }
        let links = await page.$$eval('[src],[href],[action],[data-url],[longDesc],[lowsrc]', getSrcAndHrefLinks);
        let res = parseLinks(links, url);
        for (let i = 0; i < res.length; i++) {
            let tmpHost = urllib.parse(res[i]);
            if (tmpHost.hostname === rootHost.hostname) {
                await cluster.queue({
                    url: res[i],
                    siteId: siteId,
                    siteUrl: siteUrl
                });
            }
        }
    });

    await cluster.queue({
        url: root,
        siteId: siteId,
        siteUrl: root,
        keyword: keyword
    });
    // 与工作池保持心跳
    await cluster.idle();
    // 关闭工作池
    await cluster.close();
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


(async () => {
    await getAllPages(15,'https://www.lthack.com/','查看本帖隐藏内容请');
})();



