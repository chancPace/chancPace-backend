import axios from 'axios';
import db from '../models/index.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const User = db.User;
const Payment = db.Payment;

const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY;
const JWT_ACCESS_SECRET_KEY = process.env.JWT_ACCESS_SECRET;

if (!TOSS_SECRET_KEY || !JWT_ACCESS_SECRET_KEY) {
  throw new Error('환경 변수가 설정되지 않았습니다. TOSS_SECRET_KEY 및 JWT_ACCESS_SECRET_KEY를 확인하세요.');
}

//ANCHOR - 결제 확인 및 처리
export const verifyPayment = async (req, res) => {
  try {
    const { paymentKey, orderId, amount, userToken } = req.body;

    let decodeToken;
    try {
      decodeToken = jwt.verify(userToken, JWT_ACCESS_SECRET_KEY);
      console.log('🚀 ~ confirm ~ decodeToken:', decodeToken);
    } catch (error) {
      return res.status(401).json({ result: false, message: '유효하지 않은 토큰입니다.' });
    }

    const { email } = decodeToken.user;
    const user = await User.findOne({ where: { email } });

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
      priceStatus: 'COMPLETED',
      paymentMethod: response.data.method || 'UNKNOWN',
      userId: user.id,
    };

    try {
      await Payment.create(paymentData);
    } catch (dbError) {
      console.error('DB 저장 실패:', dbError);
      return res.status(500).json({ result: false, message: '결제 정보를 저장하는 데 실패했습니다.' });
    }

    res.status(200).json({ result: true, data: response.data, message: '결제 성공' });
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

    const userID = user.id;
    const payment = await Payment.findAll({ where: { userID } });

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
    res.status(500).json({ result: false, message: '서버오류' });
  }
};
