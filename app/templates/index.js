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

const hash = HttpHash();

/*
  * <%= appNameUpperCase %>  Query
  * GET /*
  * params: mongo stringify query
  *  - ?name=**&admin={$or:{ ***, *** }}
  *  - ?_id=**
  */
hash.set('GET /query/*', db(async (req, res, params) => {
  const { Model } = req;
  const query = parse(req.url, true).query; // get query strings

  // eslint-disable-next-line
  for (const i in query) query[i] = JSON.parse(unescape(query[i])); // parse query to object

  const records = await Model.find(query);

  send(res, 200, records);
}));

/*
  * <%= appNameUpperCase %> find by id
  * GET /:id
  * params: @id
  */
hash.set('GET /:id', db(async (req, res, params) => {
	const { Model } = req;

	const resp = await Model.findById(params.id);

	send(res, 200, resp);
}));

/*
  * <%= appNameUpperCase %> Create
  * POST /
  * body: <%= appNameCapitalize %> fields (see validator)
  */
hash.set('POST /', compose(validator<%= appNameCapitalize %>, db)(async (req, res, params) => {

  const { Model } = req;
  const data = await json(req);
  const resp = await new Model(data).save();

  send(res, 200, resp);
}));

/*
  * <%= appNameUpperCase %> Update
  * POST /:id
  * params: @id
  * body: Dataset to update
  */
hash.set('PUT /:id', db(async (req, res, params) => {
  const { Model } = req;
  const data = await json(req);
  delete data._id;

  const resp = await Model.findByIdAndUpdate(params.id, { $set: data }, { new: true });

  send(res, 200, resp);
}));

/*
  * <%= appNameUpperCase %> Update status (INACTIVE)
  * PUT /remove/:id
  * params: @id
  */
hash.set('DELETE /:id', db(async (req, res, params) => {
  const { Model } = req;
  const data = { status: 'INACTIVE' };

  const resp = await Model.findById(params.id).remove();

  send(res, 200, resp);
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
