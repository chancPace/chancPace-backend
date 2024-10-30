import { Where } from 'sequelize/lib/utils';
import db from '../models/index.js';
const { Booking, User, Space } = db;

//ANCHOR - 예약
export const addBooking = async (req, res) => {
  try {
    const { startDate, startTime, endTime, userId, spaceId } = req.body;
    // 유저 존재 조회
    const user = await User.findOne({ where: { id: userId } });
    if (user) {
      // 공간 존재 조회
      const space = await Space.findOne({ where: { id: spaceId, spaceStatus: 'AVAILABLE' } });
      if (space) {
        // 겹치는 예약 시간이 존재 하는지 조회
        const checkBooking = await Booking.findOne({
          where: {
            spaceId, // 1. 같은 공간일 때
            startDate, // 2. 같은 날짜일 때
            [db.Sequelize.Op.or]: [
              // 3.db에 있는 예약 데이터 중 시작 시간이 새로운 예약 시간 범위에 포함되는 경우
              // 예) 기존 예약 10:00 ~ 12:00, 새로운 예약 11:00 ~ 13:00 == 10시가 새로운 예약 시간에 포함됨
              { startTime: { [db.Sequelize.Op.between]: [startTime, endTime] } },
              // 4. db에 있는 예약 데이터 중 종료 시간이 새로운 예약 시간 범위에 포함되는 경우
              // 예) 기존 예약 10:00 ~ 12:00, 새로운 예약 11:00 ~ 13:00 == 12시가 새로운 예약 시간에 포함됨
              { endTime: { [db.Sequelize.Op.between]: [startTime, endTime] } },
              // 5. db에 있는 예약 데이터 중 시간이 새로운 예약 시간에 완전히 포함되는 경우
              // 예) 기존 예약 10:00 ~ 13:00, 새로운 예약 11:00 ~ 12:00 == 10시부터 13시 모두 포함됨
              {
                startTime: { [db.Sequelize.Op.lte]: startTime },
                endTime: { [db.Sequelize.Op.gte]: endTime },
              },
            ],
          },
        });
        if (checkBooking) {
          return res.status(409).json({
            result: false,
            message: '이미 해당 시간에 예약이 존재합니다. 다른 시간을 선택해주세요.',
          });
        }
        // 예약 생성
        const newBooking = await Booking.create({
          startDate,
          startTime,
          endTime,
          bookingStatus: 'COMPLETED',
          userId,
          spaceId,
        });
        if (newBooking) {
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
    const bookingData = await Booking.findAll();
    res.status(200).json({
      result: true,
      data: bookingData,
      message: '예약 조회 성공',
    });
  } catch (error) {
    res.status(500).json({
      result: false,
      message: '서버 오류',
      error: error.message,
    });
  }
};

const test = [
  {
    startTime: '12:00',
    endTime: '13:00',
  },
];

//FIXME - 수정해야함
//ANCHOR - 해당하는 공간 예약 조회
export const getBookingBySpace = async (req, res) => {
  try {
    const { spaceId, startDate } = req.body;

    const bookingData = await Booking.findAll({
      where: {
        spaceId,
        startDate,
      },
    });
    console.log('🚀 ~ getBookingBySpace ~ bookingData:', bookingData);
    res.status(200).json({
      result: true,
      data: bookingData,
      message: '예약 조회 성공',
    });
  } catch (error) {
    res.status(500).json({
      result: false,
      message: '서버 오류',
      error: error.message,
    });
  }
};
