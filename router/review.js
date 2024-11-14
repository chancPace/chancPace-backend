import express from 'express';
import {
  addReview,
  getAllReview,
  getMyReview,
  getReviewBySpace,
  updateRatingBySpace,
  updateReview,
  getAllReviewAdmin,
  getOneReview,
} from '../controller/review.js';

const router = express.Router();

//ANCHOR - 리뷰 생성
router.post('/add-review', addReview);

//ANCHOR - 공간 별점 평균 값 구하기
router.patch('/update-rating-by-space', updateRatingBySpace);

//ANCHOR - 리뷰 전체 조회
router.get('/get-all-review', getAllReview);

//ANCHOR - 리뷰 전체 조회-관리자
router.get('/get-all-review-admin', getAllReviewAdmin);

//ANCHOR - 공간 리뷰 전체 조회 / 최신순
router.get('/get-review-by-space', getReviewBySpace);

//ANCHOR - 리뷰 수정
router.patch('/update-review', updateReview);

//ANCHOR - 내가 작성한 리뷰 조회
router.get('/get-my-review', getMyReview);

//ANCHOR - 리뷰 상세페이지
router.get('/get-my-review', getOneReview);

export default router;
