const express = require('express');
const router = express.Router();
const debug = require('debug')('api');

router.get('/', (req, res /*, next */) => {
  res.status(200).json('hello');
});

router.post('/', (req, res /*, next */) => {
  debug(req.body);
  res.status(201).json('created');
});

module.exports = router;
