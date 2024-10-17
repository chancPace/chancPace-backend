import express from 'express';
import db from './models/index.js';
import dotenv from 'dotenv';
import cors from 'cors';

import userRouter from './router/user.js';
import paymentRouter from "./router/payment.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('서버연결 완');
});

// API 라우터
app.use('/api/user', userRouter);
app.use('/api/payment', paymentRouter);

db.sequelize
  .sync({ force: false })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`서버 실행: http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('데이터베이스에 연결 실패:', err);
  });
