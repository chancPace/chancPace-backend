import { DataTypes } from "sequelize";

const ImageModel = (sequelize) => {
  const Image = sequelize.define('images', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    spaceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'spaces',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  });

  Image.associate = (db) => {
    Image.belongsTo(db.Space, { foreignKey: 'spaceId', targetKey: 'id' });
  };

  return Image;
};

export default ImageModel;
