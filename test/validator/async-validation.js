'use strict'

var expect = require('expect.js');
var validator = require('../../lib/validator');

describe('Validator:AsyncValidation', function() {
  it('should apply async validators to data', function(done) {
    var schema = {
      name: 'test',
      properties: {
        key1: {
          description: 'key1',
          type: 'string',
          format: function(propertyData, data, cb) {
            return cb(null, false);
          }
        }
      }
    }

    var data = {
      key1: "value1",
      key3: "yo"
    }

    validator(data, schema, function(err, result, data) {
      expect(err).to.equal(null);
      expect(result.valid).to.equal(false);

      expect(result.errors).to.have.length(1);
      expect(result.errors[0].attribute).to.equal('format');
      expect(result.errors[0].property).to.equal('key1');
      done();
    });
  });

  it('should apply async validators to data with custom error message', function(done) {
    var schema = {
      name: 'test',
      properties: {
        key1: {
          description: 'key1',
          type: 'string',
          format: function(propertyData, data, cb) {
            return cb(null, false);
          },
          messages: {
            format: 'yo, this failed'
          }
        }
      }
    }

    var data = {
      key1: "value1",
      key3: "yo"
    }

    validator(data, schema, function(err, result, data) {
      expect(err).to.equal(null);
      expect(result.valid).to.equal(false);

      expect(result.errors).to.have.length(1);
      expect(result.errors[0].message).to.equal('yo, this failed');
      done();
    });
  });
});
