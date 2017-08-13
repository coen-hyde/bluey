'use strict'

var awsMock = require('aws-sdk-mock');
var AWS = require('aws-sdk');
var expect = require('expect.js');
var bluey = require('../../');
var adapter = require('../../lib/adapters/dynamodb');

describe('Adapter:Dynamodb', function() {
  afterEach(() => awsMock.restore());

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
      },
      age: {
        type: 'number'
      }
    }
  });

  it('should get an item', function(done) {
    var item = { uuid: 'yo', key: 'value' };

    awsMock.mock('DynamoDB.DocumentClient', 'get', function (params, cb){
      expect(params.Key.uuid).to.equal('yo');
      cb(null, { Item: item });
    });

    model.get('yo', (err, item) => {
      expect(err).to.equal(null);
      expect(item).to.equal(item);
      done();
    });
  });

  it('should put an item', function(done) {
    var data = { id: 'test', name: 'test' };

    awsMock.mock('DynamoDB.DocumentClient', 'put', function (params, cb){
      expect(params.Item.id).to.equal(data.id);
      expect(params.Item.name).to.equal(data.name);

      cb(null, { Attributes: { uuid: 'yo' }});
    });

    model.put({id: 'test', name: 'test'}, (err, data) => {
      expect(err).to.equal(null);
      done();
    });
  });

  it('should partialPut an item', function(done) {
    var data = {
      id: 'test',
      name: 'test'
    };

    awsMock.mock('DynamoDB.DocumentClient', 'update', function (params, cb) {
      expect(params).to.eql({
        Key: {
          HashKey: 'uuid',
          NumberRangeKey: 'yo'
        },
        AttributeUpdates: {
          name: { Action: 'PUT', Value: 'test' },
          age: { Action: 'DELETE', Value: null }
        },
        ReturnValues: 'ALL_NEW'
      });

      cb(null, { Attributes: { uuid: 'yo' }});
    });

    model.partialPut('yo', data, ['name', 'age'], (err, data) => {
      expect(err).to.equal(null);
      done();
    });
  });

  it('should delete an item', function(done) {
    awsMock.mock('DynamoDB.DocumentClient', 'delete', function (params, cb){
      expect(params.Key.HashKey).to.equal('uuid');
      expect(params.Key.NumberRangeKey).to.equal('yo');
      cb(null);
    });

    model.del('yo', (err, data) => {
      expect(err).to.equal(null);
      done();
    });
  });
});
