const {Sequelize, DataTypes, Model} = require('sequelize');
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

/**
 * @author xlr
 * @description pans的关系对象映射
 */
class Pan extends Model {
}

Pan.init({
    id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    url: {
        type: DataTypes.STRING(255),
        unique: true
    },
    code: DataTypes.STRING(20),
    title: DataTypes.STRING(255),
    site_id: DataTypes.BIGINT,
    site_url: DataTypes.STRING(255),
    reachable: DataTypes.BOOLEAN,
    delete_mark: DataTypes.BOOLEAN,
    site_title: DataTypes.STRING(255),
    check_status: DataTypes.BOOLEAN,
    need_code:DataTypes.BOOLEAN,
    used:DataTypes.BOOLEAN,
    code_wrong:DataTypes.BOOLEAN
}, {
    sequelize,
    modelName: 'pan',
    timestamps: false
});

module.exports = Pan;
