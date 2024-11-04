import { DataTypes } from 'sequelize';
import { PaymentStatuses } from '../config/enum.js';

const PaymentModel = (sequelize) => {
  const Payment = sequelize.define('Payment', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    // 결제 금액
    paymentPrice: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    // 결제 키
    paymentKey: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    // 주문 ID
    orderId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // 결제 상태
    paymentStatus: {
      type: DataTypes.ENUM(
        PaymentStatuses.COMPLETED,
        PaymentStatuses.PENDING,
        PaymentStatuses.FAILED,
        PaymentStatuses.REFUNDED
      ),
      allowNull: false,
    },
    // 결제 수단
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // 결제한 유저 ID
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
    // 예약 ID
    bookingId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'bookings',
        key: 'id',
      },
      unique: true, // 하나의 결제는 하나의 예약에만 연결
    },
  });

  // 관계 설정
  Payment.associate = (db) => {
    // Payment : User (N:1)
    Payment.belongsTo(db.User, { foreignKey: 'userId', targetKey: 'id' });
    // Payment : Booking (1:1)
    Payment.belongsTo(db.Booking, { foreignKey: 'bookingId', targetKey: 'id' });
  };

  return Payment;
};

export default PaymentModel;
