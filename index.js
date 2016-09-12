'use strict'

var _ = require('lodash');
var base = require('./lib/base');

function determineAdapter(model) {
  var adapterName = null;

  if (!model.adapter) {
    throw Error(`No adapter was set for model "${model.name}"`);
  }

  // Knex?
  if (model.adapter['__knex__']) {
    adapterName = 'knex';
  }

  if (!adapterName) {
    throw Error(`Could not determine adapter for model "${model.name}"`);
  }

  return adapterName;
}

module.exports = function(model) {
  // Find and cache functions to rebind to the model
  var fns = _.filter(_.map(model, function(fn, key) {
    if (_.isFunction(fn)) return key;
  }), function(key) {
    return key;
  });

  var adapterName = determineAdapter(model);
  var adapter = require(`./lib/adapters/${adapterName}`);

  // Add and bind base functions
  _.each(base, function(fn, key) {
    model[key] = fn.bind(model);
  });

  // Add and bind base functions
  _.each(adapter, function(fn, key) {
    model[key] = fn.bind(model);
  });

  // Bind all existing model functions with model
  _.each(fns, function(fnName) {
    model[fnName] = model[fnName].bind(model);
  });

  return model;

}
