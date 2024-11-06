import dotenv from 'dotenv';
dotenv.config();

const config = {
  development: {
    username: process.env.DB_USERNAME || 'kdt13',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_DATABASE || 'chancepace',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    serverHost: process.env.LOCAL_HOST || 'localhost',
    serverPort: parseInt(process.env.LOCAL_PORT) || 4000,
  },
  production: {
    username: process.env.DB_USERNAME || 'kdt13',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_DATABASE || 'chancepace',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    serverHost: process.env.SERVER_HOST || '13.124.126.24',
    serverPort: parseInt(process.env.SERVER_PORT) || 4000,
  },
};

export default config;
