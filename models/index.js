import Sequelize from 'sequelize';
import configFile from '../config/config.js';
import UserModel from './user.js';

const env = process.env.NODE_ENV || 'development';
const config = configFile[env];
const db = {};

const sequelize = new Sequelize(config.database, config.username, config.password, config);

// 모델 정의
db.User = UserModel(sequelize);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
