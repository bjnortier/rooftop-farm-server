var express = require('express');
var path = require('path');
var chalk = require('chalk');
var logger = require('morgan');
var bodyParser = require('body-parser');
var debug = require('debug')('server');
var mustacheExpress = require('mustache-express');

var nconf = require('nconf');
nconf.env();

function isTruthy(x) {
  return String(x).trim().toUpperCase() === 'TRUE';
}
var RESPONSE_STACKTRACES = isTruthy(nconf.get('RESPONSE_STACKTRACES'));

var app = express();
var rootDir = path.join(__dirname, '..', '..');

// uncomment after placing your favicon in /public
// app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json({limit: '10mb'}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(rootDir, 'public')));
app.use('/bundles', express.static(path.join(rootDir, 'bundles')));


app.use('/api', require('./api'));

// view engine setup
app.set('views', path.join(rootDir, 'views'));
app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

if (RESPONSE_STACKTRACES) {
  // will print stacktrace
  // jshint unused:true
  app.use(function(err, req, res, next) {
    // jshint unused:false
    res.status(err.status || 500);
    console.error(chalk.bold.red(err.message));
    res.render('error', {
      message: err.message,
      error: err
    });
  });
} else {
  // no stacktraces leaked to user
  // jshint unused:true
  app.use(function(err, req, res, next) {
    // jshint unused:false
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: {}
    });
  });
}

// Server has started
function callback(server) {
  var addr = server.address();
  var bind = typeof addr === 'string' ?
    'pipe ' + addr : 'port ' + addr.port;
  debug('Listening on ' + bind);
}

module.exports = {
  app: app,
  callback: callback,
};
