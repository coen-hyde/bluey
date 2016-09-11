'use strict'

var expect = require('expect.js');
var validator = require('../../lib/validator');

describe('Validator:Filter', function() {
  it('should remove unlisted properties from flat schema', function(done) {
    var schema = {
      name: 'test',
      properties: {
        key1: {
          description: 'key1',
          type: 'string',
        },
        key2: {
          description: 'key1',
          type: 'string',
        }
      }
    }

    var data = {
      key1: "value1",
      key3: "yo"
    }

    validator(data, schema, function(err, result, data) {
      expect(err).to.equal(null);
      expect(result.valid).to.equal(true);

      // Key 3 should not exist
      expect(data.key3).to.equal(undefined);
      done();
    });
  });

  it('should apply defaults to nested schema', function(done) {
    var schema = {
      name: 'test',
      properties: {
        key1: {
          description: 'key1',
          type: 'string',
        },
        nested: {
          description: 'Nested values',
          type: 'object',
          properties: {
            key1: {
              type: 'string'
            }
          }
        }
      }
    };

    var data = {
      key1: 'value1',
      nested: {
        key2: 'hey'
      }
    };

    validator(data, schema, function(err, result, data) {
      expect(err).to.equal(null);
      expect(result.valid).to.equal(true);
      expect(data.nested.key2).to.equal(undefined);
      done();
    });
  });
});
