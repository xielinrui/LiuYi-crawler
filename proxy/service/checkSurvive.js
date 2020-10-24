const {Cluster} = require('puppeteer-cluster');
const Proxy = require('../model/ProxyUrl');
const {clusterLanuchOptionsProxy} = require('../config');
const http = require('http2');

// todo 利用消息订阅的方式不断循环更新

async function check() {




    let proxys = await Proxy.findAll({
        delete_mark:false
    });
    for (let i = 0; i < proxys; i++) {
        
    }
}



