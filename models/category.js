import { DataTypes } from 'sequelize';

const CategoryModel = (sequelize) => {
  const Category = sequelize.define('Category', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    // 카테고리 이름
    categoryName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // 부모ID
    pId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });

  // 관계 설정
  Category.associate = (db) => {

    // Category : Space (1:N)
    Category.hasMany(db.Space, { foreignKey: 'categoryId', sourceKey: 'id' });
  };

  return Category;
};

export default CategoryModel;
