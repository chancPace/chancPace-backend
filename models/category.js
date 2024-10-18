import { DataTypes } from 'sequelize';

const CategoryModel = (sequelize) => {
  return sequelize.define('Category', {
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
};

export default CategoryModel;
