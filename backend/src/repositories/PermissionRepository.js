import BaseRepository from "./BaseRepository.js";
import Permission from "../models/Permission.js";

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

export default PermissionRepository;
