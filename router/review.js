import express from 'express';
import { addReview, getAllReview, getReviewBySpace, updateReview } from '../controller/review.js';

const router = express.Router();

//ANCHOR - 리뷰 생성
router.post('/add-review', addReview);

//ANCHOR - 리뷰 전체 조회
router.get('/get-all-review', getAllReview);

//ANCHOR - 공간 리뷰 전체 조회 / 최신순
router.get('/get-review-by-space', getReviewBySpace);

//ANCHOR - 리뷰 수정
router.patch('/update-review', updateReview);

export default router;
