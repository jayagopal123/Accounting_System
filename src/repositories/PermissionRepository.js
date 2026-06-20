const BaseRepository = require('./BaseRepository');
const Permission = require('../models/Permission');

class PermissionRepository extends BaseRepository {
  constructor() {
    super(Permission);
  }

  async findByName(name) {
    if (!name) return null;
    return this.findOne({ name: name.toLowerCase() });
  }

  async findByModule(module) {
    if (!module) return [];
    return this.find({ module: module.toLowerCase() });
  }
}

module.exports = PermissionRepository;
