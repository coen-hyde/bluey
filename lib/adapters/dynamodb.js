'use strict'

var AWS = require('aws-sdk');
var _ = require('lodash');
var async = require('async');
var uuid = require('uuid/v4');

var Adapter = {};

Adapter.idField = 'uuid';

Adapter.client = function() {
  return new AWS.DynamoDB.DocumentClient({
    params: { TableName: this.name },
    service: this.adapter
  });
}

/**
 * Put a document into Dynamodb
 *
 * @param {object} Data to put
 * @param {function} [callback] The function called after insert.
 */
Adapter.put = function(data, cb) {
  // Make sure data is valid
  this.validate(data, (err, result, data) => {
    if (err) return cb(err);

    if (!result.valid) return cb(result.errors);

    var params = {
      Item: data,
      ReturnValues: 'ALL_NEW'
    }

    this.client().put(params, function(err, result) {
      if (err) return cb(err);
      return cb(null, result.Attributes);
    });
  });
};

/**
 * Delete a document from Dynamodb
 *
 * @param {string} id to delete
 * @param {function} [callback] The function called after delete.
 */
Adapter.del = function(id, cb) {
  var params = {
    Key: {
      HashKey: Adapter.idField,
      NumberRangeKey: id
    },
    ReturnValues: 'NONE'
  };

  this.client().delete(params, _.ary(cb, 1));
}

/**
 * Get a document from Dynamodb
 *
 * @param {string} id to get
 * @param {function} [callback] The function called after fetch.
 */
Adapter.get = function(id, cb) {
  var params = {
    Key: {
      [Adapter.idField]: id,
    }
  };

  this.client().get(params, function(err, data) {
    if (err) return cb(err);
    return cb(null, data.Item);
  });
}

module.exports = Adapter;
