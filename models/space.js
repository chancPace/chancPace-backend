import { DataTypes } from 'sequelize';

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
      type: DataTypes.ENUM('AVAILABLE', 'UNAVAILABLE'),
      allowNull: false,
    },
    // 오픈 상태
    isOpen: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    // 카테고리 ID
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Category',
        key: 'id',
      },
    },
  });

  // 관계 설정
  Space.associate = (db) => {
    // Space : Review (1:N)
    Space.hasMany(db.Review, { foreignKey: 'spaceId', sourceKey: 'id' });
    // Space : Booking (1:N)
    Space.hasMany(db.Booking, { foreignKey: 'spaceId', sourceKey: 'id' });
    // Space : Tag (M:N) 예시
    Space.belongsToMany(db.Tag, { through: 'SpaceTag', foreignKey: 'spaceId', otherKey: 'tagId' });
  };
  
  return Space;
};

export default SpaceModel;
