'use strict';
const { send, json } = require( 'micro' );
const HttpHash = require( 'http-hash' );
const { parse } = require('url');
const { compose } = require('./lib/utils');
const ObjectID = require('mongodb').ObjectID;

//decorators
const db =  require( './lib/db' );
const { validator<%= appNameCapitalize %> } = require('./lib/validator');
const visualize = require('micro-visualize');

const config = require('./config');

const hash = HttpHash()
const collection<%= appName %> = '<%= appName %>s'

/*
  * <%= appNameUpperCase %>  Query
  * GET /*
  * params: mongo stringify query
  *  - ?name=**&admin={$or:{ ***, *** }}
  *  - ?_id=**
  */
hash.set('GET /*', db(async (req, res, params) => {
  const { DB } = req;
  const query = parse(req.url, true).query; // get query strings

  // eslint-disable-next-line
  for (const i in query) query[i] = JSON.parse(unescape(query[i])); // parse query to object

  const records = await DB.collection(collection<%= appName %>).find(query).toArray();

  send(res, 200, records);
}))

/*
  * <%= appNameUpperCase %> Create
  * POST /
  * body: <%= appNameCapitalize %> fields (see validator)
  */
hash.set('POST /', compose(validator<%= appNameCapitalize %>, db)(async (req, res, params) => {

  const { DB } = req;
  const data = await json(req);
  const resp = await DB.collection(collection<%= appName %>).insertOne(data);

  send(res, 200, resp.ops[0]);
}))

/*
  * <%= appNameUpperCase %> Update
  * POST /:id
  * params: @id 
  * body: Dataset to update
  */
hash.set('POST /:id', db(async (req, res, params) => {
  const { DB } = req;
  const data = await json(req);
  delete data._id;

  const resp = await DB.collection(collection<%= appName %>).findOneAndUpdate({
    _id: new ObjectID(params.id),
  }, { $set: data });

  send(res, 200, resp.value);
}));

/*
  * <%= appNameUpperCase %> Update status (INACTIVE)
  * POST /remove/:id
  * params: @id 
  */
hash.set('POST /remove/:id', db(async (req, res, params) => {
  const { DB } = req;
  const data = { status: 'INACTIVE' };

  const resp = await DB.collection(collection<%= appName %>).findOneAndUpdate({
    _id: new ObjectID(params.id),
  }, { $set: data });

  send(res, 200, resp.value);
}));

/*
 *MAIN 
 */
module.exports = visualize(async function main (req, res) {
  let { method, url } = req
  let match = hash.get(`${method.toUpperCase()} ${url}`)

  if (match.handler) {
    try {
      await match.handler(req, res, match.params)
    } catch (err) {
      if (err.stack) {
        console.error(err.stack);
      }
      send(res, err.statusCode || 500, { errors: true, message: err.message });
    }
  } else {
    send(res, 404, { errors: true, message: 'route not found' })
  }
}, config.env)
