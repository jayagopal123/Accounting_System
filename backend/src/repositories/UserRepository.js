import BaseRepository from "./BaseRepository.js";
import User from "../models/User.js";

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email) {
    return this.findOne({ email });
  }

  async findByEmailWithRolesAndPermissions(email) {
    return this.findOne({ email }, {
      path: 'roles',
      populate: {
        path: 'permissions'
      }
    });
  }

  async findByIdWithRolesAndPermissions(id) {
    return this.findById(id, {
      path: 'roles',
      populate: {
        path: 'permissions'
      }
    });
  }
}

export default UserRepository;
