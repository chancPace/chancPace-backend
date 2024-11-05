import express from 'express';
import { getAllPayment, getOnePayment, listUserPayments, Refund, verifyPayment } from '../controller/payment.js';

const router = express.Router();

//ANCHOR - 결제 승인
router.post('/verify-payment', verifyPayment);
//ANCHOR - 결제 정보 조회
router.post('/list-user-payments', listUserPayments);
//ANCHOR - 결제 취소
router.post('/refund', Refund);
//ANCHOR - 결제 1개 조회
router.get('/get-one-payment', getOnePayment);
//ANCHOR - 결제 전체 조회
router.get('/get-all-payment', getAllPayment);

export default router;
