import { DataTypes } from 'sequelize';
import { UserRoles, AccountStatuses, Genders } from '../config/enum.js';

const UserModel = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    // 유저 이름
    userName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // 유저 성별
    gender: {
      type: DataTypes.ENUM(Genders.MALE, Genders.FEMALE),
      allowNull: true,
    },
    // 이메일
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    // 비밀번호
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // 핸드폰 번호
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // 카카오 아이디
    kakaoId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // 호스트 계좌 - 은행
    bankAccountName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // 호스트 계좌 - 번호
    bankAccountNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // 호스트 계좌 - 통장주
    bankAccountOwner: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // 마지막 로그인 날짜 시간
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    // 계정 권한
    role: {
      type: DataTypes.ENUM(UserRoles.USER, UserRoles.HOST, UserRoles.ADMIN),
      allowNull: false,
    },
    // 계정 상태
    accountStatus: {
      type: DataTypes.ENUM(AccountStatuses.ACTIVE, AccountStatuses.BLACKLISTED, AccountStatuses.WITHDRAWN),
      allowNull: false,
      defaultValue: AccountStatuses.ACTIVE,
    },
    // 마케팅 약관 동의
    isMarketingAgreed: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
  });

  // 관계 설정
  User.associate = (db) => {
    // User : Review (1:N)
    User.hasMany(db.Review, { foreignKey: 'userId', sourceKey: 'id' });
    // User : Booking (1:N)
    User.hasMany(db.Booking, { foreignKey: 'userId', sourceKey: 'id' });
    // User : Payment (1:N)
    User.hasMany(db.Payment, { foreignKey: 'userId', sourceKey: 'id' });
    // User : Space (1:N)
    User.hasMany(db.Space, { foreignKey: 'userId', sourceKey: 'id' });
  };

  return User;
};

export default UserModel;
