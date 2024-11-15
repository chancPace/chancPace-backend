import axios from 'axios';
import db from '../models/index.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { PaymentStatuses, BookingStatuses } from '../config/enum.js';

dotenv.config();

const { Payment, User, Booking, Space, Image } = db;

const smtpTransport = nodemailer.createTransport({
  // mail 서비스명
  service: 'gmail',
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

const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY;
const JWT_ACCESS_SECRET_KEY = process.env.JWT_ACCESS_SECRET;

if (!TOSS_SECRET_KEY || !JWT_ACCESS_SECRET_KEY) {
  throw new Error('환경 변수가 설정되지 않았습니다. TOSS_SECRET_KEY 및 JWT_ACCESS_SECRET_KEY를 확인하세요.');
}

//ANCHOR - 결제 확인 및 처리
export const verifyPayment = async (req, res) => {
  try {
    const { paymentKey, orderId, amount, couponPrice } = req.body;
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
      jwtUserInfo = jwt.verify(token, JWT_ACCESS_SECRET_KEY);
    } catch (error) {
      return res.status(401).json({ result: false, message: '유효하지 않은 토큰입니다.' });
    }

    const user = await User.findOne({
      where: { email: jwtUserInfo.user.email },
    });

    if (!user) {
      return res.status(404).json({ result: false, message: '사용자를 찾을 수 없습니다.' });
    }

    let response;
    try {
      response = await axios.post(
        'https://api.tosspayments.com/v1/payments/confirm',
        {
          paymentKey: paymentKey,
          orderId: orderId,
          amount: amount,
        },
        {
          headers: {
            Authorization: `Basic ${Buffer.from(TOSS_SECRET_KEY + ':').toString('base64')}`,
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (axiosError) {
      console.error('결제 확인 요청 실패:', axiosError.response?.data || axiosError.message);
      return res.status(400).json({
        result: false,
        message: '결제 확인 요청에 실패했습니다.',
        error: axiosError.response?.data || axiosError.message,
      });
    }
    const paymentData = {
      paymentKey: paymentKey,
      orderId: orderId,
      paymentPrice: amount,
      couponPrice,
      paymentStatus: PaymentStatuses.COMPLETED,
      paymentMethod: response.data.method || 'UNKNOWN',
      userId: user.id,
      cardNumber: response.data.card ? response.data.card.number : 'UNKNOWN',
      cardType: response.data.card ? response.data.card.cardType : 'UNKNOWN',
      suppliedPrice: response.data.suppliedAmount,
      vat: response.data.vat,
    };

    try {
      const newPayment = await Payment.create(paymentData);
      res.status(200).json({
        result: true,
        data: newPayment,
        message: '결제 성공',
      });
    } catch (dbError) {
      console.error('DB 저장 실패:', dbError);
      return res.status(500).json({
        result: false,
        message: '결제 정보를 저장하는 데 실패했습니다.',
      });
    }
  } catch (error) {
    console.error('결제 검증 실패:', error.response?.data || error.message);

    res.status(400).json({
      result: false,
      message: '결제 검증 실패',
      error: error.response?.data || error.message,
    });
  }
};

//ANCHOR - 사용자 결제 정보 조회
export const listUserPayments = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ result: false, message: '사용자를 찾을 수 없습니다.' });
    }

    const payment = await Payment.findAll({ where: { userId: user.id } });

    //REVIEW - 빈 배열일 때 if문 사용 법
    if (payment.length === 0) {
      return res.status(200).json({
        result: true,
        payment: [],
        message: '결제 정보가 없습니다.',
      });
    }

    res.status(200).json({
      result: true,
      data: payment,
      message: '결제 정보를 성공적으로 가져왔습니다.',
    });
  } catch (error) {
    console.error('error', error);
    res.status(500).json({
      result: false,
      message: '서버오류',
      error: error.message,
    });
  }
};

//ANCHOR - 결제 취소
export const Refund = async (req, res) => {
  try {
    const {
      // 취소를 진행 할 예약
      bookingId,
      // 프론트에서 결제 취소 사유 즉, cancelReason를 받아야함
      // 프론트에서 "고객 요청에 따른 취소" 라고 보내기
      cancelReason,
    } = req.body;
    // 결제 취소할려는 예약을 찾음
    const findBooking = await Booking.findOne({
      where: { id: bookingId },
      include: [{ model: User }, { model: Payment }, { model: Space, include: [{ model: Image }] }],
    });
    // 예약이 없다면 리턴
    if (!findBooking) {
      return res.status(404).json({
        result: false,
        message: '예약이 존재하지 않습니다.',
      });
    }
    // 예약데이터의 결제 paymentKey를 꺼냄
    const paymentKey = findBooking.payment.dataValues.paymentKey;
    // paymentKey로 토스에게 결제 취소 요청
    const url = `https://api.tosspayments.com/v1/payments/${paymentKey}/cancel`;
    const options = {
      headers: {
        Authorization: `Basic ${Buffer.from(TOSS_SECRET_KEY + ':').toString('base64')}`,
        'Content-Type': 'application/json',
      },
    };
    const data = { cancelReason };
    const response = await axios.post(url, data, options);
    // 결제취소가 된다면
    if (response.status === 200) {
      // 예약 상태 취소로 변경
      await Booking.update({ bookingStatus: BookingStatuses.CANCELLED }, { where: { id: findBooking.dataValues.id } });
      // 결제 상태 취소로 변경
      await Payment.update(
        { paymentStatus: PaymentStatuses.REFUNDED },
        { where: { id: findBooking.payment.dataValues.id } }
      );
      // 유저 데이터
      const user = findBooking.user.dataValues;
      // 공간 데이터
      const space = findBooking.space.dataValues;
      // 예약 데이터
      const booking = findBooking.dataValues;
      // 결제 상태가 취소된 후에 이메일을 발송
      const mailOptions = {
        from: 'chancePace',
        to: user.email,
        subject: `[chancePace] ${space.spaceName} 예약 결제가 취소되었습니다.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <h2 style="text-align: center; color: #E53935;">결제 취소 완료</h2>
            <p>안녕하세요, ${user.userName}님!</p>
            <p><strong>${space.spaceName}</strong> 공간 예약의 결제가 취소되었습니다. 이용해 주셔서 감사합니다.</p>
            
            <div style="text-align: center; margin-top: 20px;">
              <img src="${space.images[0]?.imageUrl}" alt="${space.spaceName} 이미지" style="width: 100%; max-width: 400px; border-radius: 10px;"/>
            </div>
            
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
              <tr>
                <th style="text-align: left; padding: 8px; background-color: #f2f2f2;">이용 공간</th>
                <td style="padding: 8px;">${space.spaceName}</td>
              </tr>
              <tr>
                <th style="text-align: left; padding: 8px; background-color: #f2f2f2;">예약 날짜</th>
                <td style="padding: 8px;">${booking.startDate}</td>
              </tr>
              <tr>
                <th style="text-align: left; padding: 8px; background-color: #f2f2f2;">이용 시간</th>
                <td style="padding: 8px;">${booking.startTime}시 - ${booking.endTime}시</td>
              </tr>
              <tr>
                <th style="text-align: left; padding: 8px; background-color: #f2f2f2;">취소 사유</th>
                <td style="padding: 8px;">${cancelReason}</td>
              </tr>
            </table>
      
            <p style="margin-top: 20px;">결제 취소와 관련하여 궁금한 사항이 있으시면 언제든지 문의해 주세요!</p>
            <p>감사합니다.<br><strong>chancePace</strong> 팀 드림</p>
      
            <hr style="margin-top: 30px; border: 0; border-top: 1px solid #ddd;">
            <p style="font-size: 0.9em; color: #555;">
              본 메일은 발신 전용입니다. 회신은 처리되지 않습니다.
            </p>
          </div>
        `,
      };

      await smtpTransport.sendMail(mailOptions);

      res.status(200).json({
        result: true,
        data: response.data,
        message: '결제가 성공적으로 취소되었습니다.',
      });
    } else {
      return res.status(400).json({
        return: false,
        message: '결제취소 실패',
      });
    }
  } catch (error) {
    return res.status(500).json({
      result: false,
      message: '결제 취소 요청에 실패했습니다.',
      error: error.message,
    });
  }
};

//ANCHOR - 결제 1개 조회
export const getOnePayment = async (req, res) => {
  try {
    const { paymentId } = req.query;
    const findPayment = await Payment.findOne({
      where: { id: paymentId },
      include: [{ model: Booking, include: [{ model: Space }] }, { model: User }],
    });
    if (!findPayment) {
      return res.status(404).json({
        result: false,
        message: '결제 기록이 없습니다.',
      });
    }
    res.status(200).json({
      result: true,
      data: findPayment,
      message: '하나의 결제 조회에 성공했습니다.',
    });
  } catch (error) {
    res.status(500).json({
      result: false,
      message: '서버 오류',
      error: error.message,
    });
  }
};

//ANCHOR - 결제 전체 조회
export const getAllPayment = async (req, res) => {
  try {
    const getPayments = await Payment.findAll();
    if (!getPayments) {
      return res.status(404).json({
        result: false,
        message: '결제 정보가 존재하지 않습니다.',
      });
    }
    res.status(200).json({
      result: true,
      data: getPayments,
      message: '결제 전체 조회를 성공했습니다',
    });
  } catch (error) {
    res.status(500).json({
      result: false,
      message: '서버 오류',
      error: error.message,
    });
  }
};
