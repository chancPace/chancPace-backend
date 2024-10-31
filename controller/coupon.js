import db from '../models/index.js';
import crypto from 'crypto';

const { Coupon, User } = db;

//ANCHOR - 쿠폰 생성
export const addCoupon = async (req, res) => {
  try {
    const { couponName, discountPrice } = req.body;

    // crypto를 사용하여 쿠폰 코드 생성
    const newCouponCode = `COUPON_${Date.now().toString()}_${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    const newCoupon = await Coupon.create({
      // 쿠폰 이름
      couponName,
      // 쿠폰 코드
      couponCode: newCouponCode,
      // 할인금액
      discountPrice,
      // 쿠폰 활성 상태
      isActive: true,
    });

    res.status(200).json({
      result: true,
      data: newCoupon,
      message: `${newCoupon.discountPrice.toLocaleString()}원 쿠폰이 생성되었습니다.`,
    });
  } catch (error) {
    res.status(500).json({
      result: false,
      message: '서버 에러',
      error: error.message,
    });
  }
};

//ANCHOR - 쿠폰 수정 및 삭제
export const updateCoupon = async (req, res) => {
  try {
    const { couponId, couponName, couponCode, discountPrice, isActive } = req.body;
    //FIXME - 쿠폰 수정 로직 구현
    const couponData = await Coupon.update({});
  } catch (error) {
    res.status(500).json({
      result: false,
      message: '서버 에러',
      error: error.message,
    });
  }
};
