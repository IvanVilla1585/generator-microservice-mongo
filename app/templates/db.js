const Promise = require ('bluebird');
const config = require('../config');
const { MongoClient }  = require('mongodb');

//micro "middleware"
const db = fn => async (req, res, params) => {
  const db = await new Promise((resolve, reject) => {
    MongoClient.connect(config.db, (err, db) => {
      if (err) { reject(err); }
      resolve(db);
    });
  });

  // Expose the connection
  req.DB = db;

  // Close the connection
  res.on('finish', () => {
    db.close();
  });

  return fn(req, res, params);
}
module.exports = db;
