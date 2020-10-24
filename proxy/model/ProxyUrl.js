const {Sequelize,DataTypes,Model} = require('sequelize');
const {config} = require('../config');
const sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: 'mysql',
    pool: {
        max: 20,
        min: 0,
        idle: 30000
    },
    logging:false
});

class ProxyUrl extends Model{}

ProxyUrl.init({
    id:{
        type: DataTypes.BIGINT,
        primaryKey:true,
        autoIncrement:true
    },
    protocol:DataTypes.STRING(255),
    host:{
        type: DataTypes.STRING(255),
        unique:true
    },
    port:DataTypes.INTEGER,
    reachable:DataTypes.INTEGER,
    delete_mark:DataTypes.BOOLEAN,
    location:DataTypes.STRING(255),
    from:DataTypes.STRING(255),
    status_code:DataTypes.STRING(255)
},{
    sequelize,
    modelName:'proxy_url',
    timestamps:false
});

module.exports = ProxyUrl;
