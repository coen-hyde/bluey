'use strict'

var _ = require('lodash');
var base = require('./lib/base');

module.exports = function(model) {
  // Find and cache functions to rebind to the model
  var fns = _.filter(_.map(model, function(fn, key) {
    if (_.isFunction(fn)) return key;
  }), function(key) {
    return key;
  });

  var adapter = require(`./lib/adapters/${model.type}`);

  // Add and bind base functions
  _.each(base, function(fn, key) {
    model[key] = fn.bind(model);
  });

  // Add and bind base functions
  _.each(adapter, function(attribute, key) {
    if (_.isFunction(attribute)) {
      model[key] = attribute.bind(model);
    }
    else {
      model[key] = attribute;
    }
  });

  // Bind all existing model functions with model
  _.each(fns, function(fnName) {
    let fn = model[fnName];
    if (!_.isFunction(fn)) return;
    model[fnName] = fn.bind(model);
  });

  return model;

}
