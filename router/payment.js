import express from 'express';
import { confirm, mypayment } from '../controller/payment.js';

const router = express.Router();

router.post('/confirm', confirm);
router.post('/mypayment',mypayment)

export default router;
