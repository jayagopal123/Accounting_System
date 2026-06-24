import BaseRepository from "./BaseRepository.js";
import Role from "../models/Role.js";

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

export default RoleRepository;
