import express from 'express';
import { sendAuthNumber } from '../controller/nodemailer.js';

const router = express.Router();

//ANCHOR - 이메일 인증 난수 생성
router.post('/send-auth-number',sendAuthNumber)

export default router;
