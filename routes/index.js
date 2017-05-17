const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', {
    title: 'DAC Content Hub',
    types: res.app.locals.prismic.data.types,
    tags: res.app.locals.prismic.data.tags
  });
});

module.exports = router;
