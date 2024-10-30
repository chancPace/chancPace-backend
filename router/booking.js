import express from 'express';
import { addBooking, getBooking, getBookingBySpace } from '../controller/booking.js';

const router = express.Router();

//ANCHOR - 공간 예약 신청
router.post('/add-booking', addBooking);
//ANCHOR - 공간 예약 전체 조회
router.get('/get-booking', getBooking);
//ANCHOR - 해당하는 공간 예약 조회
router.get('/get-booking-by-space', getBookingBySpace);

export default router;
