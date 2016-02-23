var express = require('express');
var router = express.Router();

router.get('/', function(req, res /*, next */) {
  res.render('app', { app: 'dashboard' });
});

router.get('/apps/dashboard', function(req, res /*, next */) {
  res.render('app', { app: 'dashboard' });
});

module.exports = router;
