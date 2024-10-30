import express from 'express';
import { listUserPayments, verifyPayment } from '../controller/payment.js';

const router = express.Router();

router.post('/verify-payment', verifyPayment);
router.post('/list-user-payments', listUserPayments);

export default router;
