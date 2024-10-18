import { DataTypes } from 'sequelize';

const TagModel = (sequelize) => {
  return sequelize.define('Tag', {
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
};

export default TagModel;
