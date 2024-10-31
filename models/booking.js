import { DataTypes } from 'sequelize';
import { BookingStatuses } from '../config/enum.js';

const BookingModel = (sequelize) => {
  const Booking = sequelize.define('Booking', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    // 예약일
    startDate: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // 시작 시간
    startTime: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    // 종료 시간
    endTime: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    // 예약 상태
    bookingStatus: {
      type: DataTypes.ENUM(
        BookingStatuses.PENDING,
        BookingStatuses.APPROVED,
        BookingStatuses.CANCELLED,
        BookingStatuses.COMPLETED
      ),
      allowNull: false,
      defaultValue: BookingStatuses.PENDING,
    },
    // 유저 ID
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    // 공간 ID
    spaceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'spaces',
        key: 'id',
      },
    },
  });

  // 관계 설정
  Booking.associate = (db) => {
    // Booking : User (N:1)
    Booking.belongsTo(db.User, { foreignKey: 'userId', targetKey: 'id' });
    // Booking : Space (N:1)
    Booking.belongsTo(db.Space, { foreignKey: 'spaceId', targetKey: 'id' });
  };

  return Booking;
};

export default BookingModel;
