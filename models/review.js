import { DataTypes } from 'sequelize';

const ReviewModel = (sequelize) => {
  return sequelize.define('Review', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    // 리뷰 내용
    reviewComment: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  });
};

export default ReviewModel;
