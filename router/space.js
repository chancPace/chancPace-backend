import express from 'express';
import { addNewSpace } from '../controller/space.js';

const router = express.Router();

router.get('/addNewSpace', addNewSpace);

export default router;
