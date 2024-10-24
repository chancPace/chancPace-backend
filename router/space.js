import express from 'express';
import { addCategory, addNewSpace, uploadSpaceImage } from '../controller/space.js';

const router = express.Router();

router.post('/add-new-space', uploadSpaceImage, addNewSpace);
router.post('/add-category', addCategory)
export default router;
