'use strict';

const express = require('express');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');
const debug = require('debug')('server');
const mustacheExpress = require('mustache-express');

const nconf = require('nconf');
nconf.env();

function isTruthy(x) {
  return String(x).trim().toUpperCase() === 'TRUE';
}
const RESPONSE_STACKTRACES = isTruthy(nconf.get('RESPONSE_STACKTRACES'));

const app = express();
const rootDir = path.join(__dirname, '..', '..');

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
app.use((req, res, next) => {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers
const errorResponseHandler = require('./errorResponseHandler');
app.use('/', errorResponseHandler(RESPONSE_STACKTRACES));

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
