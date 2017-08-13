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
 * Do a partial put on a document.
 *
 * @param {String} [id] Id of the document to update
 * @param {object} [data] Data to update document with
 * @param {array} [properties] An array of properties the update will replace
 * @param {function} [callback] The function called after update.
 */
Adapter.partialPut = function(id, data, properties, cb) {
  var operations = {};

  if (_.isFunction(properties)) {
    cb = properties;
    properties = [];
  }

  if (properties.length === 0) {
    cb(new Error('Properties must not be empty'));
  }

  properties.forEach(function(key) {
    if (typeof data[key] !== 'undefined') {
      operations[key] = {
        Action: 'PUT',
        Value: data[key]
      };
    }
    else {
      operations[key] = {
        Action: 'DELETE',
        Value: null
      };
    }
  });

  var params = {
    Key: {
      HashKey: Adapter.idField,
      NumberRangeKey: id
    },
    AttributeUpdates: operations,
    ReturnValues: 'ALL_NEW'
  };

  this.client().update(params, function(err, data) {
    if (err) return cb(err);
    cb(null, data.Attributes);
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
