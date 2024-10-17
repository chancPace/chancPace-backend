import { DataTypes } from 'sequelize';

const ReviewModel = (sequelize) => {
  return sequelize.define('Review', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    // 공간 이름
    comment: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  });
};

export default ReviewModel;
