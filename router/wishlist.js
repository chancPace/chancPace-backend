import express from 'express';
import { addWishlist } from '../controller/wishlist.js';

const router = express.Router();

//ANCHOR - 찜 등록
router.post('/add-wishlist', addWishlist);

export default router;