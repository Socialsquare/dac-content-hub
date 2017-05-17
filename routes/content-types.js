const express = require('express');
const prismic = require('../services/prismic');

const router = express.Router();

/* GET a list of content types */
router.get('/', (req, res, next) => {
  res.json(prismic.api.data.types);
});

module.exports = router;
