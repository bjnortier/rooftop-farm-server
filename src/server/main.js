'use strict';

const express = require('express');
const path = require('path');
const chalk = require('chalk');
const logger = require('morgan');
const bodyParser = require('body-parser');
const debug = require('debug')('server');
const debugORM = require('debug')('orm');
const mustacheExpress = require('mustache-express');
const nconf = require('nconf');
const Sequelize = require('sequelize');

// ----- Config -----

nconf.env();
function isTruthy(x) {
  return String(x).trim().toUpperCase() === 'TRUE';
}
const RESPONSE_STACKTRACES = isTruthy(nconf.get('RESPONSE_STACKTRACES'));
const DATABASE_URL = nconf.get('DATABASE_URL');
const DATABASE_STORAGE = nconf.get('DATABASE_STORAGE');
// ----- Express App -----

const app = express();
const rootDir = path.join(__dirname, '..', '..');

// uncomment after placing your favicon in /public
// app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json({limit: '10mb'}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(rootDir, 'public')));
app.set('views', path.join(rootDir, 'views'));
app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');

// ----- ORM -----

// Very large inserts will generate massive console.log messages, which
// stalls the debugger
function debug256(msg) {
  if (msg.length > 256) {
    debugORM(msg.slice(0, 256) + '...');
  } else {
    debugORM(msg);
  }
}

let sequelize = new Sequelize(DATABASE_URL, {
  logging: debug256,
  storage: DATABASE_STORAGE,
});
let ormModels = require('./ormModelFactory')(sequelize);

// ----- Routes -----

app.use('/bundles', express.static(path.join(rootDir, 'bundles')));
app.use('/api', require('./api')(ormModels));


// ----- Error handling -----

// catch 404 and forward to error handler
app.use((req, res, next) => {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});
const errorResponseHandler = require('./errorResponseHandler');
app.use('/', errorResponseHandler(RESPONSE_STACKTRACES));

// ----- Start -----

// Server has started
function callback(server) {
  ormModels.init()
    .then(function() {
      debug('API initialized');
    })
    .catch(function(err) {
      console.error('error during ORM init', chalk.red(err));
    });

  var addr = server.address();
  var bind = typeof addr === 'string' ?
    'pipe ' + addr : 'port ' + addr.port;
  debug('Listening on ' + bind);
}

module.exports = {
  app: app,
  callback: callback,
};
