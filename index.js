const debug = require('debug')('yeps:graphql');
const wrapper = require('yeps-express-wrapper');
const graphqlHTTP = require('express-graphql');

module.exports = (options = {}) => {
  debug(options);

  return wrapper(graphqlHTTP(options));
};
