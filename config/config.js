import dotenv from 'dotenv';
dotenv.config();

const config = {
  development: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    dialect: 'mysql',
    serverHost: process.env.LOCAL_HOST,
    serverPort: parseInt(process.env.LOCAL_PORT),
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    dialect: 'mysql',
    serverHost: process.env.SERVER_HOST,
    serverPort: parseInt(process.env.SERVER_PORT),
  },
};

export default config;
