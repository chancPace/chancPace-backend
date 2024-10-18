import express from 'express';
import { getUserDataByToken, login, signup } from '../controller/user.js';

const router = express.Router();

// 회원가입
router.post('/signup', signup);
// 로그인
router.post('/login', login);
// 토큰을 이용해 유저 정보 가져오기
router.post('/verify-token-user', getUserDataByToken);

export default router;
