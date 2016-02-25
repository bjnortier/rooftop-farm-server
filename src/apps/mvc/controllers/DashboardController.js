const trip = require('triptych');
const Model = trip.Model;
const Controller = trip.Controller;
const request = require('browser-request');

class DashboardController extends Controller {

  constructor() {
    super(new Model());
    request({url: '/api/measurements', json: true,
      qs: {sensor_id: 'moist_a'}},
      (err, response, body) => {
        if (err) {
          console.error(err);
        } else {
          let parsed = body.map((raw) => {
            return {
              timestamp: new Date(raw.timestamp),
              data: JSON.parse(raw.data)
            };
          });
          console.info(parsed.map((m) => {
            return m.data.value;
          }));
        }
      });
  }

}

module.exports = DashboardController;
