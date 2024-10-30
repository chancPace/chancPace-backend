import express from 'express';
import { addNewSpace, getSpace, getSpaceByCategory, uploadSpaceImage } from '../controller/space.js';

const router = express.Router();

//ANCHOR - 공간 등록
router.post('/add-new-space', uploadSpaceImage, addNewSpace);
//ANCHOR - 공간 전체 조회
router.get('/get-space', getSpace);
//ANCHOR - 카테고리별 공간 조회
router.get('/get-space-by-category', getSpaceByCategory);
export default router;
