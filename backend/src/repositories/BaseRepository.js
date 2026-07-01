import mongoose from "mongoose";

class BaseRepository {
  constructor(model) {
    if (this.constructor === BaseRepository) {
      throw new Error(
        "Abstract class 'BaseRepository' cannot be instantiated directly."
      );
    }

    this.model = model;
  }

  isValidObjectId(id) {
    return mongoose.Types.ObjectId.isValid(id);
  }

  async create(data, options = {}) {
    const document = new this.model(data);
    return document.save(options);
  }

  async findById(id, populateOptions = null, options = {}) {
    if (!this.isValidObjectId(id)) return null;

    let query = this.model.findById(id);

    if (populateOptions) {
      query = query.populate(populateOptions);
    }

    if (options.session) {
      query = query.session(options.session);
    }

    return query.exec();
  }

  async findOne(filter, populateOptions = null, options = {}) {
    let query = this.model.findOne(filter);

    if (populateOptions) {
      query = query.populate(populateOptions);
    }

    if (options.session) {
      query = query.session(options.session);
    }

    return query.exec();
  }

  async findAll(options = {}) {
    let query = this.model.find();
    if (options.session) query = query.session(options.session);
    return query.exec();
  }

  async find(filter = {}, populateOptions = null, options = {}) {
    let query = this.model.find(filter);

    if (populateOptions) {
      query = query.populate(populateOptions);
    }

    if (options.session) {
      query = query.session(options.session);
    }

    return query.exec();
  }

  async update(id, data, options = { new: true }) {
    if (!this.isValidObjectId(id)) return null;

    return this.model.findByIdAndUpdate(id, data, options).exec();
  }

  async delete(id, options = {}) {
    if (!this.isValidObjectId(id)) return null;

    let query = this.model.findByIdAndDelete(id);
    if (options.session) {
      query = query.session(options.session);
    }

    return query.exec();
  }
}

export default BaseRepository;