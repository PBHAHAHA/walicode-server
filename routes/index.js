const express = require('express');

const router = express.Router();

router.get('/', function(req, res, next) {
  res.json({
    code: 200,
    message: 'Hello World'
  });
});

module.exports = router;