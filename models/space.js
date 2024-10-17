import { DataTypes } from 'sequelize';

const SpaceModel = (sequelize) => {
  return sequelize.define('Space', {
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
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // 공간 설명
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // 원가
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    // 할인 가격
    discount: {
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
      type: DataTypes.NUMBER,
      allowNull: true,
    },
    // 공간 상태
    spaceStatus: {
      type: DataTypes.ENUM(['available', 'unavailable']),
      allowNull: false,
    },
    // 오픈 상태
    isOpen: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  });
};

export default SpaceModel;
