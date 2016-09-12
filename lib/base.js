'use strict';

var _ = require('lodash');
var async = require('async');
var inflection = require('inflection');
var validator = require('./validator');

var Model = {};

/*
 * Filter and Transform data for public consumption
 *
 * @param {Object} Data to sanitize
 * @param {Function} [callback] The function called with the sanitized data.
 */
Model.sanitize = function(data, cb) {
  var model = this;

  if (!_.isArray(data)) {
    data = [data];
    var single = true;
  }

  function filter(item) {
    return model.filter(item, 'public');
  }

  function transform(item) {
    // TODO: Allow models to specify a transform function
    return item;
  }

  data = _.map(data, _.flowRight(transform, filter));
  if (single) return _.first(data);
  else return data;
};

/*
 * Turn a mask into a list of properties
 *
 * @private
 * @param {String|Array} Either a string naming a mask specified in this model's schema or a list of properties.
 * @return {Array} A list of properties
 */
Model._maskToProperties = function(properties) {
  if (!_.isArray(properties)) {
    if (properties === 'all') {
      properties = _.keys(this.schema.properties);
    }
    else if (_.isString(properties) && this.schema.masks && this.schema.masks[properties]) {
      properties = this.schema.masks[properties];
    }
    else {
      properties = [];
    }
  }

  return properties;
};

/*
 * Filter the schema to include properties specified in the mask
 *
 * @param {String|Array} Either a string naming a mask specified in this model's schema or a list of properties.
 * @return {Object} Filtered schema
 */
Model.filterSchema = function(mask) {
  var schema = _.pick(this.schema, ['name', 'properties']);
  schema.properties = _.pick(schema.properties, this._maskToProperties(mask));
  return schema;
};

/*
 * Filter data with a filter specified in the model's schema
 *
 * @param {Object} Data to filter
 * @param {String|Array} Either a string naming a mask specified in this model's schema or a list of properties.
 * @return {Object} Filtered data
 */
Model.filter = function(data, mask) {
  if (!mask) return data;

  return _.pick(data, this._maskToProperties(mask));
};

/*
 * Return the singular resource name for a model
 */
Model.resourceName = function() {
  return inflection.singularize(this.schema.name);
};

/*
 * Validate data against this model
 *
 * @param data {object} The data to validate
 * @param mask {string} Optional - The mask to validate the data against. If
 *    not provided then all attributes are validated against
 * @return {object} The results of the validation
 */
Model.validate = function(data, mask, cb) {
  var self = this;

  if (_.isFunction(mask)) {
    cb = mask;
    mask = undefined;
  }

  if (!mask) mask = 'all';
  var schema = this.filterSchema(mask);

  validator(data, schema, cb);
};

module.exports = Model;
