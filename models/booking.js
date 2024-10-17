import { DataTypes } from 'sequelize';

const BookingModel = (sequelize) => {
  return sequelize.define('Booking', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    // 예약일
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    // 시작 시간
    startTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    // 종료 시간
    endTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    // 예약 상태
    BookingStatus: {
      type: DataTypes.ENUM(['pending', 'approved', 'cancelled', 'completed']),
      allowNull: false,
    },
  });
};

export default BookingModel;
