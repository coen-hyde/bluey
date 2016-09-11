var _ = require('lodash');
var async = require('async');
var revalidator = require('revalidator');

/* If param is a function; exectute and return that value.
 * Else return value as is.
 *
 * @param value {Mixed}
 * @return {Mixed}
 */
function callValue(value) {
  if (_.isFunction(value)) {
    return value();
  };

  return value;
}
/*
 * Remove undeclared properties from the inout data
 *
 * @param data {Object} The input data to process
 * @param properties {Array} An array of properties to filter data against
 */
function filter(data, properties) {
  var data = _.pick(data, _.keys(properties));
  return _.zipObject(_.keys(data), _.map(data, function(value, property) {
    if (!properties[property].properties) return value;
    return filter(value, properties[property].properties);
  }));
}

/*
 * Apply defaults to input Data
 *
 * @param data {Object} The input data to process
 * @param properties {Object} A hash of properties to apply defaults from
 */
function defaults(data, properties) {
  _.each(properties, function(property, key) {
    if (typeof property['default'] !== 'undefined' && typeof data[key] === 'undefined') {
      data[key] = callValue(property['default']);
    }
  });

  return _.zipObject(_.keys(data), _.map(data, function(value, propertyName) {
    if (!properties[propertyName].properties) {
      return value;
    }
    return defaults(value, properties[propertyName].properties);
  }));
}

/*
 * Generate an Error hash
 *
 * @param attribute {String} The data attribute that failed validation
 * @param property {String} The schema property that triggered the validation error
 * @param message {String} The error message
 */
function makeValidationError(attribute, property, message) {
  return {
    attribute: attribute,
    property: property,
    message: message
  };
}

/*
 * Apply async validators against input Data
 *
 */
function applyAsyncValidators(data, properties, cb) {
  function validate(propertyData, properties, depth, cb) {
    if (_.isFunction(depth)) {
      cb = depth;
      depth = [];
    }

    async.each(_.keys(properties), function(key, done) {
      var schemaValue = properties[key];
      var propertyDepth = _.clone(depth);
      propertyDepth.push(key);
      var propertyMessage = 'Data failed validation';

      // Run validators on nested schema
      var isNested = (_.last(depth) === 'properties' || key === 'properties')
      if (isNested && !_.isFunction(schemaValue) && _.isObject(schemaValue)) {
        var nestedData = (_.isObject(propertyData) && propertyData[key])? propertyData[key] : undefined;
        return validate(nestedData, schemaValue, propertyDepth, done);
      }

      // If value is not a function or it's a known non validator. Then skip it
      if (!_.isFunction(schemaValue) || _.indexOf(['default'], key) !== -1) return done();

      // Use a different error message if one is defined
      if (properties['messages'] && properties['messages'][key]) {
        propertyMessage = properties['messages'][key];
      }

      schemaValue(propertyData, data, function(err, result) {
        if (err) return done(err);

        if (!result) {
          var propertyPath = _.initial(_.without(propertyDepth, 'properties')).join('.')
          return done(makeValidationError(key, propertyPath, propertyMessage));
        }

        done();
      })
    }, cb);
  }

  validate(data, properties, ['properties'], function(err) {
    if (err) {
      return cb(null, { valid: false, errors: [err] }, data);
    }

    return cb(null, { valid: true }, data);
  });
}

module.exports = function(data, schema, cb) {
  // Filter out properties in the data that are not specified in the schema
  data = filter(data, schema.properties);
  data = defaults(data, schema.properties);

  // Apply revalidator validation rules
  var result = revalidator.validate(data, schema, { cast: true });
  if (!result.valid) {
    return cb(null, result, data);
  }

  // Apply async validator
  applyAsyncValidators(data, schema.properties, cb);
}
