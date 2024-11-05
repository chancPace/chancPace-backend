import axios from 'axios';
import db from '../models/index.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { PaymentStatuses } from '../config/enum.js';

dotenv.config();

const { Payment, User, Booking, Space } = db;

const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY;
const JWT_ACCESS_SECRET_KEY = process.env.JWT_ACCESS_SECRET;

if (!TOSS_SECRET_KEY || !JWT_ACCESS_SECRET_KEY) {
  throw new Error('환경 변수가 설정되지 않았습니다. TOSS_SECRET_KEY 및 JWT_ACCESS_SECRET_KEY를 확인하세요.');
}

//ANCHOR - 결제 확인 및 처리
export const verifyPayment = async (req, res) => {
  try {
    const { paymentKey, orderId, amount } = req.body;
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
    console.log(response.data, '백엔드데이터확인');
    const paymentData = {
      paymentKey: paymentKey,
      orderId: orderId,
      paymentPrice: amount,
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
    const { paymentKey, cancelReason } = req.body;
    const url = `https://api.tosspayments.com/v1/payments/${paymentKey}/cancel`;
    const options = {
      headers: {
        Authorization: `Basic ${Buffer.from(TOSS_SECRET_KEY + ':').toString('base64')}`,
        'Content-Type': 'application/json',
      },
    };
    const data = {
      cancelReason,
    };
    const response = await axios.post(url, data, options);
    res.status(200).json({
      result: true,
      data: response.data,
      message: '결제가 성공적으로 취소되었습니다.',
    });
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
    return res.status(500).json({
      result: false,
      message: '서버 오류',
      error: error.message,
    });
  }
};
