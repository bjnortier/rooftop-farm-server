var Sequelize = require('sequelize');
var P = require('bluebird');

module.exports = function(sequelize) {

  var Measurement = sequelize.define('measurement', {
    sensor_id: {
      type: Sequelize.STRING(2048),
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

  function init() {
    return P.all([
      Measurement.sync(),
    ]);
  }

  return {
    Measurement: Measurement,
    init: init,
  };

};
