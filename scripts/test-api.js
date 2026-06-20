const mongoose = require('mongoose');
const app = require('../src/app');
const env = require('../src/config/env');
const Role = require('../src/models/Role');

const TEST_PORT = 5001;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}/api/v1`;

const runTests = async () => {
  let server;
  try {
    console.log('Connecting to database for test assertions...');
    await mongoose.connect(env.MONGODB_URI);
    
    console.log(`Starting test server on port ${TEST_PORT}...`);
    server = app.listen(TEST_PORT);
    console.log('Server started.');

    // Helper to log test status
    const assert = (condition, message) => {
      if (condition) {
        console.log(`[PASS] ${message}`);
      } else {
        throw new Error(`[FAIL] Assert failed: ${message}`);
      }
    };

    // 1. Test Admin Login
    console.log('\n--- Test Case 1: Login Default Admin ---');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@company.com',
        password: 'AdminPassword123!'
      })
    });
    
    const loginData = await loginRes.json();
    assert(loginRes.status === 200, `Admin login response code is 200 (Got ${loginRes.status})`);
    assert(loginData.success === true, 'Admin login payload success is true');
    assert(!!loginData.data.token, 'Admin login token returned');
    assert(loginData.data.user.email === 'admin@company.com', 'User email matches admin');
    
    const adminToken = loginData.data.token;

    // 2. Test Register New User (Joe, standard accountant role fallback)
    console.log('\n--- Test Case 2: Register Accountant User ---');
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Accountant Joe',
        email: 'joe@company.com',
        password: 'AccountantPassword123!'
      })
    });

    const regData = await regRes.json();
    assert(regRes.status === 201, `Register response code is 201 (Got ${regRes.status})`);
    assert(regData.success === true, 'Register success is true');
    assert(regData.data.user.email === 'joe@company.com', 'Registered user email matches');
    assert(regData.data.user.roles.length > 0, 'User has default fallback roles assigned');

    // 3. Test Login with New User (Joe)
    console.log('\n--- Test Case 3: Login Accountant User ---');
    const joeLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'joe@company.com',
        password: 'AccountantPassword123!'
      })
    });

    const joeLoginData = await joeLoginRes.json();
    assert(joeLoginRes.status === 200, 'Joe login response code is 200');
    assert(!!joeLoginData.data.token, 'Joe login token returned');
    
    const joeToken = joeLoginData.data.token;

    // 4. Test RBAC Enforcement: Try creating a role as Joe (should be rejected with 403)
    console.log('\n--- Test Case 4: RBAC Rejection (Accountant creating role) ---');
    const roleFailRes = await fetch(`${BASE_URL}/roles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${joeToken}`
      },
      body: JSON.stringify({
        name: 'AUDITOR_JUNIOR',
        description: 'Junior auditor role'
      })
    });

    const roleFailData = await roleFailRes.json();
    assert(roleFailRes.status === 403, `Role creation rejected with 403 (Got ${roleFailRes.status})`);
    assert(roleFailData.success === false, 'Payload success is false');
    assert(roleFailData.error.code === 'FORBIDDEN', 'Error code matches FORBIDDEN');

    // 5. Test RBAC Execution: Create a role as Admin (should succeed with 201)
    console.log('\n--- Test Case 5: RBAC Success (Admin creating role) ---');
    const roleSuccessRes = await fetch(`${BASE_URL}/roles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: 'AUDITOR_JUNIOR',
        description: 'Junior auditor role'
      })
    });

    const roleSuccessData = await roleSuccessRes.json();
    assert(roleSuccessRes.status === 201, `Role created with 201 (Got ${roleSuccessRes.status})`);
    assert(roleSuccessData.success === true, 'Role creation success is true');
    assert(roleSuccessData.data.role.name === 'AUDITOR_JUNIOR', 'Created role name matches input');

    // 6. Test Input Validation error (Duplicate Role Name)
    console.log('\n--- Test Case 6: Duplicate Index validation error ---');
    const duplicateRoleRes = await fetch(`${BASE_URL}/roles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: 'AUDITOR_JUNIOR',
        description: 'Duplicate role creation attempt'
      })
    });

    const duplicateRoleData = await duplicateRoleRes.json();
    assert(duplicateRoleRes.status === 409, `Rejected with 409 Conflict (Got ${duplicateRoleRes.status})`);
    assert(duplicateRoleData.success === false, 'Payload success is false');
    assert(duplicateRoleData.error.code === 'ROLE_ALREADY_EXISTS' || duplicateRoleData.error.code === 'DUPLICATE_RESOURCE', 'Error code matches duplicates');

    // 7. Test Logout API
    console.log('\n--- Test Case 7: Logout ---');
    const logoutRes = await fetch(`${BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    const logoutData = await logoutRes.json();
    assert(logoutRes.status === 200, 'Logout status is 200');
    assert(logoutData.success === true, 'Logout success payload is true');

    console.log('\n=====================================');
    console.log('ALL API INTEGRATION TESTS PASSED SUCCESSFULLY!');
    console.log('=====================================');

  } catch (error) {
    console.error(`\nTest pipeline crashed: ${error.message}`);
    process.exit(1);
  } finally {
    if (server) {
      console.log('Stopping test server...');
      server.close();
    }
    console.log('Closing database connection...');
    await mongoose.connection.close();
    process.exit(0);
  }
};

runTests();
