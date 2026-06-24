const mongoose = require('mongoose');

class BaseRepository {
  constructor(model) {
    if (this.constructor === BaseRepository) {
      throw new Error("Abstract class 'BaseRepository' cannot be instantiated directly.");
    }
    this.model = model;
  }

  // Basic object ID format check
  isValidObjectId(id) {
    return mongoose.Types.ObjectId.isValid(id);
  }

  async create(data, session = null) {
    const document = new this.model(data);
    return document.save({ session });
  }

  async findById(id, populateOptions = null) {
    if (!this.isValidObjectId(id)) return null;
    let query = this.model.findById(id);
    if (populateOptions) {
      query = query.populate(populateOptions);
    }
    return query.exec();
  }

  async findOne(filter, populateOptions = null) {
    let query = this.model.findOne(filter);
    if (populateOptions) {
      query = query.populate(populateOptions);
    }
    return query.exec();
  }

  async find(filter = {}, populateOptions = null) {
    let query = this.model.find(filter);
    if (populateOptions) {
      query = query.populate(populateOptions);
    }
    return query.exec();
  }

  async update(id, data, options = { new: true }) {
    if (!this.isValidObjectId(id)) return null;
    return this.model.findByIdAndUpdate(id, data, options).exec();
  }

  async delete(id) {
    if (!this.isValidObjectId(id)) return null;
    return this.model.findByIdAndDelete(id).exec();
  }
}

module.exports = BaseRepository;
