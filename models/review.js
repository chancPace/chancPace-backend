import { DataTypes } from 'sequelize';
import { ReviewStatus } from '../config/enum.js';

const ReviewModel = (sequelize) => {
  const Review = sequelize.define('Review', {
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
    // 리뷰 별점
    reviewRating: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    // 리뷰 상태
    reviewStatus: {
      type: DataTypes.ENUM(ReviewStatus.AVAILABLE, ReviewStatus.UNAVAILABLE),
      allowNull: false,
      defaultValue: ReviewStatus.AVAILABLE,
    },
    // 공간 ID
    spaceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'spaces',
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
    },
  });

  // 관계 설정
  Review.associate = (db) => {
    // Review : User (N:1)
    Review.belongsTo(db.User, { foreignKey: 'userId', targetKey: 'id' });
    // Review : Space (N:1)
    Review.belongsTo(db.Space, { foreignKey: 'spaceId', targetKey: 'id' });
  };

  return Review;
};

export default ReviewModel;
