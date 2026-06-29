import mongoose from 'mongoose';
import env from '../src/config/env.js';
import User from '../src/models/User.js';
import Role from '../src/models/Role.js';

const run = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log('Connected to MongoDB.');

    // Find ACCOUNTANT role
    const acctRole = await Role.findOne({ name: 'ACCOUNTANT' });
    if (!acctRole) {
      console.log('ACCOUNTANT role not found!');
      process.exit(1);
    }

    // Check if accountant user already exists
    let acctUser = await User.findOne({ email: 'accountant@company.com' });
    if (acctUser) {
      console.log('Accountant user already exists, updating role...');
      acctUser.roles = [acctRole._id];
      await acctUser.save();
    } else {
      // Create accountant user
      acctUser = await User.create({
        name: 'Accountant User',
        email: 'accountant@company.com',
        password: 'Accountant@123',
        roles: [acctRole._id],
        status: 'active'
      });
      console.log('Created user:', acctUser.email, 'with role: ACCOUNTANT');
    }

    // Show all users with roles
    const users = await User.find().populate({ path: 'roles', select: 'name' }).select('email status roles').lean();
    console.log('\n=== All Users ===');
    users.forEach(u => console.log(`  ${u.email} | status: ${u.status} | roles: ${u.roles?.map(r => r.name).join(', ')}`));
    console.log('=================\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('ERROR:', error.message);
    process.exit(1);
  }
};

run();
