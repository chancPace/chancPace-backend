import db from '../models/index.js';
import jwt from 'jsonwebtoken';
import { ReviewStatus } from '../config/enum.js';

const { Review, User, Space, Booking, Image } = db;

//ANCHOR - 리뷰 생성
export const addReview = async (req, res) => {
  try {
    const { bookingId, spaceId, reviewComment, reviewRating } = req.body;
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

    const findUser = await User.findOne({
      where: { email: jwtUserInfo.user.email },
    });
    if (!findUser) {
      return res.status(404).json({
        result: false,
        message: '유저가 존재하지 않습니다.',
      });
    }
    const findBooking = await Booking.findOne({ where: { id: bookingId } });
    if (!findBooking) {
      return res.status(404).json({
        result: false,
        message: '예약이 존재하지 않습니다.',
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
        userId: findUser.id,
        // 예약 ID
        bookingId: findBooking.id,
      });

      res.status(200).json({
        result: true,
        data: newReview,
        // message: `${find.userName}님이 남긴 리뷰가 등록 되었습니다.`,
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

//ANCHOR - 공간 별점 평균 값 구하기
export const updateRatingBySpace = async (req, res) => {
  try {
    const { spaceId } = req.body;

    // 리뷰의 수
    const reviewCount = await Review.count({
      where: { spaceId, reviewStatus: ReviewStatus.AVAILABLE },
    });
    // 리뷰가 가지고 있는 각각의 별점들
    const reviewAllRating = await Review.findAll({
      where: { spaceId, reviewStatus: ReviewStatus.AVAILABLE },
      attributes: ['reviewRating'],
    });

    // 리뷰 전체의 총 별점 값
    const totalRating = reviewAllRating.reduce((acc, review) => {
      return acc + review.dataValues.reviewRating;
    }, 0);
    // 리뷰 별점 평균 값
    const averageRating = totalRating / reviewCount;

    // 별점 평균 값 공간에 업데이트
    await Space.update(
      { spaceRating: parseFloat(averageRating) },
      {
        where: { id: spaceId },
      }
    );
    res.status(200).json({
      result: true,
      data: averageRating,
      // message: `현재 공간의 별점 평균은 ${averageRating}점 입니다.`,
    });
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
    const allReview = await Review.findAll({
      include: [
        {
          model: User,
          attributes: ['email'],
        },
      ],
    });
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
    const { spaceId } = req.query;

    if (!spaceId) {
      return res.status(400).json({
        result: false,
        message: 'spaceId가 필요합니다.',
      });
    }

    const spaceReview = await Review.findAll({
      // 최신순으로
      order: [['createdAt', 'DESC']],
      where: {
        // 공간 ID
        spaceId,
        // 활성화 된 리뷰만
        reviewStatus: ReviewStatus.AVAILABLE,
      },
      include: [
        {
          model: User,
          attributes: ['email'],
        },
        {
          model: Space, // 리뷰와 연결된 Space 모델 포함
          include: [
            {
              model: Image, // Space 모델 내 Image 모델 포함
              attributes: ['imageUrl'], // 필요한 속성만 선택 (예: 이미지 URL)
            },
          ],
        },
      ],
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

//ANCHOR - 내가 작성한 리뷰 조회
export const getMyReview = async (req, res) => {
  try {
    const { userId } = req.query;
    const myAllReview = await Review.findAll({
      where: {
        userId,
        reviewStatus: ReviewStatus.AVAILABLE,
      },
      include: [
        {
          model: Space,
          include: [{ model: Image }],
        },
      ],
      order: [['createdAt', 'DESC']], // createdAt을 기준으로 최신순 정렬
    });
    res.status(200).json({
      result: true,
      data: myAllReview,
      message: '내가 작성한 리뷰 조회 성공',
    });
  } catch (error) {
    res.status(500).json({
      result: false,
      message: '서버 오류',
      error: error.message,
    });
  }
};

//ANCHOR - 리뷰 전체 조회 - 관리자
export const getAllReviewAdmin = async (req, res) => {
  try {
    const allReview = await Review.findAll({
      include: [
        {
          model: User,
        },
        { model: Space },
      ],
    });
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

//ANCHOR - 리뷰 상세페이지
export const getOneReview = async (req, res) => {
  try {
    const { reviewId } = req.body;
    const findReview = Review.findOne({
      where: { id: reviewId, reviewStatus: ReviewStatus.AVAILABLE },
    });
    if (!findReview) {
      return res.status(404).json({
        result: false,
        message: '존재하지 않는 리뷰입니다.',
      });
    }
    res.status(200).json({
      result: true,
      data: findReview,
      message: '리뷰 조회에 성공했습니다.',
    });
  } catch (error) {
    res.status(500).json({
      result: false,
      message: '서버 오류',
      error: error.message,
    });
  }
};
