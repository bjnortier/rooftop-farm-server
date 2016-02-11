'use strict';

const joi = require('joi');
const express = require('express');
const chalk = require('chalk');
const async = require('async');
const multer = require('multer');

module.exports = function(models) {
  let router = express.Router();

  router.get('/', (req, res /*, next */) => {
    res.status(200).json('hello');
  });

  let measurementSchema = joi.object().keys({
    sensor_id: joi.string().required(),
    type: joi.string().required(),
    timestamp: joi.date().timestamp().required(),
    data: joi.any().required(),
  });

  function createMeasurement(m, cb) {
    let error = joi.validate(m, measurementSchema).error;
    if (error) {
      cb(error);
      return;
    }
    models.Measurement.create({
      sensor_id: m.sensor_id,
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
    console.log(req.params);
    let sensorId = req.query.sensor_id;
    models.Measurement.findAll({
      where: {
        sensor_id: sensorId,
      }
    })
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

  const upload = multer();

  let photoSchema = joi.object().keys({
    sensor_id: joi.string().required(),
    timestamp: joi.date().timestamp().required(),
    extension: joi.string().required(),
    bytes: joi.binary().required(),
  });

  function createPhoto(p, cb) {
    let error = joi.validate(p, photoSchema).error;
    if (error) {
      cb(error);
      return;
    }
    models.Photo.create({
      sensor_id: p.sensor_id,
      timestamp: p.timestamp,
      extension: p.extension,
      bytes: p.bytes,
    })
      .then(() => {
        cb();
      })
      .catch((err) => {
        cb(err);
      });
  }

  router.post('/photos', upload.single('photo'), (req, res /*, next */) => {
    let photo = {
      sensor_id: req.body.sensor_id,
      timestamp: parseFloat(req.body.timestamp, 10),
      extension: req.body.extension,
      bytes: req.file.buffer,
    };

    createPhoto(photo, (err) => {
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
        res.status(201).send('created');
      }
    });
  });

  router.get('/photos/latest', (req, res /*, next */) => {
    models.Photo.findAll({
      limit: 1,
      order: '"timestamp" DESC',
    })
      .then(function(p) {
        if (p.length) {
          p = p[0];
          res.set('content-type', 'image/jpeg');
          res.status(200).send(p.bytes);
        } else {
          res.status(404).send('not found');
        }
      })
      .catch(function(err) {
        console.error(err);
        res.status(500).send(err);
      });
  });


  return router;
};
