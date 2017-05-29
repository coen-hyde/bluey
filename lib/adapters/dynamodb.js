'use strict'

var _ = require('lodash');
var async = require('async');
var uuid = require('uuid/v4');

var Adapter = {};

Adapter.idField = 'uuid';

function typeMapping(type) {
  var mapping = {
    'string': 'S',
    'iteger': 'N',
    'boolean': 'BOOL',
    'array': 'L',
    'object': 'M'
  }

  return mapping[type];
}

Adapter._dataToItem = function(properties, data) {
  var item = {};

  _.each(data, (value, key) => {
    var property = properties[key];

    if (!property) return;

    switch (property.type) {
      case 'object':
        value = Adapter._dataToItem(property.properties, value);
        break
    }

    item[key] = {
      [`${typeMapping(property.type)}`]: value
    };
  });

  return item;
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

    if (typeof data.createdAt === 'undefined') {
      data.createdAt = new Date();
    }

    var params = {
      Item: this._dataToItem(model.properties, data),
      TableName: model.name
    }

    model.adapter.putItem(data, function(err, result) {
      if (err) return cb(err);

      console.log(result);
    });
  });
};

module.exports = Adapter;
