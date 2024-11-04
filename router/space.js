import express from 'express';
import {
  addNewSpace,
  getMySpace,
  getOneSpace,
  getRatingBySpace,
  getSearchSpace,
  getSpace,
  getSpaceByCategory,
  updateSpace,
  uploadSpaceImage,
} from '../controller/space.js';

const router = express.Router();

//ANCHOR - 공간 등록
router.post('/add-new-space', uploadSpaceImage, addNewSpace);
//ANCHOR - 공간 전체 조회
router.get('/get-space', getSpace);
//ANCHOR - 카테고리별 공간 조회
router.get('/get-space-by-category', getSpaceByCategory);
//ANCHOR - 공간 총 별점 조회
router.get('/get-rating-by-space', getRatingBySpace);
//ANCHOR - 검색 기능
router.get('/get-search-space', getSearchSpace);
//ANCHOR - 공간 수정 및 삭제
router.patch('/update-space', uploadSpaceImage, updateSpace);
//ANCHOR - 공간 1개 조회 / 공간 상세페이지
router.get('/get-one-space', getOneSpace);
//ANCHOR - 내가 등록한 공간 전체 조회 & 예약목록 조회 / 호스트
router.get('/get-my-space', getMySpace);

export default router;
