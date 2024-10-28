import express from 'express';
import {
  addBigCategory,
  addSmallCategory,
  getBigCategory,
  getSmallCategoriesByBigCategory,
  getSmallCategory,
  removeBigCategory,
  removeSmallCategory,
} from '../controller/category.js';

const router = express.Router();

//ANCHOR - 카데고리 등록
router.post('/add-big-category', addBigCategory);
router.post('/add-small-category', addSmallCategory);

//ANCHOR - 카테고리 조회
router.get('/get-big-category', getBigCategory);
router.get('/get-small-category', getSmallCategory);
router.get('/get-small-category-by-big-category', getSmallCategoriesByBigCategory);

//ANCHOR - 카테고리 삭제
router.delete('/remove-big-category', removeBigCategory);
router.delete('/remove-small-category', removeSmallCategory);

export default router;
