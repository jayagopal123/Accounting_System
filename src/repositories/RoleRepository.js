const BaseRepository = require('./BaseRepository');
const Role = require('../models/Role');

class RoleRepository extends BaseRepository {
  constructor() {
    super(Role);
  }

  async findByName(name) {
    if (!name) return null;
    return this.findOne({ name: name.toUpperCase() });
  }

  async findByIdWithPermissions(id) {
    return this.findById(id, 'permissions');
  }
}

module.exports = RoleRepository;
