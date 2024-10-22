import express from 'express';
import { addNewSpace, uploadSpaceImage } from '../controller/space.js';

const router = express.Router();

router.post('/add-new-space', uploadSpaceImage, addNewSpace);

export default router;
