'use strict'

var expect = require('expect.js');
var validator = require('../../lib/validator');

describe('Validator:Defaults', function() {
  it('should apply defaults to flat schema', function(done) {
    var schema = {
      name: 'test',
      properties: {
        key1: {
          description: 'key1',
          type: 'string',
          default: 'boop',
          required: true
        },
        key2: {
          description: 'key1',
          type: 'string',
          default: 'applied default',
          required: false
        }
      }
    }

    var data = {
      key1: "value1"
    }

    validator(data, schema, function(err, result, data) {
      expect(err).to.equal(null);
      expect(result.valid).to.equal(true);
      expect(data.key1).to.not.equal('boop');
      expect(data.key2).to.equal('applied default');
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
          required: true
        },
        nested: {
          description: 'Nested values',
          type: 'object',
          properties: {
            key1: {
              type: 'string',
              default: 'yo'
            },
            key2: {
              type: 'string',
              default: 'beep'
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
      expect(data.nested.key1).to.equal('yo');
      expect(data.nested.key2).to.not.equal('beep');
      done();
    });
  });

  it('should apply default with function value', function(done) {
    var schema = {
      name: 'test',
      properties: {
        key1: {
          description: 'key1',
          type: 'string',
          default: function() {
            return 'woot'
          },
          required: true
        }
      }
    }

    var data = {}

    validator(data, schema, function(err, result, data) {
      expect(err).to.equal(null);
      expect(result.valid).to.equal(true);
      expect(data.key1).to.equal('woot');
      done();
    });
  });
});
