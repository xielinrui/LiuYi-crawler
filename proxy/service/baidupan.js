const Pan = require('../model/Pan');
const {Cluster} = require('puppeteer-cluster');
// const crawler = require('./crawler');
const {clusterLanuchOptionsProxy,launchOptions} = require('../config');
const puppeteer = require('puppeteer');


const cookies =

async function test(url,code){
    let browser = await puppeteer.launch(launchOptions);
    let page = await browser.newPage();
    // for (let i = 0; i < cookies.length; i++) {
    //     await page.setCookie(cookies[i]);
    // }
    await page.goto(url);
    await page.waitForSelector('html');
    await page.content();
    // let title = await page.title();
    // let codeWrong = false;
    // let used = true;
    // let needCodeButNone = false;
    // if (title.indexOf('提取码') !== -1) {
    //     // todo 填写提取码
    //     if (code === '-' || code === '+') {
    //         needCodeButNone = true;
    //     } else {
    //         await page.$$eval('#accessCode', writeCode, code);
    //         await page.$$eval('.g-button-blue-large', click);
    //         await page.waitFor(1000);
    //         let content = await page.content();
    //         if (content.indexOf('验证码错误') !== -1) {
    //             used = false;
    //         } else if (content.indexOf('提取码错误') !== -1) {
    //             codeWrong = true;
    //             used = false;
    //         } else {
    //             await page.waitFor(2000);
    //         }
    //     }
    // }
    // if (used && !needCodeButNone) {
    //     title = await page.title();
    //     await page.waitFor(1000);
    //     console.log(title);
    //     if (title.indexOf('不存在') !== -1) {
    //
    //     } else {
    //         // todo 找到title=保存到网盘的a标签并点击
    //         let x = await page.$$('.zbyDdwb');
    //         console.log(x.length);
    //         if (!(x === null || x===undefined || x.length === 0)){
    //             await page.$$eval('.zbyDdwb', selectAll);
    //         }
    //         await page.$$eval('[title=保存到网盘]', clickSave);
    //         await page.$$eval('.save-path-item', chooseLocation);
    //         await page.waitFor(2000);
    //         await page.$$eval('[title=确定]', confirm);
    //     }
    // }
}

async function selectAll(nodes) {
    console.log('selectAll',nodes.length);
    for (let node of nodes) {
        await node.click();
        break;
    }
}

async function click(nodes) {
    console.log('click',nodes.length);
    for (let node of nodes) {
        if (node.title === '提取文件') {
            await node.click();
        }
    }
}

async function writeCode(nodes, code) {
    console.log('writeCode',nodes.length);
    for (let node of nodes) {
        node.value = code;
    }
}

async function confirm(nodes) {
    console.log(nodes.length);
    for (let node of nodes) {
        console.log(node.tagName);
        if (node.tagName === 'A') {
            await node.click();
        }
    }
}

async function clickSave(nodes) {
    for (let node of nodes) {
        if (node.tagName === 'A') {
            await node.click();
            break;
        }
    }
}

async function chooseLocation(nodes) {
    for (let node of nodes) {
        node.setAttribute('class', 'save-path-item check');
    }
}

async function saveBaidu() {
    const cluster = await Cluster.launch(clusterLanuchOptionsProxy);
    await cluster.task(async ({page, data}) => {
        let {id, url, code} = data;
        console.log(url,code);
        for (let i = 0; i < cookies.length; i++) {
            await page.setCookie(cookies[i]);
        }
        await page.goto(url);
        await page.waitForSelector('html');
        await page.content();
        let title = await page.title();
        let codeWrong = false;
        let used = true;
        let needCodeButNone = false;
        if (title.indexOf('提取码') !== -1) {
            // todo 填写提取码
            if (code === '-' || code === '+') {
                needCodeButNone = true;
            } else {
                await page.$$eval('#accessCode', writeCode, code);
                await page.$$eval('.g-button-blue-large', click);
                await page.waitFor(1000);
                let content = await page.content();
                if (content.indexOf('验证码错误') !== -1) {
                    used = false;
                } else if (content.indexOf('提取码错误') !== -1) {
                    codeWrong = true;
                    used = false;
                } else {
                    await page.waitFor(2000);
                }
            }
        }
        if (used && !needCodeButNone) {
            title = await page.title();
            await page.waitFor(1000);
            console.log(title);
            if (title.indexOf('不存在') !== -1) {

            } else {
                // todo 找到title=保存到网盘的a标签并点击
                let x = await page.$$('.zbyDdwb');
                console.log(x.length);
                if (!(x === null || x===undefined || x.length === 0)){
                    await page.$$eval('.zbyDdwb', selectAll);
                }
                await page.$$eval('[title=保存到网盘]', clickSave);
                await page.$$eval('.save-path-item', chooseLocation);
                await page.waitFor(2000);
                await page.$$eval('[title=确定]', confirm);
            }
        }
        await Pan.update({
            used: used,
            code_wrong: codeWrong,
            need_code: needCodeButNone
        }, {
            where: {
                id: id
            }
        });
        await page.waitFor(3000);
    });
    let pans = await Pan.findAll({
        where: {
            // site_id:12,
            reachable: true,
            used:false,
            code_wrong:false
        }
    });
    console.log(pans.length);
    for (let i = 0; i < pans.length; i++) {
        if (pans[i].url.startsWith('http://pan.baidu') || pans[i].url.startsWith('https://pan.baidu')) {
            await cluster.queue({
                id: pans[i].id,
                url: pans[i].url,
                code: pans[i].code
            });
        }
    }

    await cluster.idle();
    // await cluster.close();
}

(async () => {
    await saveBaidu();
    // let x= await https.get('https://www.baidu.com/').end();
    // x.on('response',function (data) {
    //     console.log(data.statusCode);
    // });
    // x.on('error',()=>{
    //     console.log('请求出现异常');
    // });
    // await test('http://www.baidu.com/','67hr');
})();






