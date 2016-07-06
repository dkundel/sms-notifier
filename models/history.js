'use strict';

module.exports = function(sequelize, DataTypes) {
  const History = sequelize.define('History', {
    content: DataTypes.STRING,
    count: DataTypes.INTEGER
  });

  return History;
};