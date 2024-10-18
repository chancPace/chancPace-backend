import express from 'express';
import { addNewSpace } from '../controller/space.js';

const router = express.Router();

router.get('/add-new-space', addNewSpace);

export default router;
