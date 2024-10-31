import { DataTypes } from 'sequelize';
import { SpaceStatuses } from '../config/enum.js';

const SpaceModel = (sequelize) => {
  const Space = sequelize.define('Space', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    // 공간 이름
    spaceName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // 공간 위치
    spaceLocation: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // 공간 설명
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // 원가
    spacePrice: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    // 할인 가격
    discount: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    // 인원 추가 금액
    addPrice: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    // 편의 시설
    amenities: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // 청소 시간
    cleanTime: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    // 공간 상태
    spaceStatus: {
      type: DataTypes.ENUM(SpaceStatuses.AVAILABLE, SpaceStatuses.UNAVAILABLE),
      allowNull: false,
    },
    // 오픈 상태
    isOpen: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    // 최소 손님 수
    minGuests: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    // 최대 손님 수
    maxGuests: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    // 주의사항
    guidelines: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // 영업 시작 시간
    businessStartTime: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    // 영업 종료 시간
    businessEndTime: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    // 카테고리 ID
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'categories',
        key: 'id',
      },
    },
    // 유저 ID
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
  });

  // 관계 설정
  Space.associate = (db) => {
    // Space : Review (1:N)
    Space.hasMany(db.Review, { foreignKey: 'spaceId', sourceKey: 'id' });
    // Space : Booking (1:N)
    Space.hasMany(db.Booking, { foreignKey: 'spaceId', sourceKey: 'id' });
    // Space : Tag (M:N)
    Space.belongsToMany(db.Tag, { through: 'SpaceTag', foreignKey: 'spaceId', otherKey: 'tagId' });
    // Space : Image (1:N)
    Space.hasMany(db.Image, { foreignKey: 'spaceId', sourceKey: 'id' });
    // Space : User (N:1)
    Space.belongsTo(db.User, { foreignKey: 'userId', targetKey: 'id' });
  };

  return Space;
};

export default SpaceModel;
