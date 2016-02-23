const trip = require('triptych');
const Model = trip.Model;
const Controller = trip.Controller;

class DashboardController extends Controller {

  constructor() {
    super(new Model());
    console.log('hello world');
  }

}

module.exports = DashboardController;
