const assert = require('assert');
const Prismic = require('prismic.io');

const endpoint = process.env.PRISMIC_URL;
assert.ok(endpoint, 'Missing the PRISMIC_URL environment variable');

module.exports = app => {
  // Initialize the api
  return Prismic.api(endpoint).then(api => {
    api.queryAll = (q, options) => {
      // Make sure that options does not provide a page
      assert.equal(typeof(options.page), 'undefined', 'Dont ask for a specifc page');
      // Defining a function to get a particular page
      function queryPage(page) {
        return api.query(q, Object.assign({page}, options))
        .then(response => {
          const results = response.results;
          if(page < response.total_pages) {
            return queryPage(page + 1).then(nextPageResults => {
              return results.concat(nextPageResults);
            });
          } else {
            return results;
          }
        });
      }
      // Query the first page
      return queryPage(1);
    };
    // Export it,
    module.exports.api = api;
    // add it as a locals
    app.locals.prismic = api;
    // and return it
    return api;
  });
};

module.exports.linkResolver = (doc, ctx) => {
  return '/';
};
