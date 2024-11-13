import express from 'express';
import { addInquiry, getAllInquiry, getOneInquiry, updateInquiry } from '../controller/inquiry.js';

const router = express.Router();

//ANCHOR - 문의 등록
router.post('/add-inquiry', addInquiry);
//ANCHOR - 문의 전체 조회
router.get('/get-all-inquiry', getAllInquiry);
//ANCHOR - 문의 1개 조회
router.get('/get-one-inquiry', getOneInquiry);
//ANCHOR - 문의 수정
router.patch('/update-inquiry', updateInquiry);

export default router;