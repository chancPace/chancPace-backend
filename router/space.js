import express from 'express';
import { addNewSpace, getSpace, uploadSpaceImage } from '../controller/space.js';

const router = express.Router();

router.post('/add-new-space', uploadSpaceImage, addNewSpace);
router.get('/get-space', getSpace);
export default router;
