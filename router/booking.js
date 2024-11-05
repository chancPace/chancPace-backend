import express from 'express';
import {
  addBooking,
  cancelBooking,
  getBooking,
  getBookingBySpace,
  getOneBooking,
  getSearchBooking,
} from '../controller/booking.js';

const router = express.Router();

//ANCHOR - 공간 예약 신청
router.post('/add-booking', addBooking);
//ANCHOR - 공간 예약 전체 조회
router.get('/get-booking', getBooking);
//ANCHOR - 해당하는 공간 예약 조회
router.get('/get-booking-by-space', getBookingBySpace);
//ANCHOR - 예약 취소
router.patch('/cancel-booking', cancelBooking);
//ANCHOR - 예약 리스트 검색 기능 / 관리자
router.get('/get-search-booking', getSearchBooking);
//ANCHOR - 상세 페이지
router.get('/get-one-booking', getOneBooking);

export default router;
