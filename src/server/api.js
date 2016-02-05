'use strict';

const joi = require('joi');
const express = require('express');
const chalk = require('chalk');
const async = require('async');

module.exports = function(models) {
  let router = express.Router();

  router.get('/', (req, res /*, next */) => {
    res.status(200).json('hello');
  });

  let schema = joi.object().keys({
    id: joi.string().required(),
    type: joi.string().required(),
    timestamp: joi.date().timestamp().required(),
    data: joi.any().required(),
  });

  function createMeasurement(m, cb) {
    let error = joi.validate(m, schema).error;
    if (error) {
      cb(error);
      return;
    }
    models.Measurement.create({
      type: m.type,
      timestamp: m.timestamp,
      data: JSON.stringify(m.data),
    })
      .then(() => {
        cb();
      })
      .catch((err) => {
        cb(err);
      });
  }

  router.post('/measurements', (req, res /*, next */) => {
    let inputs = req.body;
    async.series(
      inputs.map(function(m) {
        return function(cb) {
          createMeasurement(m, cb);
        };
      }), function(err) {
        if (err) {
          console.error(err);
          if (err.isJoi) {
            res.status(400).json(err.details.map((d) => {
              return d.message;
            }));
          } else if (err.name === 'SequelizeValidationError') {
            res.status('400').json(err.message);
          } else {
            console.error(chalk.red(err));
            res.sendStatus(500);
          }
        } else {
          res.status(201).json('created');
        }
      });
  });

  router.get('/measurements', (req, res /*, next */) => {
    models.Measurement.findAll({})
      .then(function(measurements) {
        res.status(200).json(measurements.map(function(m) {
          return {
            timestamp: m.timestamp,
            data: JSON.parse(m.data),
          };
        }));
      })
      .catch(function(err) {
        res.status(500).json(err);
      });
  });

  return router;
};
