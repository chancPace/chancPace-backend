import db from '../models/index.js';
import { Op } from 'sequelize';
import { BookingStatuses, UserRoles } from '../config/enum.js';

const { Booking, User, Space, Payment, Image, Review } = db;

//ANCHOR - 예약
export const addBooking = async (req, res) => {
  try {
    const { startDate, startTime, endTime, userId, spaceId, paymentId } = req.body;
    // 유저 존재 조회
    const user = await User.findOne({ where: { id: userId } });
    if (user) {
      // 공간 존재 조회
      const space = await Space.findOne({ where: { id: spaceId, spaceStatus: 'AVAILABLE' } });
      if (space) {
        // 겹치는 예약 시간이 존재 하는지 조회
        // const checkBooking = await Booking.findOne({
        //   where: {
        //     spaceId, // 1. 같은 공간일 때
        //     startDate, // 2. 같은 날짜일 때
        //     [db.Sequelize.Op.or]: [
        //       // 3.db에 있는 예약 데이터 중 시작 시간이 새로운 예약 시간 범위에 포함되는 경우
        //       // 예) 기존 예약 10:00 ~ 12:00, 새로운 예약 11:00 ~ 13:00 == 10시가 새로운 예약 시간에 포함됨
        //       { startTime: { [db.Sequelize.Op.between]: [startTime, endTime] } },
        //       // 4. db에 있는 예약 데이터 중 종료 시간이 새로운 예약 시간 범위에 포함되는 경우
        //       // 예) 기존 예약 10:00 ~ 12:00, 새로운 예약 11:00 ~ 13:00 == 12시가 새로운 예약 시간에 포함됨
        //       { endTime: { [db.Sequelize.Op.between]: [startTime, endTime] } },
        //       // 5. db에 있는 예약 데이터 중 시간이 새로운 예약 시간에 완전히 포함되는 경우
        //       // 예) 기존 예약 10:00 ~ 13:00, 새로운 예약 11:00 ~ 12:00 == 10시부터 13시 모두 포함됨
        //       {
        //         startTime: { [db.Sequelize.Op.lte]: startTime },
        //         endTime: { [db.Sequelize.Op.gte]: endTime },
        //       },
        //     ],
        //   },
        // });
        // if (checkBooking) {
        //   return res.status(409).json({
        //     result: false,
        //     message: '이미 해당 시간에 예약이 존재합니다. 다른 시간을 선택해주세요.',
        //   });
        // }

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

//NOTE - 미 사용 로직
//ANCHOR - 검색 기능
// export const getSearchBooking = async (req, res) => {
//   try {
//     const { query } = req.query;
//     if (!query) {
//       return res.status(400).json({
//         result: false,
//         message: '검색어가 필요합니다.',
//       });
//     }
//     const spaceBookings = await Space.findAll({
//       where: {
//         spaceName: { [Op.like]: `%${query}%` },
//       },
//       include: [
//         {
//           model: Booking,
//           include: [
//             { model: Space }, // Booking과 연결된 Space 정보
//             { model: User }, // Booking과 연결된 User 정보
//             { model: Payment }, // Booking과 연결된 Payment 정보
//           ],
//         },
//       ],
//     });
//     const userBookings = await User.findAll({
//       where: {
//         userName: { [Op.like]: `%${query}%` },
//         role: {
//           [Op.ne]: UserRoles.ADMIN,
//         },
//       },
//       include: [
//         {
//           model: Booking,
//           include: [
//             { model: Space }, // Booking과 연결된 Space 정보
//             { model: User }, // Booking과 연결된 User 정보
//             { model: Payment }, // Booking과 연결된 Payment 정보
//           ],
//         },
//       ],
//     });
//     const searchData = [...spaceBookings, ...userBookings];
//     res.status(200).json({
//       result: true,
//       data: searchData,
//       message: `${query}의 해당하는 예약 목록입니다.`,
//     });
//   } catch (error) {
//     res.status(500).json({
//       result: false,
//       message: '서버 오류',
//       error: error.message,
//     });
//   }
// };

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
    const findSpace = await Space.findAll({
      where: {
        spaceName: { [Op.like]: `%${query}%` },
      },
    });
    const findBookingBySpace = await Booking.findAll({
      where: { spaceId: findSpace.id },
    });

    const findUser = await User.findAll({
      where: {
        userName: { [Op.like]: `%${query}%` },
        role: {
          [Op.ne]: UserRoles.ADMIN,
        },
      },
    });
    const findBookingByUser = await Booking.findAll({
      where: { userId: findUser.id },
    });
    const searchData = [...findBookingBySpace, ...findBookingByUser];
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
      include: [{ model: Space, include: [{ model: Image }] }],
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
