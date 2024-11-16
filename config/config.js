import dotenv from 'dotenv';
dotenv.config();

const config = {
  development: {
    username: process.env.DB_USERNAME_LOCAL,
    password: process.env.DB_PASSWORD_LOCAL,
    database: process.env.DB_DATABASE_LOCAL,
    host: process.env.DB_HOST_LOCAL,
    port: process.env.DB_PORT_LOCAL, // 로컬 포트 추가
    dialect: 'mysql',
    serverHost: process.env.LOCAL_HOST, // 로컬 서버 호스트
    serverPort: process.env.LOCAL_PORT, // 로컬 서버 포트
  },
  production: {
    username: process.env.DB_USERNAME_AWS,
    password: process.env.DB_PASSWORD_AWS,
    database: process.env.DB_DATABASE_AWS,
    host: process.env.DB_HOST_AWS,
    port: process.env.DB_PORT_AWS, // AWS 포트 추가
    dialect: 'mysql',
    serverHost: process.env.SERVER_HOST, // AWS 서버 호스트
    serverPort: process.env.SERVER_PORT, // AWS 서버 포트
  },
};

export default config;
