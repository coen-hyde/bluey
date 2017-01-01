'use strict'

var _ = require('lodash');
var ObjectID = require('mongodb').ObjectID;
var async = require('async');

var Adapter = {};

function castMongoId(id) {
  if (_.isString(id)) {
    id = new ObjectID(id);
  }

  return id;
};

Adapter.idField = '_id';

/* Create a mongodb query promise on this collection
 *
 * @return {Promise} A collection query Promise
 */
Adapter.collection = function() {
  return this.adapter.collection(this.name);
}

/*
 * Insert a document into Mongo
 *
 * @param {Object} Data to insert
 * @param {Function} [callback] The function called after insert.
 */
Adapter.insert = function(data, cb) {
  var model = this;

  // Make sure data is valid
  model.validate(data, function(err, result, data) {
    if (err) return cb(err);

    if (!result.valid) return cb(result.errors);

    if (typeof data.createdAt === 'undefined') {
      data.createdAt = new Date();
    }

    model.collection().insertOne(data, function(err, result) {
      if (err) return cb(err);

      model.collection().findOne({ '_id': result.insertedId }, cb);
    });
  });
};

/*
 * Batch insert a documents
 *
 * @param {Array} An array of data to insert
 * @param {Object} An options object
 * @param {Function} [callback] The function called after insert.
 */
Adapter.batchInsert = function(data, options, cb) {
  var model = this;

  if (_.isFunction(options)) {
    cb = options;
    options = {};
  }

  if (options['disableValidation']) {
    model.collection().insertMany(data, cb);
  }

  model.batchValidate(data, function(err, data) {
    if (err) return cb(err);
    model.collection().insertMany(data, cb);
  });
}

/*
 * Update a mongodb document
 *
 * @param {String|Object} Mongo Id of the document to update
 * @param {Object} Mongo update operation
 * @param {Function} [callback] The function called after update.
 */
Adapter.update = function(id, update, cb) {
  id = castMongoId(id);
  this.collection().update({_id: id}, update, cb);
};

/*
 * Do a partial update of a document
 *
 * @param {String|Object} Mongo Id of the document to update
 * @param {Object} A hash of properties with values to set
 * @param {Function} [callback] The function called after update.
 */
Adapter.patch = function(id, patch, cb) {
  var update = { '$set': patch };
  this.update(id, update, cb);
}

/*
 * Get a MongoDb document
 *
 * @param {String|Object} Mongo Id of the document to get
 * @param {Function} [callback] The function called with the fetched document.
 */
Adapter.get = function(id, cb) {
  id = castMongoId(id);
  this.collection().findOne({ '_id': id }, cb);
};

/*
 * Delete a MongoDb document
 *
 * @param {String|Object} Mongo Id of the document to delete
 * @param {Function} [callback] The function called with when the document is deleted.
 */
Adapter.del = function(id, cb) {
  id = castMongoId(id);
  this.collection().deleteOne({_id: id}, cb);
};

module.exports = Adapter;
