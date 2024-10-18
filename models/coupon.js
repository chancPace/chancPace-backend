import { DataTypes } from 'sequelize';

const CouponModel = (sequelize) => {
  return sequelize.define('Coupon', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    // 쿠폰 코드
    couponCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // 할인 금액
    discountPrice: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    // 쿠폰 만료일
    expirationDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    // 쿠폰 활성 상태
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    // 쿠폰 사용 여부
    isUsed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  });
};

export default CouponModel;
