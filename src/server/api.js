'use strict';

const joi = require('joi');
const express = require('express');
const debug = require('debug')('api');
const chalk = require('chalk');

module.exports = function(models) {
  let router = express.Router();

  router.get('/', (req, res /*, next */) => {
    res.status(200).json('hello');
  });

  router.post('/measurement', (req, res /*, next */) => {
    let input = req.body;
    let schema = joi.object().keys({
      timestamp: joi.date().timestamp().required(),
      type: joi.string().required(),
      data: joi.any().required(),
    });
    let error = joi.validate(input, schema).error;
    if (error) {
      debug(error);
      res.status(400).json(error.details.map((d) => {
        return d.message;
      }));
    } else {
      models.Measurement.create({
        type: req.body.type,
        timestamp: req.body.timestamp,
        data: JSON.stringify(req.body.data),
      })
        .then((measurement) => {
          debug(measurement.dataValues);
          res.status(201).json('created');
        })
        .catch((err) => {
          if (err.name === 'SequelizeValidationError') {
            res.status('400').json(err.message);
          } else {
            console.error(chalk.red(err));
            res.sendStatus(500);
          }
        });
    }
  });

  return router;
};
