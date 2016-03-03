const $ = require('trip.dom').$;

const body =
  `<div id="graphs">
  </div>`;
$('body').html(body);

const DashboardController = require('./mvc/controllers/DashboardController');
new DashboardController();
