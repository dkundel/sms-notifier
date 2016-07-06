'use strict';

module.exports = function(sequelize, DataTypes) {
  const Draft = sequelize.define('Draft', {
    content: DataTypes.STRING
  });

  return Draft;
};