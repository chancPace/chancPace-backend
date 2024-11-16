import express from 'express';
import db from './models/index.js';
import dotenv from 'dotenv';
import cors from 'cors';
import config from './config/config.js';

import userRouter from './router/user.js';
import paymentRouter from './router/payment.js';
import spaceRouter from './router/space.js';
import categoryRouter from './router/category.js';
import couponRouter from './router/coupon.js';
import bookingRouter from './router/booking.js';
import reviewRouter from './router/review.js';
import wishlistRouter from './router/wishlist.js';
import nodemailerRouter from './router/nodemailer.js';
import inquiryRouter from './router/inquiry.js';

dotenv.config();

const env = process.env.NODE_ENV || 'development';
const currentConfig = config[env]; // 환경에 맞는 설정 사용

const corsOptions = {
  origin: '*', // 어나니머스 설정?
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
};

const app = express();

const PORT = currentConfig.serverPort; // 현재 환경에 맞는 호스트
const HOST = currentConfig.serverHost; // 현재 환경에 맞는 포트

app.use(express.json());
app.use(cors(corsOptions));

app.get('/', (req, res) => {
  res.send('서버연결 완');
});

app.use('/uploads', express.static('uploads'));

// API 라우터
app.use('/api/user', userRouter);
app.use('/api/payment', paymentRouter);
app.use('/api/space', spaceRouter);
app.use('/api/category', categoryRouter);
app.use('/api/coupon', couponRouter);
app.use('/api/booking', bookingRouter);
app.use('/api/review', reviewRouter);
app.use('/api/wishlist', wishlistRouter);
app.use('/api/nodemailer', nodemailerRouter);
app.use('/api/inquiry', inquiryRouter);

db.sequelize
  //NOTE -  alter: true / 데이터 유지하고 구조만 업데이트
  //NOTE -  force: true / 데이터 초기화 하고 구조 업데이트
  .sync({ force: false })
  .then(() => {
    console.log('데이터베이스와 모델 동기화 완료');
    app.listen(PORT, '0.0.0.0', () => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`개발 환경 / 서버 실행: http://${HOST}:${PORT}`);
      } else if (process.env.NODE_ENV === 'production') {
        console.log(`서버 배포 환경 / 서버 실행: http://${HOST}:${PORT}`);
      }
    });
  })
  .catch((err) => {
    console.error('데이터베이스에 연결 실패:', err);
  });
