'use strict';

const chalk = require('chalk');

module.exports = function(stacktraces) {

  // will print stacktrace
  // jshint unused:true
  return (err, req, res, next) => {
    // jshint unused:false
    res.status(err.status || 500);
    if (err.status !== 404) {
      console.error(chalk.red(err.message, err.status, err.stack));
    }
    let stripped;
    if (stacktraces) {
      stripped = {
        message: err.message,
        status: err.status,
        stack: err.stack,
      };
    } else {
      stripped = {
        message: err.message,
      };
    }
    if (req.headers['content-type'] === 'application/json') {
      res.json(stripped);
    } else {
      res.render('error', stripped);
    }

  };
};
