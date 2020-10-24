const {Cluster} = require('puppeteer-cluster');
const urllib = require('url');
const SiteKeyword = require('../model/SiteKeyword');
const {clusterLanuchOptionsProxy, launchOptions} = require('../config');


/**
 * 获取页面内所有链接和内容，其中外部链接和内部链接分开存储，资源的链接会单独再处理
 * @param siteId
 * @param url
 * @returns {Promise<void>}
 */
async function getAllPages(siteId, root, keyword, cookies) {
    let rootHost = urllib.parse(root);
    const cluster = await Cluster.launch(clusterLanuchOptionsProxy);

    // todo 主要的任务池
    await cluster.task(async ({page, data}) => {
        let {url, keyword} = data;
        for (let i = 0; i < cookies.length; i++) {
            await page.setCookie(cookies[i]);
        }
        await page.goto(url);
        await page.waitForSelector('html');
        let title = await page.title();
        let content = await page.content();
        // todo 存储到爬过的页面中
        for (let i = 0; i < keyword.length; i++) {
            if (content.indexOf(keyword[i]) !== -1) {
                await SiteKeyword.create({
                    url: url,
                    keyword: keyword[i],
                    title: title
                })
            }
        }
        let flag = 0;
        if (rootHost.hostname === 'www.lthack.com' && url.indexOf('thread') !== -1) {
            let firstHref = await page.$$eval('.first', async (nodes) => {
                for (let node of nodes) {
                    if (node.tagName === 'A') {
                        flag = 1;
                        return node.href;
                    }
                }
            });
            await cluster.queue({
                url: firstHref,
                keyword: keyword
            });
        }
        if (url.indexOf('-1-1.html') === -1) {
            if (flag === 0) {
                let links = await page.$$eval('[src],[href],[action],[data-url],[longDesc],[lowsrc]', getSrcAndHrefLinks);
                let res = parseLinks(links, url);
                for (let i = 0; i < res.length; i++) {
                    let tmpHost = urllib.parse(res[i]);
                    if (tmpHost.hostname === rootHost.hostname) {
                        await cluster.queue({
                            url: res[i],
                            keyword: keyword
                        });
                    }
                }
            }
        }
        await page.waitFor(3000);
    });

    await cluster.queue({
        url: root,
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
    await getAllPages(15, 'https://www.lthack.com/', ['查看本帖隐藏内容请', 'pan.baidu.com'], [
        {
            "domain": ".lthack.com",
            "expirationDate": 1618883360,
            "hostOnly": false,
            "httpOnly": false,
            "name": "UM_distinctid",
            "path": "/",
            "sameSite": "unspecified",
            "secure": false,
            "session": false,
            "storeId": "0",
            "value": "17543b24fa567-082f66d622b296-d373666-144000-17543b24fa66b7",
            "id": 1
        },
        {
            "domain": "www.lthack.com",
            "expirationDate": 1619267574,
            "hostOnly": true,
            "httpOnly": false,
            "name": "CNZZDATA1273087799",
            "path": "/",
            "sameSite": "unspecified",
            "secure": false,
            "session": false,
            "storeId": "0",
            "value": "365227927-1603153319-%7C1603538076",
            "id": 2
        },
        {
            "domain": "www.lthack.com",
            "hostOnly": true,
            "httpOnly": true,
            "name": "ZuV2_2132_auth",
            "path": "/",
            "sameSite": "unspecified",
            "secure": true,
            "session": true,
            "storeId": "0",
            "value": "2819cKXeDZrzO48vdBTYTFpXu1QvHYz0oFK675KkBL95DPhBcMyQksf9QCtBZMZvU2%2FxxG4yG8HUkTp5mkOXPgVnQPQ",
            "id": 3
        },
        {
            "domain": "www.lthack.com",
            "expirationDate": 1635078774.516482,
            "hostOnly": true,
            "httpOnly": false,
            "name": "ZuV2_2132_connect_is_bind",
            "path": "/",
            "sameSite": "unspecified",
            "secure": true,
            "session": false,
            "storeId": "0",
            "value": "0",
            "id": 4
        },
        {
            "domain": "www.lthack.com",
            "expirationDate": 1603996415.401273,
            "hostOnly": true,
            "httpOnly": false,
            "name": "ZuV2_2132_forum_lastvisit",
            "path": "/",
            "sameSite": "unspecified",
            "secure": true,
            "session": false,
            "storeId": "0",
            "value": "D_74_1603391562",
            "id": 5
        },
        {
            "domain": "www.lthack.com",
            "expirationDate": 1603629174.516394,
            "hostOnly": true,
            "httpOnly": false,
            "name": "ZuV2_2132_lastact",
            "path": "/",
            "sameSite": "unspecified",
            "secure": true,
            "session": false,
            "storeId": "0",
            "value": "1603542717%09misc.php%09patch",
            "id": 6
        },
        {
            "domain": "www.lthack.com",
            "expirationDate": 1635053667.252087,
            "hostOnly": true,
            "httpOnly": false,
            "name": "ZuV2_2132_lastcheckfeed",
            "path": "/",
            "sameSite": "unspecified",
            "secure": true,
            "session": false,
            "storeId": "0",
            "value": "174667%7C1603517610",
            "id": 7
        },
        {
            "domain": "www.lthack.com",
            "expirationDate": 1605750559.887014,
            "hostOnly": true,
            "httpOnly": false,
            "name": "ZuV2_2132_lastvisit",
            "path": "/",
            "sameSite": "unspecified",
            "secure": true,
            "session": false,
            "storeId": "0",
            "value": "1603154912",
            "id": 8
        },
        {
            "domain": "www.lthack.com",
            "hostOnly": true,
            "httpOnly": false,
            "name": "ZuV2_2132_lip",
            "path": "/",
            "sameSite": "unspecified",
            "secure": true,
            "session": true,
            "storeId": "0",
            "value": "125.86.80.7%2C1603540856",
            "id": 9
        },
        {
            "domain": "www.lthack.com",
            "expirationDate": 1628345501.978704,
            "hostOnly": true,
            "httpOnly": false,
            "name": "ZuV2_2132_nofavfid",
            "path": "/",
            "sameSite": "unspecified",
            "secure": true,
            "session": false,
            "storeId": "0",
            "value": "1",
            "id": 10
        },
        {
            "domain": "www.lthack.com",
            "expirationDate": 1605750559.886918,
            "hostOnly": true,
            "httpOnly": true,
            "name": "ZuV2_2132_saltkey",
            "path": "/",
            "sameSite": "unspecified",
            "secure": true,
            "session": false,
            "storeId": "0",
            "value": "SJ5M3OqO",
            "id": 11
        },
        {
            "domain": "www.lthack.com",
            "hostOnly": true,
            "httpOnly": false,
            "name": "ZuV2_2132_seccode",
            "path": "/",
            "sameSite": "unspecified",
            "secure": true,
            "session": true,
            "storeId": "0",
            "value": "1202.18817c0c05b53e3936",
            "id": 12
        },
        {
            "domain": "www.lthack.com",
            "expirationDate": 1603629166.920289,
            "hostOnly": true,
            "httpOnly": false,
            "name": "ZuV2_2132_sid",
            "path": "/",
            "sameSite": "unspecified",
            "secure": true,
            "session": false,
            "storeId": "0",
            "value": "tFYVl5",
            "id": 13
        },
        {
            "domain": "www.lthack.com",
            "expirationDate": 1635077573,
            "hostOnly": true,
            "httpOnly": false,
            "name": "ZuV2_2132_smile",
            "path": "/",
            "sameSite": "unspecified",
            "secure": false,
            "session": false,
            "storeId": "0",
            "value": "7D1",
            "id": 14
        },
        {
            "domain": "www.lthack.com",
            "hostOnly": true,
            "httpOnly": false,
            "name": "ZuV2_2132_st_p",
            "path": "/",
            "sameSite": "unspecified",
            "secure": true,
            "session": true,
            "storeId": "0",
            "value": "174667%7C1603542536%7Cebe62f3d2f840945053f33c87d93365c",
            "id": 15
        },
        {
            "domain": "www.lthack.com",
            "expirationDate": 1628345501.97874,
            "hostOnly": true,
            "httpOnly": false,
            "name": "ZuV2_2132_study_nge_extstyle",
            "path": "/",
            "sameSite": "unspecified",
            "secure": true,
            "session": false,
            "storeId": "0",
            "value": "6",
            "id": 16
        },
        {
            "domain": "www.lthack.com",
            "expirationDate": 1635078766.920267,
            "hostOnly": true,
            "httpOnly": false,
            "name": "ZuV2_2132_study_nge_extstyle_default",
            "path": "/",
            "sameSite": "unspecified",
            "secure": true,
            "session": false,
            "storeId": "0",
            "value": "6",
            "id": 17
        },
        {
            "domain": "www.lthack.com",
            "expirationDate": 1635076913.79271,
            "hostOnly": true,
            "httpOnly": false,
            "name": "ZuV2_2132_ulastactivity",
            "path": "/",
            "sameSite": "unspecified",
            "secure": true,
            "session": false,
            "storeId": "0",
            "value": "160ebfLGgpBjHAS%2BsprLbzm39t0pSxPueIg53EL8hrjWP0GGRWdU",
            "id": 18
        },
        {
            "domain": "www.lthack.com",
            "hostOnly": true,
            "httpOnly": false,
            "name": "ZuV2_2132_viewid",
            "path": "/",
            "sameSite": "unspecified",
            "secure": true,
            "session": true,
            "storeId": "0",
            "value": "tid_49652",
            "id": 19
        }
    ]);
})();



