import { DataTypes } from 'sequelize';

const WishlistModel = (sequelize) => {
  const Wishlist = sequelize.define('wishlists', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    // 유저 ID
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users', // 연결할 모델 (User)
        key: 'id', // User 모델의 'id'와 연결
      },
    },
    // 공간 ID
    spaceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'spaces', // 연결할 모델 (Space)
        key: 'id', // Space 모델의 'id'와 연결
      },
    },
  });

  // 관계 설정
  Wishlist.associate = (db) => {
    // Wishlist : User (N:1) 관계
    Wishlist.belongsTo(db.User, { foreignKey: 'userId', targetKey: 'id' });
    // Wishlist : Space (N:1) 관계
    Wishlist.belongsTo(db.Space, { foreignKey: 'spaceId', targetKey: 'id' });
  };

  return Wishlist;
};

export default WishlistModel;
