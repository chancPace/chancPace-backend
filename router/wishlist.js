import express from 'express';
import { addWishlist, getWishlist, removeWishlist } from '../controller/wishlist.js';

const router = express.Router();

//ANCHOR - 찜 등록
router.post('/add-wishlist', addWishlist);
//ANCHOR - 찜 삭제
router.delete('/remove-wishlist', removeWishlist);
//ANCHOR - 찜 조회
router.get('/get-wishlist', getWishlist);

export default router;
