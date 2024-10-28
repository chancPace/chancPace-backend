import db from '../models/index.js';

const { Coupon } = db;

export const addCoupon = async(req,res)=>{
  try {
    const {}=req.body
  } catch (error) {
    res.status(500).json({
      result: false,
      message: '서버 에러',
      error,
    });
  }
}