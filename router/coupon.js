import express from 'express';
import { addCoupon } from '../controller/coupon.js';
const router = express.Router();

router.post('/add-coupon', addCoupon);

export default router;
