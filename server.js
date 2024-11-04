import express from 'express';
import db from './models/index.js';
import dotenv from 'dotenv';
import cors from 'cors';

import userRouter from './router/user.js';
import paymentRouter from './router/payment.js';
import spaceRouter from './router/space.js';
import categoryRouter from './router/category.js';
import couponRouter from './router/coupon.js';
import bookingRouter from './router/booking.js';
import reviewRouter from './router/review.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());

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

db.sequelize
  //NOTE -  alter: true / 데이터 유지하고 구조만 업데이트
  //NOTE -  force: true / 데이터 초기화 하고 구조 업데이트
  .sync({ force: false })
  .then(() => {
    console.log('데이터베이스와 모델 동기화 완료');
    app.listen(PORT, () => {
      console.log(`서버 실행: http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('데이터베이스에 연결 실패:', err);
  });
