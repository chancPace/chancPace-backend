import express from 'express';
import { listUserPayments, Refund, verifyPayment } from '../controller/payment.js';

const router = express.Router();

//ANCHOR - 결제 승인
router.post('/verify-payment', verifyPayment);
//ANCHOR - 결제 정보 조회
router.post('/list-user-payments', listUserPayments);
//ANCHOR - 결제 취소
router.post('/refund', Refund);

export default router;
