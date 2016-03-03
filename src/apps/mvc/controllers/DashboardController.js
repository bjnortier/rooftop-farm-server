'use strict';

const tripcore = require('trip.core');
const Model = tripcore.Model;
const Controller = tripcore.Controller;
const tripdom = require('trip.dom');
const $ = tripdom.$;
const Scene = tripdom.Scene;
const request = require('browser-request');

const GraphView = require('../views/GraphView');

class DashboardController extends Controller {

  constructor() {
    super(new Model());

    const sensors = ['moist_0', 'moist_1', 'moist_2'];
    const _this = this;

    sensors.forEach((sensorId) => {
      const element = $('<div class="graph" id="' + sensorId + '"></div>');
      $('#graphs').append(element);
      const scene = new Scene(element);
      //
      request({url: '/api/measurements', json: true,
        qs: {
          sensor_id: sensorId,
          limit: 100,
        }},
        (err, response, body) => {
          if (err) {
            console.error(err);
          } else {
            let parsed = body.map((raw) => {
              return {
                timestamp: new Date(raw.timestamp),
                value: JSON.parse(raw.data).value,
              };
            });
            _this.model[sensorId] = parsed;
            _this.addView(scene, GraphView, {sensorId: sensorId});
          }
        });
    });

  }

}

module.exports = DashboardController;
