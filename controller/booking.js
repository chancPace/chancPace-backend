import db from '../models/index.js';
import { BookingStatuses } from '../config/enum.js';
import nodemailer from 'nodemailer';
import { Op } from 'sequelize';

const { Booking, User, Space, Payment, Image, Review } = db;

const smtpTransport = nodemailer.createTransport({
  // mail 서비스명
  service: process.env.SMTP_SERVICE,
  auth: {
    // mail 이메일 주소
    user: process.env.SMTP_USER,
    // 해당 이메일 비밀 번호
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

//ANCHOR - 예약
export const addBooking = async (req, res) => {
  try {
    const { startDate, startTime, endTime, userId, spaceId, paymentId } = req.body;
    // 유저 존재 조회
    const user = await User.findOne({ where: { id: userId } });
    if (user) {
      // 공간 존재 조회
      const space = await Space.findOne({
        where: { id: spaceId, spaceStatus: 'AVAILABLE' },
        include: [{ model: Image }],
      });
      if (space) {
        // 예약 생성
        const newBooking = await Booking.create({
          startDate,
          startTime,
          endTime,
          bookingStatus: 'COMPLETED',
          userId,
          spaceId,
          paymentId,
        });
        if (newBooking) {
          const mailOptions = {
            from: 'chancePace',
            to: user.email,
            subject: `[chancePace] ${space.spaceName} 예약을 성공했습니다.`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="text-align: center; color: #4CAF50;">예약 성공!</h2>
                <p>안녕하세요, ${user.userName}님!</p>
                <p><strong>${space.spaceName}</strong> 공간 예약이 성공적으로 완료되었습니다. 이용해 주셔서 감사합니다.</p>
                
                <div style="text-align: center; margin-top: 20px;">
                  <img src="${space.images[0]?.imageUrl}" alt="${space.spaceName} 이미지" style="width: 100%; max-width: 400px; border-radius: 10px;"/>
                </div>
                
                <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                  <tr>
                    <th style="text-align: left; padding: 8px; background-color: #f2f2f2;">이용 공간</th>
                    <td style="padding: 8px;">${space.spaceName}</td>
                  </tr>
                  <tr>
                    <th style="text-align: left; padding: 8px; background-color: #f2f2f2;">예약 날짜</th>
                    <td style="padding: 8px;">${startDate}</td>
                  </tr>
                  <tr>
                    <th style="text-align: left; padding: 8px; background-color: #f2f2f2;">이용 시간</th>
                    <td style="padding: 8px;">${startTime}시 - ${endTime}시</td>
                  </tr>
                </table>
          
                <p style="margin-top: 20px;">궁금한 사항이 있으시면 언제든지 문의해 주세요!</p>
                <p>감사합니다.<br><strong>chancePace</strong> 팀 드림</p>
          
                <hr style="margin-top: 30px; border: 0; border-top: 1px solid #ddd;">
                <p style="font-size: 0.9em; color: #555;">
                  본 메일은 발신 전용입니다. 회신은 처리되지 않습니다.
                </p>
              </div>
            `,
          };

          await smtpTransport.sendMail(mailOptions);

          return res.status(200).json({
            result: true,
            data: newBooking,
            message: `${user.email}님이 ${space.spaceName}를(을) 예약에 성공했습니다.`,
          });
        } else {
          return res.status(400).json({
            result: false,
            message: '예약에 실패 했습니다. 다시 시도해 주세요.',
          });
        }
      } else {
        // 예약 하려는 공간이 'AVAILABLE' 상태가 아닌 경우
        return res.status(405).json({
          result: false,
          message: '예약이 가능한 공간이 아닙니다.',
        });
      }
    } else {
      return res.status(404).json({
        result: false,
        message: '유저 정보가 없습니다.',
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

//ANCHOR - 예약 전체 조회
export const getBooking = async (req, res) => {
  try {
    const bookingData = await Booking.findAll({
      order: [['createdAt', 'DESC']],
      include: [{ model: Payment }, { model: User }, { model: Space }, { model: Review }],
    });
    res.status(200).json({
      result: true,
      data: bookingData,
      message: '예약 조회를 최신순으로 가져왔습니다.',
    });
  } catch (error) {
    res.status(500).json({
      result: false,
      message: '서버 오류',
      error: error.message,
    });
  }
};

//ANCHOR - 해당하는 공간 예약 조회
export const getBookingBySpace = async (req, res) => {
  try {
    const { spaceId, startDate } = req.query;

    const bookingData = await Booking.findAll({
      where: {
        spaceId,
        startDate,
        bookingStatus: BookingStatuses.COMPLETED,
      },
      attributes: ['startTime', 'endTime'],
      include: [{ model: Payment }, { model: User }],
    });

    res.status(200).json({
      result: true,
      data: bookingData,
      message: '공간에 해당하는 예약 조회 성공',
    });
  } catch (error) {
    res.status(500).json({
      result: false,
      message: '서버 오류',
      error: error.message,
    });
  }
};

//ANCHOR - 예약 취소
export const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const updatedBooking = await Booking.update(
      { bookingStatus: BookingStatuses.CANCELLED },
      {
        where: {
          id: bookingId,
        },
      }
    );
    if (updatedBooking === 0) {
      return res.status(404).json({
        result: false,
        message: '해당 예약을 찾을 수 없습니다.',
      });
    }
    res.status(200).json({
      result: true,
      message: `예약 ID ${bookingId}의 상태를 취소로 변경했습니다.`,
    });
  } catch (error) {
    res.status(500).json({
      result: false,
      message: '서버 오류',
      error: error.message,
    });
  }
};

//ANCHOR - 예약 리스트 상세페이지 / 관리자
export const getOneBooking = async (req, res) => {
  try {
    const { bookingId } = req.query;
    const userBooking = await Booking.findOne({
      where: {
        id: bookingId,
      },
      include: [{ model: User }, { model: Space, include: [{ model: Image }] }, { model: Payment }],
    });
    if (!userBooking) {
      return res.status(404).json({
        result: false,
        message: '존재하지 않는 예약입니다.',
      });
    }
    res.status(200).json({
      result: true,
      data: userBooking,
      message: '예약 상세페이지를 조회했습니다.',
    });
  } catch (error) {
    res.status(500).json({
      result: false,
      message: '서버 오류',
      error: error.message,
    });
  }
};

//ANCHOR - 예약 검색 로직
export const getSearchBooking = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({
        result: false,
        message: '검색어가 필요합니다.',
      });
    }
    const searchData = await Booking.findAll({
      where: {
        [Op.or]: [
          { '$User.userName$': { [Op.like]: `%${query}%` } },
          { '$Space.spaceName$': { [Op.like]: `%${query}%` } },
        ],
      },
      include: [{ model: User }, { model: Space }],
    });

    res.status(200).json({
      result: true,
      data: searchData,
      message: `${query}의 해당하는 예약 목록입니다.`,
    });
  } catch (error) {
    res.status(500).json({
      result: false,
      message: '서버 오류',
      error: error.message,
    });
  }
};

//ANCHOR - 내가 예약한 예약리스트 전체 조회
export const getMyBooking = async (req, res) => {
  try {
    const { userId } = req.query;
    const findUser = await User.findOne({
      where: { id: userId },
    });
    if (!findUser) {
      res.status(404).json({
        result: false,
        message: '존재하지 않는 유저입니다.',
      });
    }
    const findBooking = await Booking.findAll({
      where: { userId: findUser.id },
      include: [
        {
          model: Space,
          include: [{ model: Image }],
        },
        {
          model: Review,
        },
      ],
      order: [['createdAt', 'DESC']], // createdAt을 기준으로 최신순 정렬
    });
    res.status(200).json({
      result: true,
      data: findBooking,
      message: `${findUser.userName}님의 예약리스트를 전체 조회했습니다.`,
    });
  } catch (error) {
    res.status(500).json({
      result: false,
      message: '서버 오류',
      error: error.message,
    });
  }
};
