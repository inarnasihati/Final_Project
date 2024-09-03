// models/bookmark.js
module.exports = (sequelize, DataTypes) => {
  const Bookmark = sequelize.define('Bookmark', {
      movieId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
              model: 'Movies',
              key: 'id'
          }
      },
      userId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
              model: 'Users',
              key: 'id'
          }
      }
  });

  Bookmark.associate = function(models) {
      Bookmark.belongsTo(models.User, { foreignKey: 'userId' });
      Bookmark.belongsTo(models.Movie, { foreignKey: 'movieId' });
  };

  return Bookmark;
};