import { DataTypes } from 'sequelize';

const TagModel = (sequelize) => {
  const Tag = sequelize.define('tags', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    // 태그 이름
    tagTitle: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  // 관계 설정
  Tag.associate = (db) => {
    // Tag : Space (M:N) 예시
    Tag.belongsToMany(db.Space, { through: 'SpaceTag', foreignKey: 'tagId', otherKey: 'spaceId' });
  };

  return Tag;
};

export default TagModel;
