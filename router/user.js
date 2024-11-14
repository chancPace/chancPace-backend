import express from 'express';
import {
  checkPassword,
  getAllUser,
  getOneUser,
  getSearchUser,
  getUser,
  login,
  signup,
  updateMyProfile,
  updatePassword,
  updateUser,
} from '../controller/user.js';

const router = express.Router();

//ANCHOR - 회원가입
router.post('/signup', signup);
//ANCHOR - 로그인
router.post('/login', login);
//ANCHOR - 전체 회원 조회
router.get('/get-all-user', getAllUser);
//ANCHOR - 내 정보 조회
router.get('/get-user', getUser);
//ANCHOR - 회원 정보 수정
router.patch('/update-user', updateUser);
//ANCHOR - 내 정보 수정 이전 비밀번호 확인
router.post('/check-password', checkPassword);
//ANCHOR - 내 정보 수정
router.patch('/update-my-profile', updateMyProfile);
//ANCHOR - 유저 정보 조회 / 관리자
router.get('/get-one-user', getOneUser);
//ANCHOR - 검색 기능 / 관리자
router.get('/get-search-user', getSearchUser);
//ANCHOR - 비밀번호 변경
router.patch('/update-password',updatePassword)

export default router;
