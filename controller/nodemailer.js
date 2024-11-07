import db from '../models/index.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();
const {} = db;

const smtpTransport = nodemailer.createTransport({
  // mail 서비스명
  service: process.env.SMTP_SERVICE,
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

export const sendAuthNumber = async (req, res) => {
  try {
    const { email } = req.body;

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
      data: authNumber,
      message: `${email}로 인증 이메일을 성공적으로 전송했습니다.`,
    });
  } catch (error) {
    console.log('이메일 전송 오류', error);

    res.status(500).json({
      result: false,
      message: `${req.body.email}로 인증 이메일 전송에 실패했습니다.`,
      error: error.message,
    });
  } finally {
    smtpTransport.close();
  }
};
