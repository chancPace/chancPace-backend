import db from '../models/index.js';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import { UserRoles } from '../config/enum.js';

const storage = multer.diskStorage({
  destination: (req, res, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('이미지 파일만 업로드 가능합니다.'));
    }
    cb(null, true);
  },
});

const { User, Space, Image } = db;

//ANCHOR - 공간 등록
export const addNewSpace = async (req, res) => {
  const t = await db.sequelize.transaction();

  try {
    const {
      spaceName, // 공간 이름
      spaceLocation, // 공간 위치
      description, // 공간 설명
      spacePrice, // 공간 가격
      discount, // 할인 가격
      addPrice, // 인원 추가 금액
      amenities, // 편의 시설
      cleanTime, // 청소 시간
      spaceStatus, // 공간 상태 (예약 가능 : 예약 불가능)
      isOpen, // 오픈 상태 (사용자에게 보여줄지 안보여줄지)
      minGuests, // 최소인원
      maxGuests, // 최대 인원
      guidelines, // 주의 사항
      categoryId, //카테고리
      businessStartTime, //영업시작시간
      businessEndTime, //영업종료시간
    } = req.body;

    // Bearer 토큰 추출
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        result: false,
        message: '토큰이 제공되지 않았습니다.',
      });
    }

    // jwt 디코딩
    let jwtUserInfo;
    try {
      jwtUserInfo = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (error) {
      return res.status(401).json({ result: false, message: '유효하지 않은 토큰입니다.' });
    }

    // jwt로 유저 데이터 가져옴
    const user = await User.findOne({
      where: { email: jwtUserInfo.user.email },
      transaction: t,
    });

    // 유저 정보 없으면 return
    if (!user) {
      return res.status(404).json({ result: false, message: '사용자를 찾을 수 없습니다.' });
    }

    // 유저 계정 권한 확인
    //FIXME - 이거 언제까지 유저도 가능하게 해둠...????????
    //NOTE - //*******일단 유저도 등록가능하게 수정해놓음********* */
    const userRole = user.role;
    if (userRole !== UserRoles.USER && userRole !== UserRoles.ADMIN) {
      return res.status(403).json({
        result: false,
        message: '호스트만 공간등록이 가능합니다.',
      });
    }

    // 인원수 체크
    if (minGuests < 1) {
      return res.status(400).json({
        result: false,
        message: '최소 인원이 1명 이상이어야 합니다.',
      });
    }
    if (maxGuests < minGuests) {
      return res.status(400).json({
        result: false,
        message: '최대 인원은 최소인원보다 크거나 같아야 합니다.',
      });
    }

    // 이미지 업로드 확인
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        result: false,
        message: '이미지가 업로드되지 않았습니다.',
      });
    }

    // 이미지 URL 수집
    const imageUrls = req.files.map((file) => file.path);

    const newSpace = await Space.create(
      {
        spaceName,
        spaceLocation,
        description,
        spacePrice,
        discount,
        addPrice,
        amenities,
        cleanTime,
        spaceStatus,
        isOpen,
        minGuests,
        maxGuests,
        guidelines,
        userId: user.id,
        categoryId,
        businessStartTime,
        businessEndTime,
      },
      { transaction: t }
    );

    await Promise.all(
      imageUrls.map((imageUrl) => Image.create({ imageUrl, spaceId: newSpace.id }, { transaction: t }))
    );

    await t.commit();

    res.status(201).json({
      result: true,
      data: newSpace,
      message: '공간 등록이 완료되었습니다.',
    });
  } catch (error) {
    await t.rollback();

    console.error('공간 등록 에러: ', error);

    // 에러 처리
    if (error.message === '이미지 파일만 업로드 가능합니다.') {
      return res.status(400).json({
        result: false,
        message: '이미지 파일만 업로드 가능합니다.',
      });
    } else if (error.message.includes('File too large')) {
      return res.status(400).json({
        result: false,
        message: '파일 크기가 5MB를 초과했습니다.',
      });
    }

    res.status(500).json({ result: false, message: '서버오류', error: error.message });
  }
};

//ANCHOR - 이미지업로드
export const uploadSpaceImage = upload.array('image', 10);

//ANCHOR - 등록된 공간 최신순 조회
export const getSpace = async (req, res) => {
  try {
    const spaces = await Space.findAll({
      order: [['createdAt', 'DESC']],
    });
    res.status(200).json({
      result: true,
      data: spaces,
      message: '등록된 공간을 최신순으로 정렬했습니다.',
    });
  } catch (error) {
    return res.status(400).json({
      result: false,
      message: '공간 조회 실패하였습니다.',
      error: error.message,
    });
  }
};

//ANCHOR - 카테고리별 공간 조회
export const getSpaceByCategory = async (req, res) => {
  try {
    const { categoryId } = req.body;
    const spaces = await Space.findAll({
      order: [['createdAt', 'DESC']],
      where: {
        categoryId,
      },
    });
    res.status(200).json({
      result: true,
      data: spaces,
      message: '카테고리에 속한 공간 조회에 성공했습니다.',
    });
  } catch (error) {
    return res.status(400).json({
      result: false,
      message: '공간 조회 실패하였습니다.',
      error: error.message,
    });
  }
};

//ANCHOR - 공간 총 별점 조회
export const getRatingBySpace = async (req, res) => {
  try {
    const { spaceId } = req.body;
    const spaceRatingData = await Space.findOne({
      where: { id:spaceId },
      attributes: ['spaceName', 'spaceRating'],
    });
    console.log("🚀 ~ getRatingBySpace ~ spaceRatingData:", spaceRatingData)
    res.status(200).json({
      result: true,
      data: spaceRatingData,
      message: `${spaceRatingData.spaceName}의 총 별점을 조회하였습니다.`,
    });
  } catch (error) {
    return res.status(400).json({
      result: false,
      message: '서버 오류',
      error: error.message,
    });
  }
};
