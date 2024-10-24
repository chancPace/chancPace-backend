import express from 'express';
import { addCategory, getCategories } from '../controller/category.js';

const router = express.Router();

router.post('/add-category',addCategory);
router.get('/', getCategories);

export default router;
