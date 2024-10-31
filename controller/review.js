import db from '../models/index.js';
import jwt from 'jsonwebtoken';
import { ReviewStatus } from '../config/enum.js';

const { Review, User } = db;

//ANCHOR - 리뷰 생성
export const addReview = async (req, res) => {
  try {
    const { spaceId, reviewComment, reviewRating } = req.body;
    // 토큰 검증
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
    if (!find) {
      return res.status(404).json({
        result: false,
        message: '유저가 존재하지 않습니다.',
      });
    }
    if (1 <= reviewRating && reviewRating <= 5) {
      // 리뷰 생성
      const newReview = await Review.create({
        // 유저가 남긴 리뷰
        reviewComment,
        // 유저가 남긴 별점
        reviewRating,
        // 공간 ID
        spaceId,
        // 유저 ID,
        userId: find.id,
      });

      res.status(200).json({
        result: true,
        data: newReview,
        message: `${find.userName}님이 남긴 리뷰가 등록 되었습니다.`,
      });
    } else {
      return res.status(400).json({
        result: false,
        message: `현재 ${reviewRating}점입니다. 별점은 1~5 점까지만 가능합니다`,
      });
    }
  } catch (error) {
    res.status(500).json({
      result: false,
      message: '서버 오류',
      error: error.message,
    });
  }
};

//ANCHOR - 리뷰 전체 조회
export const getAllReview = async (req, res) => {
  try {
    const allReview = await Review.findAll();
    res.status(200).json({
      result: true,
      data: allReview,
      message: '전체 리뷰를 조회했습니다.',
    });
  } catch (error) {
    res.status(500).json({
      result: false,
      message: '서버 오류',
      error: error.message,
    });
  }
};

//ANCHOR - 공간의 리뷰 전체 조회
export const getReviewBySpace = async (req, res) => {
  try {
    const { spaceId } = req.body;
    const spaceReview = await Review.findAll({
      // 최신순으로
      order: [['createdAt', 'DESC']],
      where: {
        // 공간 ID
        spaceId,
        // 활성화 된 리뷰만
        reviewStatus: ReviewStatus.AVAILABLE,
      },
    });
    res.status(200).json({
      result: true,
      data: spaceReview,
      message: `${spaceId}번 공간의 리뷰를 최신순으로 전체 조회 했습니다.`,
    });
  } catch (error) {
    res.status(500).json({
      result: false,
      message: '서버 오류',
      error: error.message,
    });
  }
};

//ANCHOR - 리뷰 수정
export const updateReview = async (req, res) => {
  try {
    const { reviewId, reviewComment, reviewRating, reviewStatus } = req.body;
    const updatedData = {
      reviewComment,
      reviewRating,
      reviewStatus,
    };
    Object.keys(updatedData).forEach((key) => {
      if (updatedData[key] === undefined || updatedData[key] === null || updatedData[key] === '') {
        delete updatedData[key];
      }
    });
    const [reviewData] = await Review.update(updatedData, {
      where: { id: reviewId },
    });
    if (reviewData) {
      res.status(200).json({
        result: true,
        data: reviewData,
        message: `${reviewData}번 리뷰를 수정 완료했습니다.`,
      });
    } else {
      return res.status(400).json({
        result: false,
        message: '수정에 실패했습니다. 다시 시도하세요',
      });
    }
  } catch (error) {
    res.status(500).json({
      result: false,
      message: '서버 오류',
      error: error.message,
    });
  }
};
