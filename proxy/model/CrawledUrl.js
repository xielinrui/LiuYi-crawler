const {Sequelize, DataTypes, Model} = require('sequelize');
const {config} = require('../config');
const sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: 'mysql',
    pool: {
        max: 20,
        min: 0,
        idle: 30000
    }
});

/**
 * @author xlr
 * @description crawled_urls表
 */
class CrawledUrl extends Model {
}

CrawledUrl.init({
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    url: {
        type: DataTypes.STRING(255),
        unique: true
    },
    title: DataTypes.STRING(255),
    site_id: DataTypes.BIGINT,
    site_url: DataTypes.STRING(255),
    delete_mark: DataTypes.BOOLEAN
}, {
    sequelize,
    modelName: 'crawled_url',
    timestamps: false
});

module.exports = CrawledUrl;
