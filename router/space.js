import express from 'express';
import {
  addNewSpace,
  getRatingBySpace,
  getSearchSpace,
  getSpace,
  getSpaceByCategory,
  updatedSpace,
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
router.patch('/updated-space', updatedSpace);

export default router;
