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
    // 결제 상태
    location: {
      type: DataTypes.ENUM('completed', 'pending', 'failed', 'refunded'),
      allowNull: false,
    },
  });
};

export default PaymentModel;
