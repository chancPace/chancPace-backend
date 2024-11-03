import express from 'express';
import { addCoupon, getAllCoupon, updateCoupon } from '../controller/coupon.js';
const router = express.Router();

//ANCHOR - 쿠폰 생성
router.post('/add-coupon', addCoupon);
//ANCHOR - 쿠폰 수정 및 삭제
router.patch('/update-coupon', updateCoupon);
//ANCHOR - 쿠폰 전체 조회 / 관리자
router.get('/get-all-coupon', getAllCoupon);

export default router;
