import { DataTypes } from 'sequelize';

const CouponModel = (sequelize) => {
  const Coupon = sequelize.define('Coupon', {
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
    // 유저 ID
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'User', // 연결할 모델
        key: 'id', // 참조할 키
      },
    },
  });
  
  // 관계 설정
  Coupon.associate = (db) => {
    // Coupon : User (N:1)
    Coupon.belongsTo(db.User, { foreignKey: 'userId', targetKey: 'id' });
  };

  return Coupon;
};

export default CouponModel;
