const {Cluster} = require('puppeteer-cluster');

var config = {
    database:'dupansearch',
    username:'root',
    password:'kexuejia123',
    host:'localhost',
    port:3306
};

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

const clusterLanuchOptionsProxy = {
    concurrency: Cluster.CONCURRENCY_PAGE,  // 单Chrome多tab模式
    maxConcurrency: 1,  // 并发的workers数
    retryLimit: 2,   // 重试次数
    skipDuplicateUrls: true,  // 不爬重复的url
    monitor: false,  // 显示性能消耗
    puppeteerOptions: launchOptions,
};


const cookies = [
    {
        "domain": ".baidu.com",
        "expirationDate": 3686217805.456412,
        "hostOnly": false,
        "httpOnly": false,
        "name": "BAIDUID",
        "path": "/",
        "sameSite": "unspecified",
        "secure": false,
        "session": false,
        "storeId": "0",
        "value": "A1CC301738EC6D4BA7BC51BC0602C6BF:FG=1",
        "id": 1
    },
    {
        "domain": ".baidu.com",
        "expirationDate": 1862282153.654205,
        "hostOnly": false,
        "httpOnly": true,
        "name": "BDUSS",
        "path": "/",
        "sameSite": "unspecified",
        "secure": false,
        "session": false,
        "storeId": "0",
        "value": "VFKbjh-blcxdjVVT35QZ2ZlTFcwSllNbVVLOWYzSHpyU1J6UGVNOFF2V3FwTFJmRVFBQUFBJCQAAAAAAAAAAAEAAADl4XdnQ1nQwsn6AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKoXjV-qF41fR",
        "id": 2
    },
    {
        "domain": ".baidu.com",
        "expirationDate": 1918543541.194028,
        "hostOnly": false,
        "httpOnly": true,
        "name": "BDUSS_BFESS",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": "0",
        "value": "VFKbjh-blcxdjVVT35QZ2ZlTFcwSllNbVVLOWYzSHpyU1J6UGVNOFF2V3FwTFJmRVFBQUFBJCQAAAAAAAAAAAEAAADl4XdnQ1nQwsn6AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKoXjV-qF41fR",
        "id": 3
    },
    {
        "domain": ".baidu.com",
        "expirationDate": 3686217805.456443,
        "hostOnly": false,
        "httpOnly": false,
        "name": "BIDUPSID",
        "path": "/",
        "sameSite": "unspecified",
        "secure": false,
        "session": false,
        "storeId": "0",
        "value": "A1CC301738EC6D4BA7BC51BC0602C6BF",
        "id": 4
    },
    {
        "domain": ".baidu.com",
        "expirationDate": 1634705304.934407,
        "hostOnly": false,
        "httpOnly": false,
        "name": "H_WISE_SIDS",
        "path": "/",
        "sameSite": "unspecified",
        "secure": false,
        "session": false,
        "storeId": "0",
        "value": "154758_152477_154207_158077_150967_156818_156286_150776_154259_148867_154738_153628_157264_158958_154173_150772_151494_156387_153065_156516_127969_154175_155963_155331_152981_155318_146732_158745_131423_154037_107314_158055_158829_154190_157947_155344_155255_157790_144966_157401_154214_157814_158716_158638_156848_147552_157028_158367_158504_158589_157697_154639_159093_154365_157474_159073_110085_157006",
        "id": 5
    },
    {
        "domain": ".baidu.com",
        "expirationDate": 3686217805.456479,
        "hostOnly": false,
        "httpOnly": false,
        "name": "PSTM",
        "path": "/",
        "sameSite": "unspecified",
        "secure": false,
        "session": false,
        "storeId": "0",
        "value": "1538734158",
        "id": 6
    },
    {
        "domain": ".pan.baidu.com",
        "expirationDate": 1606013803.378227,
        "hostOnly": false,
        "httpOnly": false,
        "name": "BDCLND",
        "path": "/",
        "sameSite": "unspecified",
        "secure": false,
        "session": false,
        "storeId": "0",
        "value": "5S3O%2F4fpBTuUMOcnE2XtePtGGn2CBjb07JQgxa1IV%2Fo%3D",
        "id": 7
    },
    {
        "domain": ".pan.baidu.com",
        "hostOnly": false,
        "httpOnly": false,
        "name": "Hm_lpvt_7a3960b6f067eb0085b7f96ff5e660b0",
        "path": "/",
        "sameSite": "unspecified",
        "secure": false,
        "session": true,
        "storeId": "0",
        "value": "1603463722",
        "id": 8
    },
    {
        "domain": ".pan.baidu.com",
        "expirationDate": 1634999721,
        "hostOnly": false,
        "httpOnly": false,
        "name": "Hm_lvt_7a3960b6f067eb0085b7f96ff5e660b0",
        "path": "/",
        "sameSite": "unspecified",
        "secure": false,
        "session": false,
        "storeId": "0",
        "value": "1603387383,1603411773,1603415622,1603463722",
        "id": 9
    },
    {
        "domain": ".pan.baidu.com",
        "expirationDate": 1634618146,
        "hostOnly": false,
        "httpOnly": false,
        "name": "Hm_lvt_f5f83a6d8b15775a02760dc5f490bc47",
        "path": "/",
        "sameSite": "unspecified",
        "secure": false,
        "session": false,
        "storeId": "0",
        "value": "1603081908",
        "id": 10
    },
    {
        "domain": ".pan.baidu.com",
        "expirationDate": 1603550123.131409,
        "hostOnly": false,
        "httpOnly": true,
        "name": "PANPSC",
        "path": "/",
        "sameSite": "unspecified",
        "secure": false,
        "session": false,
        "storeId": "0",
        "value": "13993497246022974857%3ADJI9ZdfpjgKR21jTF9IUW5gtJeEFa7WQTzdWROisKkvgnxyLY8lg6yvbCphtI0nMj4w3WX8W4yAiAzgNzPJfAbv28aLXEhwUsKFus2OS7Scqz6XJXjHGsiHshfz3IZqPRicwPY5FIL4VHFn6TVIxgNHhJ5aZPptowFxgyqx8xpJ3j5cyRAFOLfZiJWgFOkVgdRZN8DIT3kGMVj%2BP8sFRaA%3D%3D",
        "id": 11
    },
    {
        "domain": ".pan.baidu.com",
        "expirationDate": 1604377842.715209,
        "hostOnly": false,
        "httpOnly": false,
        "name": "PANWEB",
        "path": "/",
        "sameSite": "unspecified",
        "secure": false,
        "session": false,
        "storeId": "0",
        "value": "1",
        "id": 12
    },
    {
        "domain": ".pan.baidu.com",
        "expirationDate": 1605674153.90029,
        "hostOnly": false,
        "httpOnly": true,
        "name": "SCRC",
        "path": "/",
        "sameSite": "unspecified",
        "secure": false,
        "session": false,
        "storeId": "0",
        "value": "fe937bc9fe90bd0555666ed7eb4b6680",
        "id": 13
    },
    {
        "domain": ".pan.baidu.com",
        "expirationDate": 1605674153.900221,
        "hostOnly": false,
        "httpOnly": true,
        "name": "STOKEN",
        "path": "/",
        "sameSite": "unspecified",
        "secure": false,
        "session": false,
        "storeId": "0",
        "value": "2036cce6cbfaa2f2d4920f09fc1f0e7926ab00bf6f2c541df4b0b0cee513ce8d",
        "id": 14
    },
    {
        "domain": "pan.baidu.com",
        "expirationDate": 4179223153.082174,
        "hostOnly": true,
        "httpOnly": false,
        "name": "pan_login_way",
        "path": "/",
        "sameSite": "unspecified",
        "secure": false,
        "session": false,
        "storeId": "0",
        "value": "1",
        "id": 15
    },
    {
        "domain": "pan.baidu.com",
        "expirationDate": 1603681004,
        "hostOnly": true,
        "httpOnly": false,
        "name": "recommendTime",
        "path": "/",
        "sameSite": "unspecified",
        "secure": false,
        "session": false,
        "storeId": "0",
        "value": "mac2020-10-21%2017%3A00%3A00",
        "id": 16
    }
];

module.exports = {
    config,
    cookies,
    clusterLanuchOptionsProxy,
    launchOptions
};
