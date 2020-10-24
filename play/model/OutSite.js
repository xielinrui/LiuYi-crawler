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
 * outsite表
 */
class OutSite extends Model{}

OutSite.init({
    id:{
        type:Sequelize.BIGINT,
        primaryKey:true,
        autoIncrement:true
    },
    url:{
        type:Sequelize.STRING(255),
        unique:true
    },
    title:Sequelize.STRING(255),
    type:Sequelize.INTEGER,
    delete_mark:Sequelize.BOOLEAN
},{
    sequelize,
    modelName:'outsite',
    timestamps:false
});

module.exports = OutSite;
