
var Base = {};

function castId(id) {
  return parseInt(id, 10);
};

/* Create a knex query on this table
 *
 * @return {Promise} A Knex query Promise
 */
Base.query = function() {
  this.db(this.name);
}

/*
 * Insert a document into Mongo
 *
 * @param {Object} Data to insert
 * @param {Function} [callback] The function called after insert.
 */
Base.insert = function(data, cb) {
  var model = this;

  // Make sure data is valid
  this.validate(data, function(err, result, data) {
    if (err) return cb(err);

    if (!result.valid) return cb(result.errors);

    if (typeof data.createdAt === 'undefined') {
      data.createdAt = new Date();
    }

    model.query().insert(data).asCallback(function(err, result) {
      if (err) return cb(err);

      model.collection.findById(result.insertedId, cb);
    });
  });
};

// /*
//  * Update a record
//  *
//  * @param {String|Object} Id of the row to update
//  * @param {Object} Mongo update operation
//  * @param {Function} [callback] The function called after update.
//  */
// Model.update = function(id, update, cb) {
//   return this.query()
//     .where('id', castId(id))
//     .asCallback(cb);
// };

/*
 * Do a partial update of a record
 *
 * @param {Integer} Id of the record to update
 * @param {Object} A hash of properties with values to set
 * @param {Function} [callback] The function called after update.
 */
Base.patch = function(id, patch, cb) {
  return this.query()
    .where('id', castId(id))
    .update(patch)
    .asCallback(cb);
}

/*
 * Get a record
 *
 * @param {Integer} Id of the record to get
 * @param {Function} [callback] The function called with the fetched record.
 */
Base.get = function(id, cb) {
  return this.query()
    .where('id', castId(id))
    .asCallback(cb);
};

/*
 * Delete a record
 *
 * @param {Integer} Id of the record to delete
 * @param {Function} [callback] The function called with when the record is deleted.
 */
Base.del = function(id, cb) {
  return this.query()
    .where('id', castId(id))
    .del()
    .asCallback(cb);
};

module.exports = Base;
