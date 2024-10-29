import express from 'express';
import { getAllUser, getUser, login, removeUser, signup } from '../controller/user.js';

const router = express.Router();

//ANCHOR - 회원가입
router.post('/signup', signup);
//ANCHOR - 로그인
router.post('/login', login);
//ANCHOR - 전체 회원 조회
router.get('/get-all-user', getAllUser);
//ANCHOR - 내 정보 조회
router.post('/get-user', getUser);
//ANCHOR - 회원 탈퇴
router.patch('/remove-user', removeUser)

export default router;
