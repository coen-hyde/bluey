'use strict'

var AWS = require('aws-sdk-mock');
var expect = require('expect.js');
var adapter = require('../../lib/adapters/dynamodb');

describe('Adapter:Dynamodb', function() {
  describe('DataTransform', function() {
    var tests = [
      { type: 'string', dynoType: 'S', data: 'foo' },
      { type: 'iteger', dynoType: 'N', data: 1 },
      { type: 'boolean', dynoType: 'BOOL', data: true },
      { type: 'array', dynoType: 'L', data: [1,2,3] }
    ];

    tests.forEach((test) => {
      it(`should map ${test.type} columns`, function(done) {
        var properties = {
          key: {
            type: test.type
          }
        }

        var data = { key: test.data };
        var transformation = adapter._dataToItem(properties, data);

        expect(transformation).to.eql({
          key: {
            [test.dynoType]: test.data
          }
        });

        done();
      });
    });

    it('should map nested data', function(done) {
      var properties = {
        key: {
          type: 'object',
          properties: {
            nested: {
              type: 'string'
            }
          }
        }
      }

      var data = { key: { nested: 'value' } };
      var transformation = adapter._dataToItem(properties, data);

      expect(transformation).to.eql({
        key: {
          M: {
            nested: {
              S: 'value'
            }
          }
        }
      });

      done();
    });
  })
});
