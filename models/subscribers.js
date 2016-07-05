'use strict';

module.exports = function(sequelize, DataTypes) {
  const Subscriber = sequelize.define('Subscriber', {
    phoneNumber: DataTypes.STRING,
    subscribed: DataTypes.BOOLEAN
  });

  return Subscriber;
};