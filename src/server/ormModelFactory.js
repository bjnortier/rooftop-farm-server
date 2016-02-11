'use strict';

const Sequelize = require('sequelize');
const P = require('bluebird');

module.exports = function(sequelize) {

  let Measurement = sequelize.define('measurement', {
    sensor_id: {
      type: Sequelize.STRING(128),
    },
    timestamp: {
      type: Sequelize.DATE,
    },
    type: {
      type: Sequelize.STRING,
    },
    data: {
      type: Sequelize.STRING(2048),
    }
  });

  Measurement.tableAttributes.sensor_id.allowNull = false;
  Measurement.tableAttributes.timestamp.allowNull = false;
  Measurement.tableAttributes.type.allowNull = false;
  Measurement.tableAttributes.data.allowNull = false;

  let Photo = sequelize.define('photo', {
    sensor_id: {
      type: Sequelize.STRING(128),
    },
    timestamp: {
      type: Sequelize.DATE,
    },
    extension: {
      type: Sequelize.STRING(16),
    },
    bytes: {
      type: Sequelize.BLOB('long'),
    }
  });

  function init() {
    return P.all([
      Measurement.sync(),
      Photo.sync(),
    ]);
  }

  return {
    Measurement: Measurement,
    Photo: Photo,
    init: init,
  };

};
