import { DataTypes } from 'sequelize';

const UserCouponModel = (sequelize) => {
  const UserCoupon = sequelize.define(
    'UserCoupon',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      // 쿠폰 코드
      couponCode: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      // 쿠폰 만료일
      expirationDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      // 쿠폰 사용 여부
      isUsed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      // 유저 ID (외래 키)
      userId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Users', // 테이블 이름
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE', // 유저가 삭제되면 관련 UserCoupon도 삭제
      },
      // 쿠폰 ID (외래 키)
      couponId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Coupons', // 테이블 이름
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE', // 쿠폰이 삭제되면 관련 UserCoupon도 삭제
      },
    },
    {
      indexes: [], // 유니크 제약조건을 제거
      timestamps: true,
    }
  );

  return UserCoupon;
};

export default UserCouponModel;
