import db from '../models/index.js';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import { UserRoles, SpaceStatuses } from '../config/enum.js';
import { Op } from 'sequelize';
import AWS from 'aws-sdk';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const { User, Space, Image, Booking, Payment, Review } = db;

// AWS S3 설정
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// 로컬과 s3 구분을 위한 설정
const isLocal = process.env.NODE_ENV === 'development';
console.log('🚀 ~ isLocal:', isLocal);

// 이미지 업로드를 위한 multer 설정
const storage = isLocal
  ? multer.diskStorage({
      destination: (req, res, cb) => {
        cb(null, 'uploads/');
      },
      filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
      },
    })
  : multer.memoryStorage();

// multer 설정/ 파일 사이즈 제한 및 MIME 타입 필터림
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    // file.mimetype.startsWith('image/') === MIME 타입이 image/로 시작하는 경우
    if (!file.mimetype.startsWith('image/')) {
      // 이미지 파일이 아니라면 에러를 반환
      return cb(new Error('이미지 파일만 업로드 가능합니다.'));
    }
    // 이미지 파일인 경우 정상 처리
    cb(null, true);
  },
});

// 여러 이미지를 업로드 할 수 있게 설정 (최대 10개)
export const uploadSpaceImage = upload.array('image', 10);

// s3에 파일 업로드 하는 함수
const uploadToS3 = (file) => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME, // S3 버킷 이름
    Key: `images/${Date.now()}-${file.originalname}`, // S3에 저장될 파일 경로
    Body: file.buffer, // multer로 받은 파일의 버퍼
    ContentType: file.mimetype, // 파일의 MIME 타입
    ACL: 'public-read', // 파일을 공개 읽기 권한으로 설정
  };
  console.log('🚀 ~ uploadToS3 ~ params.process.env.AWS_S3_BUCKET_NAME:', params.process.env.AWS_S3_BUCKET_NAME);
  return s3.upload(params).promise();
};

//ANCHOR - 공간 등록
export const addNewSpace = async (req, res) => {
  // 트랜잭션 시작
  const t = await db.sequelize.transaction();

  try {
    const {
      spaceAdminName, // 공간 관리자 이름
      spaceAdminPhoneNumber, // 공간 관리자 연락처
      spaceName, // 공간 이름
      spaceLocation, // 공간 위치
      description, // 공간 설명
      spacePrice, // 공간 가격
      discount, // 할인 가격
      addPrice, // 인원 추가 금액
      amenities, // 편의 시설
      cleanTime, // 청소 시간
      isOpen, // 오픈 상태 (사용자에게 보여줄지 안보여줄지)
      minGuests, // 최소인원
      maxGuests, // 최대 인원
      guidelines, // 주의 사항
      categoryId, //카테고리
      businessStartTime, //영업시작시간
      businessEndTime, //영업종료시간
    } = req.body;

    // 헤더에서 Bearer 토큰 추출
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        result: false,
        message: '토큰이 제공되지 않았습니다.',
      });
    }

    // jwt 디코딩해서 사용자 정보 가져오기
    let jwtUserInfo;
    try {
      jwtUserInfo = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (error) {
      return res.status(401).json({
        result: false,
        message: '유효하지 않은 토큰입니다.',
      });
    }
    // 디코딩 된 이메일 정보로 유저 데이터 가져오기
    const user = await User.findOne({
      where: { email: jwtUserInfo.user.email },
      transaction: t,
    });
    // 유저 정보 없으면 return
    if (!user) {
      return res.status(404).json({
        result: false,
        message: '사용자를 찾을 수 없습니다.',
      });
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

    // 최소 인원이 1명 이상인지 체크
    if (minGuests < 1) {
      return res.status(400).json({
        result: false,
        message: '최소 인원이 1명 이상이어야 합니다.',
      });
    }
    // 최대 인원이 최소 인원보다 크거나 같은지 체크
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
    const imageUrls = isLocal
      ? req?.files?.map((file) => file.path)
      : await Promise.all(
          req?.files?.map(async (file) => {
            const s3Response = await uploadToS3(file);
            return s3Response.Location;
          })
        );

    const newSpace = await Space.create(
      {
        spaceAdminName,
        spaceAdminPhoneNumber,
        spaceName,
        spaceLocation,
        description,
        spacePrice,
        discount,
        addPrice,
        amenities,
        cleanTime,
        spaceStatus: SpaceStatuses.UNAVAILABLE,
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

    // imageUrls 배열을 순회하며 각 이미지를 Image 테이블에 저장
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

//ANCHOR - 등록된 공간 최신순 조회
export const getSpace = async (req, res) => {
  try {
    const spaces = await Space.findAll({
      order: [['createdAt', 'DESC']],
      include: [{ model: Image }],
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
      where: { categoryId },
      include: [{ model: Image }],
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
      where: { id: spaceId },
      attributes: ['spaceName', 'spaceRating'],
    });
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

//ANCHOR - 검색 기능
export const getSearchSpace = async (req, res) => {
  try {
    const { query } = req.query;
    const spaces = await Space.findAll({
      where: {
        spaceStatus: SpaceStatuses.AVAILABLE,
        [Op.or]: [{ spaceName: { [Op.like]: `%${query}%` } }, { spaceLocation: { [Op.like]: `%${query}%` } }],
      },
      include: [{ model: Image }, { model: User, attributes: ['userName'] }],
    });
    res.status(200).json({
      result: true,
      data: spaces,
      message: `${query}가 포함된 공간 목록입니다.`,
    });
  } catch (error) {
    res.status(500).json({
      result: false,
      message: '서버오류',
      error: error.message,
    });
  }
};

//ANCHOR - 공간 수정 및 삭제
export const updateSpace = async (req, res) => {
  const t = await db.sequelize.transaction();

  try {
    const {
      spaceId,
      spaceAdminName, // 공간 관리자 이름
      spaceAdminPhoneNumber, // 공간 관리자 연락처
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
      deleteImageIds, // 프론트엔드에서 삭제할 이미지 ID 배열로 받기
    } = req.body;
    // 공간의 존재 여부 확인
    const findSpace = await Space.findOne({
      where: { id: spaceId },
      include: [{ model: Image }],
      transaction: t,
    });
    if (!findSpace) {
      return res.status(404).json({
        result: false,
        message: '존재하지 않는 공간 입니다.',
      });
    }

    //SECTION -  어떻게 작동하는지 해석해야함
    // 삭제할 이미지가 있다면 처리
    if (deleteImageIds && deleteImageIds.length > 0) {
      // DB에서 이미지 삭제
      await Image.destroy({
        where: {
          id: deleteImageIds,
          spaceId: findSpace.id, // 해당 공간의 이미지인지 확인
        },
        transaction: t,
      });

      // 파일 시스템에서 이미지 삭제
      findSpace.Images.forEach((image) => {
        if (deleteImageIds.includes(image.id)) {
          const imagePath = path.join(__dirname, '..', image.imageUrl);
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath); // 실제 이미지 파일 삭제
          }
        }
      });
    }

    // 새로운 이미지가 업로드된 경우 처리
    if (req.files && req.files.length > 0) {
      const newImageUrls = req.files.map((file) => file.path);
      await Promise.all(
        newImageUrls.map((imageUrl) => Image.create({ imageUrl, spaceId: findSpace.id }, { transaction: t }))
      );
    }
    //!SECTION

    // 수정할 데이터 생성
    const updatedData = {
      spaceAdminName, // 공간 관리자 이름
      spaceAdminPhoneNumber, // 공간 관리자 연락처
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
    };

    // 값이 없다면 키를 삭제 시킴
    Object.keys(updatedData).forEach((key) => {
      if (updatedData[key] === undefined || updatedData[key] === null || updatedData[key] === '') {
        delete updatedData[key];
      }
    });

    // db에 업데이트 내용 적용
    const updatedSpace = await Space.update(updatedData, {
      where: { id: spaceId },
      transaction: t,
    });

    await t.commit();

    res.status(200).json({
      result: true,
      data: updatedSpace,
      message: `${updatedData.spaceName}의 공간 정보가 수정되었습니다.`,
    });
  } catch (error) {
    await t.rollback();

    res.status(500).json({
      result: false,
      message: '서버오류',
      error: error.message,
    });
  }
};

//ANCHOR - 공간 상세 페이지 / 관리자
export const getOneSpace = async (req, res) => {
  try {
    const { spaceId } = req.query;
    const findSpace = await Space.findOne({
      where: { id: spaceId },
      include: [{ model: Image }],
    });
    if (!findSpace) {
      return res.status(404).json({
        result: false,
        message: '존재하지 않는 공간입니다.',
      });
    }
    res.status(200).json({
      result: true,
      data: findSpace,
      message: `${findSpace.spaceName}의 공간을 조회했습니다.`,
    });
  } catch (error) {
    res.status(500).json({
      result: false,
      message: '서버오류',
      error: error.message,
    });
  }
};

//ANCHOR - 내가 등록한 공간 전체 조회 & 예약목록 조회 / 호스트
export const getMySpace = async (req, res) => {
  try {
    const { userId } = req.query;
    const findMySpace = await Space.findAll({
      where: { userId },
      include: [
        { model: Image },
        { model: Booking, include: [{ model: User, include: [{ model: Payment }] }] },
        { model: Review, include: [{ model: User }] },
      ],
    });
    if (findMySpace.length === 0) {
      return res.status(404).json({
        result: false,
        message: '등록한 공간이 없습니다.',
      });
    }
    res.status(200).json({
      result: true,
      data: findMySpace,
      message: '등록한 공간 조회에 성공했습니다.',
    });
  } catch (error) {
    res.status(500).json({
      result: false,
      message: '서버오류',
      error: error.message,
    });
  }
};
