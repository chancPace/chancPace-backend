import db from '../models/index.js';
import multer from 'multer';
import jwt from 'jsonwebtoken';


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
        console.log('Request Body:', req.body);
        console.log('Request Files:', req.files);

        const {
            userInfo, // 프론트에서 받은 유저정보
            spaceName, // 공간 이름
            spaceLocation, // 공간 위치
            description, // 공간 설명
            spacePrice, // 공간 가격
            discount, // 할인 가격
            amenities, // 편의 시설
            cleanTime, // 청소 시간
            spaceStatus, // 공간 상태 (예약 가능 : 예약 불가능)
            isOpen, // 오픈 상태 (사용자에게 보여줄지 안보여줄지)
            minGuests, // 최소인원
            maxGuests, // 최대 인원
            guidelines, // 주의 사항
        } = req.body;

        const token = req.headers.authorization?.split(' ')[1]; // Bearer 토큰 추출
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
            return res
                .status(401)
                .json({ result: false, message: '유효하지 않은 토큰입니다.' });
        }

        // jwt로 유저 데이터 가져옴
        const user = await User.findOne({
            where: { email: jwtUserInfo.user.email },
            transaction: t,
        });

        // 유저 정보 없으면 return
        if (!user) {
            return res
                .status(404)
                .json({ result: false, message: '사용자를 찾을 수 없습니다.' });
        }

        // 유저 계정 권한 확인
        //*******일단 유저도 등록가능하게 수정해놓음********* */
        const userRole = user.role;
        if (userRole !== 'USER' && userRole !== 'ADMIN') {
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
                amenities,
                cleanTime,
                spaceStatus,
                isOpen,
                minGuests,
                maxGuests,
                guidelines,
                userId: user.id,
            },
            { transaction: t }
        );

        await Promise.all(
            imageUrls.map((imageUrl) =>
                Image.create(
                    { imageUrl, spaceId: newSpace.id },
                    { transaction: t }
                )
            )
        );

        await t.commit();

        res.status(201).json({
            result: true,
            data: newSpace,
            message: '공간 등록이 완료되었습니다.',
        });
    } catch (error) {
        await t.rollback();

        console.error(error);

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

        res.status(500).json({ result: false, message: '서버오류' });
    }
};

//ANCHOR - 이미지업로드
export const uploadSpaceImage = upload.array('image', 10);

