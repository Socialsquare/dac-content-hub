const assert = require('assert');
const fs = require('fs');
const express = require('express');
const json2csv = require('json2csv');
const path = require('path');
const Prismic = require('prismic.io');
const Iconv  = require('iconv').Iconv;

function flatten(doc, mapping) {
  const result = {};
  for(field in mapping) {
    result[field] = mapping[field](doc);
  }
  return result;
}

module.exports = type => {
  const router = express.Router();

  /* GET entries matching the type */
  router.get('/', (req, res, next) => {
    res.send('respond with a ' + type);
  });

  const mappingPath = path.join(__dirname, '..', 'csv-mappings', type + '.js');
  if(fs.existsSync(mappingPath)) {
    const mapping = require(mappingPath);

    router.get('/csv/:tag?', (req, res, next) => {
      const tag = req.params.tag;
      const tags = res.app.locals.prismic.data.tags;
      if(tag && tags.indexOf(tag) === -1) {
        throw new Error('The tag `' + tag + '` is not used in the content hub');
      }
      const encoding = req.query.encoding || 'utf-8';
      // Build up the query
      const prismic = res.app.locals.prismic;
      const predicates = [
        Prismic.Predicates.at('document.type', type)
      ];

      // Add the tag to the predicates
      if(tag) {
        const tagPredicate = Prismic.Predicates.at('document.tags', [tag]);
        predicates.push(tagPredicate);
      }

      prismic.queryAll(predicates, {
        pageSize: 100
      }).then(results => {
        return results.map(doc => {
          return flatten(doc, mapping);
        });
      }).then(docs => {
        let filename = type + 's';
        if(tag) {
          filename += '-' + tag;
        }
        filename += '.csv';
        const csv = json2csv({
          fields: Object.keys(mapping),
          data: docs
        });

        // Initialize an iconv to the desired encoding
        const iconv = new Iconv('utf-8', encoding);
        res.set({
          'Content-Disposition': 'attachment; filename="' + filename + '"',
          'Content-Type': 'text/csv'
        });
        // Send the buffer through conversion and to the response
        const encoded = iconv.convert(csv);
        // Send the encoded csv
        res.send(encoded);
      }).then(null, next);
    });
  } else {
    console.warn('Missing the CSV mapping for ' + type);
  }

  return router;
};
