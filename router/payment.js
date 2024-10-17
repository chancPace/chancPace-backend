import express from 'express';
import { listUserPayments, verifyPayment } from '../controller/payment.js';

const router = express.Router();

router.post('/verifyPayment', verifyPayment);
router.post('/listUserPayments', listUserPayments);

export default router;
