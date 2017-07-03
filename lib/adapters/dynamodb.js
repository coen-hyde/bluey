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

/*
 * Put a document into Dynamodb
 *
 * @param {Object} Data to insert
 * @param {Function} [callback] The function called after insert.
 */
Adapter.put = function(data, cb) {
  var model = this;

  // Make sure data is valid
  model.validate(data, (err, result, data) => {
    if (err) return cb(err);

    if (!result.valid) return cb(result.errors);

    var params = {
      Item: data,
      ReturnValues: 'ALL_NEW'
    }

    model.client().put(params, function(err, result) {
      if (err) return cb(err);
      return cb(null, result.Attributes);
    });
  });
};

module.exports = Adapter;
