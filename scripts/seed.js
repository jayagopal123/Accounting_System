const mongoose = require('mongoose');
const env = require('../src/config/env');
const Permission = require('../src/models/Permission');
const Role = require('../src/models/Role');
const User = require('../src/models/User');

const permissionsData = [
  { name: 'invoices:create', module: 'accounting', description: 'Allows creating customer invoices' },
  { name: 'invoices:read', module: 'accounting', description: 'Allows viewing customer invoices' },
  { name: 'invoices:update', module: 'accounting', description: 'Allows modifying existing customer invoices' },
  { name: 'invoices:delete', module: 'accounting', description: 'Allows deleting customer invoices' },
  { name: 'roles:create', module: 'settings', description: 'Allows creating and mapping security roles' }
];

const seed = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(env.MONGODB_URI);
    console.log('Connected.');

    // 1. Clean Database
    console.log('Clearing existing collections...');
    await User.deleteMany({});
    await Role.deleteMany({});
    await Permission.deleteMany({});
    console.log('Cleared.');

    // 2. Insert Permissions
    console.log('Seeding Permissions...');
    const seededPermissions = await Permission.insertMany(permissionsData);
    console.log(`Seeded ${seededPermissions.length} permissions.`);

    // Helper to get permission ObjectIds
    const getPermIds = (names) => {
      return seededPermissions
        .filter(p => names.includes(p.name))
        .map(p => p._id);
    };

    // 3. Create Roles
    console.log('Seeding Roles...');
    const adminRole = await Role.create({
      name: 'SYSTEM_ADMIN',
      description: 'System Administrator with full access keys',
      permissions: seededPermissions.map(p => p._id) // All permissions
    });

    const accountantRole = await Role.create({
      name: 'ACCOUNTANT',
      description: 'Accountant officer with standard ledger and invoice modify access',
      permissions: getPermIds(['invoices:create', 'invoices:read', 'invoices:update'])
    });

    const auditorRole = await Role.create({
      name: 'AUDITOR',
      description: 'Internal or external compliance auditor with read-only permissions',
      permissions: getPermIds(['invoices:read'])
    });

    console.log('Seeded roles: SYSTEM_ADMIN, ACCOUNTANT, AUDITOR.');

    // 4. Create default Admin User
    console.log('Seeding Default Admin User...');
    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@company.com',
      password: 'AdminPassword123!', // Hashed via Mongoose pre-save hook
      roles: [adminRole._id],
      status: 'active'
    });

    console.log(`Seeded default admin user: ${adminUser.email}`);
    console.log('Database seeding completed successfully.');
    
    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error(`Seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seed();
