const mongoose = require('mongoose');
const env = require('../src/config/env');
const Permission = require('../src/models/Permission');
const Role = require('../src/models/Role');
const User = require('../src/models/User');

const permissionsData = [
  // Customers
  { name: 'customers:create', module: 'customers', description: 'Allows creating customer records' },
  { name: 'customers:view', module: 'customers', description: 'Allows viewing customer records' },
  { name: 'customers:update', module: 'customers', description: 'Allows modifying customer records' },
  { name: 'customers:delete', module: 'customers', description: 'Allows deleting customer records' },

  // Suppliers
  { name: 'suppliers:create', module: 'suppliers', description: 'Allows creating supplier records' },
  { name: 'suppliers:view', module: 'suppliers', description: 'Allows viewing supplier records' },
  { name: 'suppliers:update', module: 'suppliers', description: 'Allows modifying supplier records' },
  { name: 'suppliers:delete', module: 'suppliers', description: 'Allows deleting supplier records' },

  // Journal Entries
  { name: 'journal_entries:create', module: 'accounting', description: 'Allows creating journal entries' },
  { name: 'journal_entries:view', module: 'accounting', description: 'Allows viewing journal entries' },
  { name: 'journal_entries:update', module: 'accounting', description: 'Allows modifying journal entries' },
  { name: 'journal_entries:submit', module: 'accounting', description: 'Allows submitting journal entries' },
  { name: 'journal_entries:cancel', module: 'accounting', description: 'Allows cancelling journal entries' },

  // Sales Invoices
  { name: 'sales_invoices:create', module: 'accounting', description: 'Allows creating sales invoices' },
  { name: 'sales_invoices:view', module: 'accounting', description: 'Allows viewing sales invoices' },
  { name: 'sales_invoices:update', module: 'accounting', description: 'Allows modifying sales invoices' },
  { name: 'sales_invoices:submit', module: 'accounting', description: 'Allows submitting sales invoices' },
  { name: 'sales_invoices:cancel', module: 'accounting', description: 'Allows cancelling sales invoices' },

  // Purchase Invoices
  { name: 'purchase_invoices:create', module: 'accounting', description: 'Allows creating purchase invoices' },
  { name: 'purchase_invoices:view', module: 'accounting', description: 'Allows viewing purchase invoices' },
  { name: 'purchase_invoices:update', module: 'accounting', description: 'Allows modifying purchase invoices' },
  { name: 'purchase_invoices:submit', module: 'accounting', description: 'Allows submitting purchase invoices' },
  { name: 'purchase_invoices:cancel', module: 'accounting', description: 'Allows cancelling purchase invoices' },

  // Roles
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
      permissions: getPermIds(['sales_invoices:create', 'sales_invoices:view', 'sales_invoices:update', 'purchase_invoices:create', 'purchase_invoices:view', 'purchase_invoices:update', 'journal_entries:create', 'journal_entries:view', 'journal_entries:update', 'journal_entries:submit', 'customers:view', 'suppliers:view'])
    });

    const auditorRole = await Role.create({
      name: 'AUDITOR',
      description: 'Internal or external compliance auditor with read-only permissions',
      permissions: getPermIds(['sales_invoices:view', 'purchase_invoices:view', 'journal_entries:view', 'customers:view', 'suppliers:view'])
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
