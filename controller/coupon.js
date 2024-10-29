import db from '../models/index.js';
import crypto from 'crypto';

const { Coupon, User } = db;

//ANCHOR - 쿠폰 생성
export const addCoupon = async (req, res) => {
  try {
    const { discountPrice, expirationDate, userId } = req.body;
    const user = await User.findOne({
      where: {
        id: userId,
      },
    });
    if (!user) {
      return res.status(404).json({
        result: false,
        message: '유저가 존재하지 않습니다.',
      });
    }

    // expirationDate가 undefined이면 기본값(발급일 기준 30일 후)을 설정
    const expiryDate = expirationDate ? new Date(expirationDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // crypto를 사용하여 쿠폰 코드 생성
    const newCouponCode = `COUPON_${Date.now().toString()}_${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    const newCoupon = await Coupon.create({
      // 쿠폰 코드
      couponCode: newCouponCode,
      // 할인금액
      discountPrice,
      // 쿠폰 만료일
      expirationDate: expiryDate,
      // 쿠폰 활성 상태
      isActive: true,
      // 쿠폰 사용 여부
      isUsed: false,
      // 유저 ID
      userId: user.id,
    });

    res.status(200).json({
      result: true,
      data: newCoupon,
      message: `${user.userName}님에게 ${newCoupon.discountPrice.toLocaleString()}원 쿠폰이 발급되었습니다.`,
    });
  } catch (error) {
    res.status(500).json({
      result: false,
      message: '서버 에러',
      error,
    });
  }
};
