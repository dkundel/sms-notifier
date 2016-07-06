'use strict';

module.exports = function(sequelize, DataTypes) {
  const Subscriber = sequelize.define('Subscriber', {
    phoneNumber: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    subscribed: DataTypes.BOOLEAN
  });

  return Subscriber;
};