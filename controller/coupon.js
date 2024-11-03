import db from '../models/index.js';
import crypto from 'crypto';

const { Coupon, User, UserCoupon } = db;

//ANCHOR - 쿠폰 생성
export const addCoupon = async (req, res) => {
  try {
    const { couponName, discountPrice } = req.body;

    const newCoupon = await Coupon.create({
      // 쿠폰 이름
      couponName,
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
    const { couponId, couponName, discountPrice, isActive } = req.body;
    const findCoupon = await Coupon.findOne({
      where: { id: couponId },
    });
    if (!findCoupon) {
      return res.status(404).json({
        result: false,
        message: '존재하지 않는 쿠폰입니다.',
      });
    }
    const updatedData = { couponName, discountPrice, isActive };
    // 값이 없다면 키를 삭제 시킴
    Object.keys(updatedData).forEach((key) => {
      if (updatedData[key] === undefined || updatedData[key] === null || updatedData[key] === '') {
        delete updatedData[key];
      }
    });
    await Coupon.update(updatedData, { where: { id: couponId } });
    res.status(200).json({
      result: true,
      message: updatedData.isActive
        ? `"${findCoupon.couponName}" 쿠폰을 수정하는데 성공했습니다.`
        : `"${findCoupon.couponName}" 쿠폰을 삭제하는데 성공했습니다.`,
    });
  } catch (error) {
    res.status(500).json({
      result: false,
      message: '서버 에러',
      error: error.message,
    });
  }
};

//ANCHOR - 쿠폰 전체 조회 / 관리자
export const getAllCoupon = async (req, res) => {
  try {
    const allCoupons = await Coupon.findAll();
    if (!allCoupons) {
      return res.status(404).json({
        result: false,
        message: '등록된 쿠폰이 없습니다.',
      });
    }
    res.status(200).json({
      result: true,
      data: allCoupons,
      message: '전체 쿠폰을 조회하는데 성공했습니다.',
    });
  } catch (error) {
    res.status(500).json({
      result: false,
      message: '서버 에러',
      error: error.message,
    });
  }
};

//ANCHOR - 관리자가 유저에게 쿠폰을 발급
export const addUserCoupon = async (req, res) => {
  try {
    const { expirationDate, userId, couponId } = req.body;
    const findUser = await User.findOne({ where: { id: userId } });
    if (!findUser) {
      return res.status(404).json({
        result: false,
        message: '존재하지 않는 유저입니다.',
      });
    }
    const findCoupon = await Coupon.findOne({ where: { id: couponId } });
    if (!findCoupon) {
      return res.status(404).json({
        result: false,
        massage: '존재하지 않는 쿠폰입니다.',
      });
    }
    // crypto를 사용하여 쿠폰 코드 생성
    const newCouponCode = `COUPON_${Date.now().toString()}_${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const addUserCoupon = await UserCoupon.create({
      // 쿠폰 코드
      couponCode: newCouponCode,
      expirationDate,
      isUsed: true,
      userId,
      couponId,
    });
    res.status(200).json({
      result: true,
      data: addUserCoupon,
      message: `${findUser.userName}님에게 ${findCoupon.couponName}을 발급하였습니다.`,
    });
  } catch (error) {
    res.status(500).json({
      result: false,
      message: '서버 에러',
      error: error.message,
    });
  }
};
