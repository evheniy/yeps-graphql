# YEPS GraphQL

YEPS GraphQL server

[![NPM](https://nodei.co/npm/yeps-graphql.png)](https://npmjs.org/package/yeps-graphql)

[![npm version](https://badge.fury.io/js/yeps-graphql.svg)](https://badge.fury.io/js/yeps-graphql)
[![Build Status](https://travis-ci.org/evheniy/yeps-graphql.svg?branch=master)](https://travis-ci.org/evheniy/yeps-graphql)
[![Coverage Status](https://coveralls.io/repos/github/evheniy/yeps-graphql/badge.svg?branch=master)](https://coveralls.io/github/evheniy/yeps-graphql?branch=master)
[![Linux Build](https://img.shields.io/travis/evheniy/yeps-graphql/master.svg?label=linux)](https://travis-ci.org/evheniy/)
[![Windows Build](https://img.shields.io/appveyor/ci/evheniy/yeps-graphql/master.svg?label=windows)](https://ci.appveyor.com/project/evheniy/yeps-graphql)

[![Dependency Status](https://david-dm.org/evheniy/yeps-graphql.svg)](https://david-dm.org/evheniy/yeps-graphql)
[![devDependency Status](https://david-dm.org/evheniy/yeps-graphql/dev-status.svg)](https://david-dm.org/evheniy/yeps-graphql#info=devDependencies)
[![NSP Status](https://img.shields.io/badge/NSP%20status-no%20vulnerabilities-green.svg)](https://travis-ci.org/evheniy/yeps-graphql)

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/evheniy/yeps-graphql/master/LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/evheniy/yeps-graphql.svg)](https://github.com/evheniy/yeps-graphql/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/evheniy/yeps-graphql.svg)](https://github.com/evheniy/yeps-graphql/network)
[![GitHub issues](https://img.shields.io/github/issues/evheniy/yeps-graphql.svg)](https://github.com/evheniy/yeps-graphql/issues)
[![Twitter](https://img.shields.io/twitter/url/https/github.com/evheniy/yeps-graphql.svg?style=social)](https://twitter.com/intent/tweet?text=Wow:&url=%5Bobject%20Object%5D)


## How to install

    npm i -S yeps-graphql
  
## How to use

    const App = require('yeps');
    
    const error = require('yeps-error');
    const logger = require('yeps-logger');
    const server = require('yeps-server');
    
    const graphql = require('yeps-graphql');
    
    const app = new App();
    
    app.all([
        error(),
        logger(),
    ]);
    
    app.then(graphql(options));
    
    server.createHttpServer(app);
    
## Custom router

    app.then(async (ctx) => {
      if (ctx.req.url === '/graphql') {
        return graphql(options)(ctx);
      }
      
      return app.resolve();
    });
    
## With router

    const Router = require('yeps-router');
    
    const router = new Router();
    
    router.post('/graphql').then(graphql(options));
    
    app.then(router.resolve());


## Options

The `graphql` function accepts the following options:

  * **`schema`**: A `GraphQLSchema` instance from [`GraphQL.js`][].
    A `schema` *must* be provided.

  * **`graphiql`**: If `true`, presents [GraphiQL][] when the GraphQL endpoint is
    loaded in a browser. We recommend that you set
    `graphiql` to `true` when your app is in development, because it's
    quite useful. You may or may not want it in production.

  * **`rootValue`**: A value to pass as the `rootValue` to the `graphql()`
    function from [`GraphQL.js/src/execute.js`](https://github.com/graphql/graphql-js/blob/master/src/execution/execute.js#L121).

  * **`context`**: A value to pass as the `context` to the `graphql()`
    function from [`GraphQL.js/src/execute.js`](https://github.com/graphql/graphql-js/blob/master/src/execution/execute.js#L122). If `context` is not provided, the
    `request` object is passed as the context.

  * **`pretty`**: If `true`, any JSON response will be pretty-printed.

  * **`formatError`**: An optional function which will be used to format any
    errors produced by fulfilling a GraphQL operation. If no function is
    provided, GraphQL's default spec-compliant [`formatError`][] function will be used.

  * **`extensions`**: An optional function for adding additional metadata to the
    GraphQL response as a key-value object. The result will be added to
    `"extensions"` field in the resulting JSON. This is often a useful place to
    add development time metadata such as the runtime of a query or the amount
    of resources consumed. This may be an async function. The function is
    give one object as an argument: `{ document, variables, operationName, result }`.

  * **`validationRules`**: Optional additional validation rules queries must
    satisfy in addition to those defined by the GraphQL spec.

In addition to an object defining each option, options can also be provided as
a function (or async function) which returns this options object. This function
is provided the arguments `(request, response, graphQLParams)` and is called
after the request has been parsed.

The `graphQLParams` is provided as the object `{ query, variables, operationName, raw }`.


## HTTP Usage

Once installed at a path, `yeps-graphql` will accept requests with
the parameters:

  * **`query`**: A string GraphQL document to be executed.

  * **`variables`**: The runtime values to use for any GraphQL query variables
    as a JSON object.

  * **`operationName`**: If the provided `query` contains multiple named
    operations, this specifies which operation should be executed. If not
    provided, a 400 error will be returned if the `query` contains multiple
    named operations.

  * **`raw`**: If the `graphiql` option is enabled and the `raw` parameter is
    provided raw JSON will always be returned instead of GraphiQL even when
    loaded from a browser.

GraphQL will first look for each parameter in the URL's query-string:

```
/graphql?query=query+getUser($id:ID){user(id:$id){name}}&variables={"id":"4"}
```

If not found in the query-string, it will look in the POST request body.

If a previous middleware has already parsed the POST body, the `request.body`
value will be used. Use [`multer`][] or a similar middleware to add support
for `multipart/form-data` content, which may be useful for GraphQL mutations
involving uploading files. See an [example using multer](https://github.com/graphql/express-graphql/blob/304b24b993c8f16fffff8d23b0fa4088e690874b/src/__tests__/http-test.js#L674-L741).

If the POST body has not yet been parsed, express-graphql will interpret it
depending on the provided *Content-Type* header.

  * **`application/json`**: the POST body will be parsed as a JSON
    object of parameters.

  * **`application/x-www-form-urlencoded`**: this POST body will be
    parsed as a url-encoded string of key-value pairs.

  * **`application/graphql`**: The POST body will be parsed as GraphQL
    query string, which provides the `query` parameter.


## Schema example

    const { GraphQLSchema, GraphQLObjectType, GraphQLString } = require('graphql');
    
    const schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'RootQueryType',
        fields: {
          hello: {
            type: GraphQLString,
            resolve() {
              return 'world';
            },
          },
        },
      }),
    });
    
    const graphiql = true;
    
    app.then(graphql({
      schema,
      graphiql,
    }));
    
Request: **`/?query={hello}`** will return **`{"data":{"hello":"world"}}`**.


#### [YEPS documentation](http://yeps.info/)
