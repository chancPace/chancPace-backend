import express from 'express';
import { findPassword, sendAuthNumber } from '../controller/nodemailer.js';

const router = express.Router();

//ANCHOR - 회원가입 / 이메일 인증
router.post('/send-auth-number', sendAuthNumber);
//ANCHOR - 비밀번호 변경 / 이메일 인증
router.post('/find-password', findPassword);

export default router;
