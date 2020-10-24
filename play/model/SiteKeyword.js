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

class SiteKeyword extends Model{

}


SiteKeyword.init({
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    url: {
        type: DataTypes.STRING(255),
    },
    keyword: DataTypes.STRING(255),
    title: DataTypes.STRING(255)
},{
    sequelize,
    modelName: 'site_keyword',
    timestamps: false
});

module.exports = SiteKeyword;
