import express from 'express';
import { checkPassword, getAllUser, getUser, login, signup, updateMyProfile, updateUser } from '../controller/user.js';

const router = express.Router();

//ANCHOR - 회원가입
router.post('/signup', signup);
//ANCHOR - 로그인
router.post('/login', login);
//ANCHOR - 전체 회원 조회
router.get('/get-all-user', getAllUser);
//ANCHOR - 내 정보 조회
router.post('/get-user', getUser);
//ANCHOR - 회원 정보 수정
router.patch('/update-user', updateUser);
//ANCHOR - 내 정보 수정 이전 비밀번호 확인
router.post('/check-password', checkPassword);
//ANCHOR - 내 정보 수정
router.patch('/update-my-profile', updateMyProfile);

export default router;
