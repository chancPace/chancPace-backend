import db from '../models/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { where } from 'sequelize';

const { User } = db;

//ANCHOR - 사용자 정보 업데이트 공통 함수
const updateUserData = async (id, updatedData, res) => {
  const user = await User.findOne({ where: { id } });
  if (!user) {
    return res.status(404).json({
      result: false,
      message: '사용자를 찾을 수 없습니다.',
    });
  }
  Object.keys(updatedData).forEach((key) => {
    if (updatedData[key] === undefined || updatedData[key] === null || updatedData[key] === '') {
      delete updatedData[key];
    }
  });
  const [updated] = await User.update(updatedData, { where: { id } });
  return updated;
};

//ANCHOR - 회원가입
export const signup = async (req, res) => {
  try {
    const { email, password, role, agreed, adminSecretKey } = req.body;

    if (role === 'admin') {
      if (adminSecretKey !== process.env.ADMIN_SECRET_KEY) {
        return res.status(403).json({ result: false, message: '유효하지 않은 관리자 비밀키입니다.' });
      }
    }

    const find = await User.findOne({ where: { email } });
    if (find) {
      return res.status(400).json({ result: false, message: '이미 존재하는 회원입니다.' });
    }

    const encryption = await bcrypt.hash(password, 10);
    await User.create({
      email,
      password: encryption,
      role,
      isMarketingAgreed: agreed,
    });

    res.status(200).json({ result: true, message: role === 'admin' ? '관리자 회원가입 성공' : '회원가입 성공' });
  } catch (error) {
    res.status(500).json({ result: false, message: '서버오류' });
  }
};

//ANCHOR - 로그인
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const find = await User.findOne({
      where: {
        email,
        accountStatus: 'ACTIVE',
      },
    });

    if (find) {
      const decryption = await bcrypt.compare(password, find.password);

      if (decryption) {
        const userInfo = {
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
        };

        // 토큰 발급
        const token = jwt.sign({ user: jwtToken }, process.env.JWT_ACCESS_SECRET, {
          expiresIn: process.env.JWT_ACCESS_LIFETIME,
        });

        res.status(200).json({
          message: '로그인 성공. 토큰이 발급 되었습니다.',
          token: token,
          data: userInfo,
        });
      } else {
        return res.status(401).json({
          result: false,
          data: null,
          message: '비밀번호가 틀렸습니다',
        });
      }
    } else {
      return res.status(404).json({
        result: false,
        data: null,
        message: '회원이 아니거나 계정이 활성화되지 않았습니다.',
      });
    }
  } catch (error) {
    res.status(500).json({ result: false, message: '서버오류', error });
  }
};

//ANCHOR - 내 정보 조회
export const getUser = async (req, res) => {
  try {
    // Bearer 토큰 추출
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(404).json({
        result: false,
        message: '토큰이 존재하지 않습니다.',
      });
    }

    let jwtUserInfo;
    try {
      jwtUserInfo = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (error) {
      return res.status(401).json({
        result: false,
        message: '토큰이 유효하지 않습니다.',
      });
    }

    const user = await User.findOne({ where: { email: jwtUserInfo.user.email } });

    if (!user) {
      return res.status(404).json({
        result: true,
        message: '유저가 존재하지 않습니다.',
      });
    }

    res.status(200).json({
      result: true,
      data: user,
      message: '유저 정보 조회에 성공했습니다.',
    });
  } catch (error) {
    res.status(500).json({
      result: false,
      message: '서버오류',
      error,
    });
  }
};

//ANCHOR - 전체 회원 정보 조회
export const getAllUser = async (req, res) => {
  try {
    const allUser = await User.findAll();
    res.status(200).json({
      result: true,
      data: allUser,
      message: '전체 회원 정보를 조회에 성공했습니다.',
    });
  } catch (error) {
    res.status(500).json({
      result: false,
      message: '서버오류',
      error,
    });
  }
};

//ANCHOR - 회원 정보 수정
export const updateUser = async (req, res) => {
  try {
    const { id, userName, gender, email, phoneNumber, hostBankAccount, role, accountStatus, isMarketingAgreed } =
      req.body;

    const user = await User.findOne({ where: { id } });
    if (!user) {
      return res.status(404).json({
        result: false,
        message: '해당 이메일의 사용자를 찾을 수 없습니다.',
      });
    }

    const updatedData = {
      userName,
      gender,
      email,
      phoneNumber,
      hostBankAccount,
      role,
      accountStatus,
      isMarketingAgreed,
    };

    const updated = await updateUserData(id, updatedData);
    res.status(200).json({
      result: true,
      data: updated,
      message: `${user.email}님의 정보를 성공적으로 업데이트했습니다.`,
    });
  } catch (error) {
    res.status(500).json({
      result: false,
      message: '서버오류',
      error: error.message,
    });
  }
};

//ANCHOR - 내 정보 수정 이전 비밀번호 확인
export const checkPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(404).json({
        result: false,
        message: '토큰이 존재하지 않습니다.',
      });
    }

    let jwtUserInfo;
    try {
      jwtUserInfo = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (error) {
      return res.status(401).json({
        result: false,
        message: '토큰이 유효하지 않습니다.',
      });
    }

    const find = await User.findOne({ where: { email: jwtUserInfo.user.email } });

    if (find) {
      const decryption = await bcrypt.compare(password, find.password);
      if (decryption) {
        res.status(200).json({
          result: true,
          message: '회원 인증 성공, 내 정보 수정 가능합니다.',
        });
      } else {
        return res.status(401).json({
          result: false,
          message: '비밀번호가 틀렸습니다',
        });
      }
    } else {
      return res.status(404).json({
        result: true,
        message: '유저가 존재하지 않습니다.',
      });
    }
  } catch (error) {
    res.status(500).json({
      result: false,
      message: '서버오류',
      error: error.message,
    });
  }
};

//ANCHOR - 내 정보 업데이트
export const updateMyProfile = async (req, res) => {
  try {
    const { id, userName, gender, email, password, phoneNumber, hostBankAccount, isMarketingAgreed } = req.body;
    const user = await User.findOne({ where: { id } });
    if (!user) {
      return res.status(404).json({
        result: false,
        message: '회원 정보를 찾을 수 없습니다.',
      });
    }
    const updatedData = {
      userName,
      gender,
      email,
      password,
      phoneNumber,
      hostBankAccount,
      isMarketingAgreed,
    };

    if (password) {
      updatedData.password = await bcrypt.hash(password, 10);
    }

    const updated = await updateUserData(id, updatedData);
    res.status(200).json({
      result: true,
      message: `${user.email}님의 정보가 업데이트 되었습니다.`,
    });
  } catch (error) {
    res.status(500).json({
      result: false,
      message: '서버오류',
      error: error.message,
    });
  }
};
