import { DataTypes } from 'sequelize';

const CouponModel = (sequelize) => {
  const Coupon = sequelize.define('Coupon', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    // 쿠폰 이름
    couponName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // 할인 금액
    discountPrice: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    // 쿠폰 활성 상태
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    // 유저 ID
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
  });

  // 관계 설정
  Coupon.associate = (db) => {
    // Coupon : User (M:N)
    Coupon.belongsToMany(db.User, {
      through: db.UserCoupon,
      foreignKey: 'couponId',
      otherKey: 'userId',
    });
  };

  Coupon.associate = (db) => {
    Coupon.belongsToMany(db.User, {
      through: db.UserCoupon,
      foreignKey: 'couponId',
      otherKey: 'userId',
    });

    Coupon.hasMany(db.UserCoupon, { foreignKey: 'couponId' });
  };

  return Coupon;
};

export default CouponModel;
