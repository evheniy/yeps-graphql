const App = require('yeps');
const error = require('yeps-error');
const chai = require('chai');
const chaiHttp = require('chai-http');
const srv = require('yeps-server');
const Router = require('yeps-router');
const { GraphQLSchema, GraphQLObjectType, GraphQLString } = require('graphql');
const graphql = require('..');

const { expect } = chai;

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

chai.use(chaiHttp);
let app;
let server;

describe('YEPS graphql test', () => {
  beforeEach(() => {
    app = new App();
    app.all([
      error(),
    ]);
    server = srv.createHttpServer(app);
  });

  afterEach(() => {
    server.close();
  });

  it('should test error with empty schema', async () => {
    let isTestFinished = false;

    app.then(graphql());

    await chai.request(server)
      .get('/')
      .send()
      .catch((err) => {
        expect(err).to.have.status(500);
        expect(err.message).to.be.equal('Internal Server Error');
        expect(JSON.parse(err.response.error.text).errors[0].message).to.be.equal('GraphQL middleware options must contain a schema.');
        isTestFinished = true;
      });

    expect(isTestFinished).is.true;
  });

  it('should test error with empty query string', async () => {
    let isTestFinished = false;

    app.then(graphql({ schema }));

    await chai.request(server)
      .get('/')
      .send()
      .catch((err) => {
        expect(err).to.have.status(400);
        expect(err.message).to.be.equal('Bad Request');
        expect(JSON.parse(err.response.error.text).errors[0].message).to.be.equal('Must provide query string.');
        isTestFinished = true;
      });

    expect(isTestFinished).is.true;
  });

  it('should test middleware for GET request', async () => {
    let isTestFinished = false;

    app.then(graphql({
      schema,
    }));

    await chai.request(server)
      .get('/')
      .query({ query: '{ hello }' })
      .send()
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res.body.data.hello).to.be.equal('world');
        isTestFinished = true;
      });

    expect(isTestFinished).is.true;
  });

  it('should test middleware for POST request', async () => {
    let isTestFinished = false;

    app.then(graphql({
      schema,
    }));

    await chai.request(server)
      .post('/')
      .send({ query: '{ hello }' })
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res.body.data.hello).to.be.equal('world');
        isTestFinished = true;
      });

    expect(isTestFinished).is.true;
  });

  it('should test custom route', async () => {
    let isTestFinished = false;

    app.then(async (ctx) => {
      if (ctx.req.url === '/graphql') {
        return graphql({ schema })(ctx);
      }

      return app.resolve();
    });

    await chai.request(server)
      .get('/graphql')
      .send({ query: '{ hello }' })
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res.body.data.hello).to.be.equal('world');
        isTestFinished = true;
      });

    expect(isTestFinished).is.true;
  });

  it('should test yeps router for GET request', async () => {
    let isTestFinished = false;

    const router = new Router();

    router.get('/graphql').then(graphql({ schema }));

    app.then(router.resolve());

    await chai.request(server)
      .get('/graphql')
      .query({ query: '{ hello }' })
      .send()
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res.body.data.hello).to.be.equal('world');
        isTestFinished = true;
      });

    expect(isTestFinished).is.true;
  });

  it('should test yeps router for POST request', async () => {
    let isTestFinished = false;

    const router = new Router();

    router.post('/graphql').then(graphql({ schema }));

    app.then(router.resolve());

    await chai.request(server)
      .post('/graphql')
      .send({ query: '{ hello }' })
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res.body.data.hello).to.be.equal('world');
        isTestFinished = true;
      });

    expect(isTestFinished).is.true;
  });

  it('should test graphiql with query', async () => {
    let isTestFinished = false;

    const graphiql = true;

    app.then(graphql({
      schema,
      graphiql,
    }));

    await chai.request(server)
      .get('/')
      .query({ query: '{hello}' })
      .set('Accept', 'text/html,application/json')
      .send()
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res.type).to.equal('text/html');
        expect(res.text).to.contain('graphiql.min.js');
        isTestFinished = true;
      });

    expect(isTestFinished).is.true;
  });

  it('should test graphiql without query', async () => {
    let isTestFinished = false;

    const graphiql = true;

    app.then(graphql({
      schema,
      graphiql,
    }));

    await chai.request(server)
      .get('/')
      .set('Accept', 'text/html,application/json')
      .send()
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res.type).to.equal('text/html');
        expect(res.text).to.contain('graphiql.min.js');
        isTestFinished = true;
      });

    expect(isTestFinished).is.true;
  });
});
