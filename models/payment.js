import { DataTypes } from 'sequelize';

const PaymentModel = (sequelize) => {
  return sequelize.define('Payment', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    // 결제 금액
    amount: {
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
    status: {
      type: DataTypes.ENUM('COMPLETED', 'PENDING', 'FAILED', 'REFUNDED'), // 상태 필드
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
  });
};

export default PaymentModel;
