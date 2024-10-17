const config = {
  development: {
      username: process.env.DB_USERNAME || 'kdt13',
      password: process.env.DB_PASSWORD || '1234',
      database: process.env.DB_DATABASE || 'chancepace',
      host: process.env.DB_HOST || 'localhost',
      dialect: 'mysql',
  },
  production: {
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      host: process.env.DB_HOST,
      dialect: 'mysql',
  },
};

export default config;
