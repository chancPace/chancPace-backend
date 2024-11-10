import express from 'express';
import { addCategory, getCategory, removeCategory, updateCategory } from '../controller/category.js';

const router = express.Router();

//ANCHOR - 카데고리 등록
router.post('/add-category', addCategory);

//ANCHOR - 카테고리 조회
router.get('/get-category', getCategory);

//ANCHOR - 카테고리 삭제
router.delete('/remove-category', removeCategory);

//ANCHOR - 카테고리 수정
router.patch('/update-category', updateCategory);

export default router;
