import db from '../models/index.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();
const { User } = db;

const smtpTransport = nodemailer.createTransport({
  // mail 서비스명
  service: process.env.SMTP_SERVICE,
  // mail host
  host: process.env.SMTP_HOST,
  // mail port
  port: process.env.SMTP_PORT,
  auth: {
    // mail 이메일 주소
    user: process.env.SMTP_USER,
    // 해당 이메일 비밀 번호
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

//ANCHOR - 회원가입 / 이메일 인증
export const sendAuthNumber = async (req, res) => {
  try {
    const { email } = req.body;
    const findEmail = await User.findOne({
      where: { email },
    });
    if (findEmail) {
      return res.status(404).json({
        result: false,
        message: '중복된 이메일이 존재합니다.',
      });
    }

    // 6자리 난수 생성
    const authNumber = Math.floor(Math.random() * 888888) + 111111;

    const mailOptions = {
      from: 'chancePace',
      to: email,
      subject: '[chancePace] 이메일 확인 인증번호 안내',
      text: `
      아래 인증번호를 확인하여 이메일 주소 인증을 완료해 주세요.\n
      연락처 이메일 👉 ${email}\n
      인증번호 6자리 👉 ${authNumber}
      `,
    };
    await smtpTransport.sendMail(mailOptions);
    res.status(200).json({
      result: true,
      authNumber: authNumber,
      email: email,
      message: `${email}로 인증 이메일을 성공적으로 전송했습니다.`,
    });
  } catch (error) {
    console.log('이메일 전송 오류', error);

    res.status(500).json({
      result: false,
      message: `${req.body.email}로 인증 이메일 전송에 실패했습니다.`,
      error: error.message,
    });
  }
};

//ANCHOR - 비밀번호 변경 / 이메일 인증
export const findPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const findUser = await User.findOne({
      where: { email: email },
    });
    if (!findUser) {
      return res.status(404).json({
        result: false,
        message: '존재하지 않는 회원입니다',
      });
    }
    // 6자리 난수 생성
    const authNumber = Math.floor(Math.random() * 888888) + 111111;

    const mailOptions = {
      from: 'chancePace',
      to: email,
      subject: '[chancePace] 비밀번호 변경 인증번호 안내',
      text: `
      아래 인증번호를 확인하여 비밀번호 변경 인증을 완료해 주세요.\n
      연락처 이메일 👉 ${email}\n
      인증번호 6자리 👉 ${authNumber}
      `,
    };
    await smtpTransport.sendMail(mailOptions);
    res.status(200).json({
      result: true,
      authNumber: authNumber,
      email: email,
      message: `${email}로 인증 이메일을 성공적으로 전송했습니다.`,
    });
  } catch (error) {
    res.status(500).json({
      result: false,
      message: `${req.body.email}로 인증 이메일 전송에 실패했습니다.`,
      error: error.message,
    });
  }
};
