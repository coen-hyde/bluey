'use strict'

var awsMock = require('aws-sdk-mock');
var AWS = require('aws-sdk');
var expect = require('expect.js');
var bluey = require('../../');
var adapter = require('../../lib/adapters/dynamodb');

describe('Adapter:Dynamodb', function() {
  afterEach(() => awsMock.restore());

  it('should put an item', function(done) {
    var data = { id: 'test', name: 'test' };

    awsMock.mock('DynamoDB.DocumentClient', 'put', function (params, cb){
      expect(params.Item.id).to.eql(data.id);
      expect(params.Item.name).to.eql(data.name);

      cb(null, "successfully put item in database");
    });

    var model = bluey({
      name: 'users',
      adapter: new AWS.DynamoDB(),
      type: 'dynamodb',
      properties: {
        id: {
          type: 'string',
          required: true
        },
        name: {
          type: 'string',
          required: true
        }
      }
    });

    model.put({id: 'test', name: 'test'}, (err, data) => {
      expect(err).to.equal(null);
      done();
    });
  });
});
