import db from '../models/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const User = db.User;

// 회원가입
export const signup = async (req, res) => {
  try {
    const { email, password, role, agreed } = req.body;
    const find = await User.findOne({ where: { email } });

    if (find) {
      res.status(400).json({ result: false, message: '이미 존재하는 회원입니다.' });
    } else {
      const encryption = await bcrypt.hash(password, 10);

      await User.create({
        email,
        password: encryption,
        role,
        isMarketingAgreed: agreed,
      });

      res.json({ result: true, message: '회원가입 성공' });
    }
  } catch (error) {
    res.status(500).json({ result: false, message: '서버오류' });
  }
};

// 로그인
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const find = await User.findOne({ where: { email } });

    if (find) {
      const decryption = await bcrypt.compare(password, find.password);

      if (decryption) {
        const response = {
          id: find.id,
          email: find.email,
          userName: find.userName,
          role: find.role,
          lastLogin: find.lastLogin,
        };

        // 현재 접속시간 / 한국 기준
        const korLogin = new Date(new Date().getTime() + 9 * 60 * 60 * 1000);
        await User.update({ lastLogin: korLogin }, { where: { email } });

        const jwtToken = {
          id: find.id,
          email: find.email,
          userName: find.userName,
        };

        // 토큰 발급
        const token = jwt.sign({ user: jwtToken }, process.env.JWT_ACCESS_SECRET, {
          expiresIn: process.env.JWT_ACCESS_LIFETIME,
        });

        res.status(200).json({
          message: '로그인 성공. 토큰이 발급 되었습니다.',
          token: token,
          response: response,
        });
      } else {
        res.status(401).json({ result: false, response: null, message: '비밀번호가 틀렸습니다' });
      }
    } else {
      res.status(404).json({ result: false, response: null, message: '회원이 아닙니다.' });
    }
  } catch (error) {
    res.status(500).json({ result: false, message: '서버오류' });
  }
};