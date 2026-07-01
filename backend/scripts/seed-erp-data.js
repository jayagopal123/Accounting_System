/**
 * Comprehensive ERP Data Seeding Script
 * ======================================
 * Populates the local MongoDB database with realistic, fully-related ERP data
 * across ALL implemented modules. All references, business rules, balances,
 * and accounting postings are consistent for end-to-end testing.
 *
 * Modules seeded:
 *   - Permissions, Roles, Users (5 users)
 *   - Chart of Accounts (hierarchical, 28 accounts)
 *   - Customers (5), Suppliers (5)
 *   - Tax Rates (CGST/SGST/IGST) & Tax Groups (GST @ 18%)
 *   - Fiscal Year, Numbering Series, Cost Centers
 *   - Currency Exchange Rates
 *   - Journal Entries (11 entries, all balanced)
 *   - Sales Invoices (5), Purchase Invoices (5)
 *   - Credit Notes (2), Debit Notes (2)
 *   - Payments (receipts + payments with bank transactions)
 *   - Bank Accounts & Bank Transactions
 *   - Asset Categories & Assets (3 categories, 4 assets)
 *   - Notifications & Activity Logs
 *
 * Usage: node scripts/seed-erp-data.js
 */

import mongoose from "mongoose";
import env from "../src/config/env.js";

// ==========================================================================
// Models
// ==========================================================================
import Permission from "../src/models/Permission.js";
import Role from "../src/models/Role.js";
import User from "../src/models/User.js";
import Account from "../src/models/Account.js";
import Customer from "../src/models/Customer.js";
import Supplier from "../src/models/Supplier.js";
import JournalEntry from "../src/models/JournalEntry.js";
import SalesInvoice from "../src/models/SalesInvoice.js";
import PurchaseInvoice from "../src/models/PurchaseInvoice.js";
import CreditNote from "../src/models/CreditNote.js";
import DebitNote from "../src/models/DebitNote.js";
import Payment from "../src/models/Payment.js";
import TaxRate from "../src/models/TaxRate.js";
import TaxGroup from "../src/models/TaxGroup.js";
import FiscalYear from "../src/models/FiscalYear.js";
import NumberingSeries from "../src/models/NumberingSeries.js";
import CostCenter from "../src/models/CostCenter.js";
import CurrencyExchangeRate from "../src/models/CurrencyExchangeRate.js";
import Budget from "../src/models/Budget.js";
import BankAccount from "../src/models/BankAccount.js";
import BankTransaction from "../src/models/BankTransaction.js";
import AssetCategory from "../src/models/AssetCategory.js";
import Asset from "../src/models/Asset.js";
import Notification from "../src/models/Notification.js";
import ActivityLog from "../src/models/ActivityLog.js";

// ==========================================================================
// Seed Data Definitions
// ==========================================================================

// --- Permissions (same as existing seed.js) ---
const PERMISSIONS = [
  { name: "customers:create", module: "customers", description: "Allows creating customer records" },
  { name: "customers:view", module: "customers", description: "Allows viewing customer records" },
  { name: "customers:update", module: "customers", description: "Allows modifying customer records" },
  { name: "customers:delete", module: "customers", description: "Allows deleting customer records" },
  { name: "suppliers:create", module: "suppliers", description: "Allows creating supplier records" },
  { name: "suppliers:view", module: "suppliers", description: "Allows viewing supplier records" },
  { name: "suppliers:update", module: "suppliers", description: "Allows modifying supplier records" },
  { name: "suppliers:delete", module: "suppliers", description: "Allows deleting supplier records" },
  { name: "journal_entries:create", module: "accounting", description: "Allows creating journal entries" },
  { name: "journal_entries:view", module: "accounting", description: "Allows viewing journal entries" },
  { name: "journal_entries:update", module: "accounting", description: "Allows modifying journal entries" },
  { name: "journal_entries:submit", module: "accounting", description: "Allows submitting journal entries" },
  { name: "journal_entries:cancel", module: "accounting", description: "Allows cancelling journal entries" },
  { name: "sales_invoices:create", module: "accounting", description: "Allows creating sales invoices" },
  { name: "sales_invoices:view", module: "accounting", description: "Allows viewing sales invoices" },
  { name: "sales_invoices:update", module: "accounting", description: "Allows modifying sales invoices" },
  { name: "sales_invoices:submit", module: "accounting", description: "Allows submitting sales invoices" },
  { name: "sales_invoices:cancel", module: "accounting", description: "Allows cancelling sales invoices" },
  { name: "purchase_invoices:create", module: "accounting", description: "Allows creating purchase invoices" },
  { name: "purchase_invoices:view", module: "accounting", description: "Allows viewing purchase invoices" },
  { name: "purchase_invoices:update", module: "accounting", description: "Allows modifying purchase invoices" },
  { name: "purchase_invoices:submit", module: "accounting", description: "Allows submitting purchase invoices" },
  { name: "purchase_invoices:cancel", module: "accounting", description: "Allows cancelling purchase invoices" },
  { name: "credit_notes:create", module: "accounting", description: "Allows creating credit notes" },
  { name: "credit_notes:view", module: "accounting", description: "Allows viewing credit notes" },
  { name: "credit_notes:update", module: "accounting", description: "Allows modifying credit notes" },
  { name: "credit_notes:submit", module: "accounting", description: "Allows submitting credit notes" },
  { name: "credit_notes:cancel", module: "accounting", description: "Allows cancelling credit notes" },
  { name: "debit_notes:create", module: "accounting", description: "Allows creating debit notes" },
  { name: "debit_notes:view", module: "accounting", description: "Allows viewing debit notes" },
  { name: "debit_notes:update", module: "accounting", description: "Allows modifying debit notes" },
  { name: "debit_notes:submit", module: "accounting", description: "Allows submitting debit notes" },
  { name: "debit_notes:cancel", module: "accounting", description: "Allows cancelling debit notes" },
  { name: "roles:create", module: "settings", description: "Allows creating and mapping security roles" },
  { name: "accounts:create", module: "settings", description: "Allows creating chart of accounts" },
  { name: "accounts:view", module: "settings", description: "Allows viewing chart of accounts" },
  { name: "accounts:update", module: "settings", description: "Allows modifying accounts" },
  { name: "audit_logs:view", module: "settings", description: "Allows viewing system audit logs" },
];

// --- Chart of Accounts (hierarchical) ---
// Top-level groups are inserted first, then children reference parent _ids.
// The codes must align with what the services expect:
//   "1101" = Accounts Receivable
//   "2001" = Accounts Payable
//   "4001" = Sales Revenue
//   "5001" = Purchase Expense

const ACCOUNTS_DATA = [
  // ===== ASSETS (1000-1999) =====
  { accountCode: "1000", accountName: "Current Assets", accountType: "ASSET", isGroup: true, level: 1, ancestors: [] },
  { accountCode: "1100", accountName: "Accounts Receivable", accountType: "ASSET", isGroup: true, level: 2, parentCode: "1000" },
  { accountCode: "1101", accountName: "Trade Receivables", accountType: "ASSET", isGroup: false, level: 3, parentCode: "1100", amount: 0 },
  { accountCode: "1200", accountName: "Cash & Bank", accountType: "ASSET", isGroup: true, level: 2, parentCode: "1000" },
  { accountCode: "1201", accountName: "Cash in Hand", accountType: "ASSET", isGroup: false, level: 3, parentCode: "1200", amount: 500000 },
  { accountCode: "1202", accountName: "Bank Account - HDFC", accountType: "ASSET", isGroup: false, level: 3, parentCode: "1200", amount: 2500000 },
  { accountCode: "1300", accountName: "Fixed Assets", accountType: "ASSET", isGroup: true, level: 1, ancestors: [] },
  { accountCode: "1301", accountName: "Office Equipment", accountType: "ASSET", isGroup: false, level: 2, parentCode: "1300", amount: 750000 },
  { accountCode: "1302", accountName: "Furniture & Fixtures", accountType: "ASSET", isGroup: false, level: 2, parentCode: "1300", amount: 350000 },

  // ===== LIABILITIES (2000-2999) =====
  { accountCode: "2000", accountName: "Current Liabilities", accountType: "LIABILITY", isGroup: true, level: 1, ancestors: [] },
  { accountCode: "2001", accountName: "Accounts Payable", accountType: "LIABILITY", isGroup: false, level: 2, parentCode: "2000", amount: 0 },
  { accountCode: "2100", accountName: "Tax Liabilities", accountType: "LIABILITY", isGroup: true, level: 2, parentCode: "2000" },
  { accountCode: "2101", accountName: "GST Payable", accountType: "LIABILITY", isGroup: false, level: 3, parentCode: "2100", amount: 0 },
  { accountCode: "2200", accountName: "Other Liabilities", accountType: "LIABILITY", isGroup: true, level: 2, parentCode: "2000" },
  { accountCode: "2201", accountName: "Outstanding Expenses", accountType: "LIABILITY", isGroup: false, level: 3, parentCode: "2200", amount: 0 },

  // ===== EQUITY (3000-3999) =====
  { accountCode: "3000", accountName: "Owner's Equity", accountType: "EQUITY", isGroup: true, level: 1, ancestors: [] },
  { accountCode: "3001", accountName: "Capital Account", accountType: "EQUITY", isGroup: false, level: 2, parentCode: "3000", amount: 5000000 },
  { accountCode: "3002", accountName: "Retained Earnings", accountType: "EQUITY", isGroup: false, level: 2, parentCode: "3000", amount: 1200000 },
  { accountCode: "3100", accountName: "Drawings", accountType: "EQUITY", isGroup: false, level: 2, parentCode: "3000", amount: 0 },

  // ===== INCOME (4000-4999) =====
  { accountCode: "4000", accountName: "Revenue", accountType: "INCOME", isGroup: true, level: 1, ancestors: [] },
  { accountCode: "4001", accountName: "Sales Revenue", accountType: "INCOME", isGroup: false, level: 2, parentCode: "4000", amount: 0 },
  { accountCode: "4002", accountName: "Service Revenue", accountType: "INCOME", isGroup: false, level: 2, parentCode: "4000", amount: 0 },
  { accountCode: "4100", accountName: "Other Income", accountType: "INCOME", isGroup: true, level: 2, parentCode: "4000" },
  { accountCode: "4101", accountName: "Interest Income", accountType: "INCOME", isGroup: false, level: 3, parentCode: "4100", amount: 0 },

  // ===== EXPENSES (5000-5999) =====
  { accountCode: "5000", accountName: "Direct Expenses", accountType: "EXPENSE", isGroup: true, level: 1, ancestors: [] },
  { accountCode: "5001", accountName: "Purchase Expenses", accountType: "EXPENSE", isGroup: false, level: 2, parentCode: "5000", amount: 0 },
  { accountCode: "5002", accountName: "Cost of Goods Sold", accountType: "EXPENSE", isGroup: false, level: 2, parentCode: "5000", amount: 0 },
  { accountCode: "5100", accountName: "Indirect Expenses", accountType: "EXPENSE", isGroup: true, level: 2, parentCode: "5000" },
  { accountCode: "5101", accountName: "Salary Expenses", accountType: "EXPENSE", isGroup: false, level: 3, parentCode: "5100", amount: 0 },
  { accountCode: "5102", accountName: "Rent Expenses", accountType: "EXPENSE", isGroup: false, level: 3, parentCode: "5100", amount: 0 },
  { accountCode: "5103", accountName: "Utilities Expenses", accountType: "EXPENSE", isGroup: false, level: 3, parentCode: "5100", amount: 0 },
  { accountCode: "5104", accountName: "Office Supplies", accountType: "EXPENSE", isGroup: false, level: 3, parentCode: "5100", amount: 0 },
];

// --- Customers ---
const CUSTOMERS_DATA = [
  {
    customerCode: "CUST-001",
    customerName: "TechVision Solutions Pvt Ltd",
    customerGroup: "Corporate",
    customerType: "Company",
    territory: "South",
    defaultCurrency: "INR",
    company: "TechVision Solutions",
    gstNumber: "29AABCT1234E1Z5",
    panNumber: "AABCT1234E",
    taxCategory: "Registered",
    creditLimit: 500000,
    openingBalance: 0,
    paymentTerms: "30 Days",
    creditDays: 30,
    allowCreditSales: true,
    addresses: [
      { addressType: "Billing", addressLine1: "42, Tech Park, Electronic City", city: "Bangalore", state: "Karnataka", country: "India", postalCode: "560100" },
      { addressType: "Shipping", addressLine1: "Unit 5, Industrial Layout", city: "Bangalore", state: "Karnataka", country: "India", postalCode: "560048" },
    ],
    contacts: [
      { contactPerson: "Ravi Kumar", phone: "080-41234567", mobile: "+91-9876543210", email: "ravi.kumar@techvision.com" },
    ],
    remarks: "Key corporate client - preferred pricing",
    tags: ["corporate", "preferred", "south"],
    status: "Active",
  },
  {
    customerCode: "CUST-002",
    customerName: "GreenLeaf Retail Chain",
    customerGroup: "Retail",
    customerType: "Company",
    territory: "West",
    defaultCurrency: "INR",
    company: "GreenLeaf Retail",
    gstNumber: "27BGLRC5678H1Z9",
    panNumber: "BGLRC5678H",
    taxCategory: "Registered",
    creditLimit: 250000,
    openingBalance: 15000,
    paymentTerms: "15 Days",
    creditDays: 15,
    allowCreditSales: true,
    addresses: [
      { addressType: "Billing", addressLine1: "7, Commerce House, CG Road", city: "Ahmedabad", state: "Gujarat", country: "India", postalCode: "380009" },
    ],
    contacts: [
      { contactPerson: "Priya Sharma", mobile: "+91-9876501234", email: "priya@greenleaf.in" },
    ],
    remarks: "Monthly billing cycle",
    tags: ["retail", "monthly"],
    status: "Active",
  },
  {
    customerCode: "CUST-003",
    customerName: "Northern Hardware & Tools",
    customerGroup: "Wholesale",
    customerType: "Company",
    territory: "North",
    defaultCurrency: "INR",
    company: "Northern Hardware",
    gstNumber: "07NHRT9012K1Z1",
    panNumber: "NHRT9012K",
    taxCategory: "Registered",
    creditLimit: 1000000,
    openingBalance: 0,
    paymentTerms: "45 Days",
    creditDays: 45,
    allowCreditSales: true,
    addresses: [
      { addressType: "Billing", addressLine1: "88, Industrial Area Phase 2", city: "Delhi", state: "Delhi", country: "India", postalCode: "110020" },
      { addressType: "Shipping", addressLine1: "Warehouse 12, Transport Nagar", city: "Ghaziabad", state: "Uttar Pradesh", country: "India", postalCode: "201001" },
    ],
    contacts: [
      { contactPerson: "Amit Singh", phone: "011-23456789", mobile: "+91-9999012345", email: "amit@northernhardware.in" },
    ],
    remarks: "High volume wholesale buyer",
    tags: ["wholesale", "high-value"],
    status: "Active",
  },
  {
    customerCode: "CUST-004",
    customerName: "Eastern Exports Limited",
    customerGroup: "Corporate",
    customerType: "Company",
    territory: "East",
    defaultCurrency: "INR",
    company: "Eastern Exports",
    gstNumber: "19EELX3456P1Z2",
    panNumber: "EELX3456P",
    taxCategory: "Registered",
    creditLimit: 750000,
    openingBalance: 45000,
    paymentTerms: "30 Days",
    creditDays: 30,
    allowCreditSales: true,
    addresses: [
      { addressType: "Billing", addressLine1: "15, Dockyard Road", city: "Kolkata", state: "West Bengal", country: "India", postalCode: "700001" },
    ],
    contacts: [
      { contactPerson: "Sudipta Banerjee", mobile: "+91-9830012345", email: "sudipta@eastern-exports.com" },
    ],
    remarks: "Export-oriented client - SEZ benefits",
    tags: ["exports", "corporate"],
    status: "Active",
  },
  {
    customerCode: "CUST-005",
    customerName: "Samir Patel (Individual Buyer)",
    customerGroup: "General",
    customerType: "Individual",
    territory: "West",
    defaultCurrency: "INR",
    creditLimit: 50000,
    openingBalance: 0,
    paymentTerms: "Cash on Delivery",
    creditDays: 0,
    allowCreditSales: false,
    addresses: [
      { addressType: "Billing", addressLine1: "B-201, Sunshine Apartments", city: "Mumbai", state: "Maharashtra", country: "India", postalCode: "400001" },
    ],
    contacts: [
      { contactPerson: "Samir Patel", mobile: "+91-9988776655", email: "samir.patel@gmail.com" },
    ],
    tags: ["individual", "retail"],
    status: "Active",
  },
];

// --- Suppliers ---
const SUPPLIERS_DATA = [
  {
    supplierCode: "SUPP-001",
    supplierName: "Global Industrial Supplies Ltd",
    supplierGroup: "Industrial",
    supplierType: "Company",
    territory: "West",
    defaultCurrency: "INR",
    company: "Global Industrial",
    gstNumber: "27GISL7890K1Z8",
    panNumber: "GISL7890K",
    taxCategory: "Registered",
    creditLimit: 2000000,
    openingBalance: 0,
    paymentTerms: "60 Days",
    creditDays: 60,
    allowCreditPurchase: true,
    addresses: [
      { addressType: "Billing", addressLine1: "Plaza Business Centre, Andheri East", city: "Mumbai", state: "Maharashtra", country: "India", postalCode: "400093" },
    ],
    contacts: [
      { contactPerson: "Vikram Mehta", phone: "022-67890123", mobile: "+91-9820098200", email: "vikram@globalindustrial.com" },
    ],
    remarks: "Primary raw material supplier",
    tags: ["raw-materials", "industrial"],
    status: "Active",
  },
  {
    supplierCode: "SUPP-002",
    supplierName: "OfficePro Stationers",
    supplierGroup: "General",
    supplierType: "Company",
    territory: "South",
    defaultCurrency: "INR",
    company: "OfficePro",
    gstNumber: "29OPSP4567E1Z4",
    panNumber: "OPSP4567E",
    taxCategory: "Registered",
    creditLimit: 100000,
    openingBalance: 12000,
    paymentTerms: "15 Days",
    creditDays: 15,
    allowCreditPurchase: true,
    addresses: [
      { addressType: "Billing", addressLine1: "12, MG Road, Indiranagar", city: "Bangalore", state: "Karnataka", country: "India", postalCode: "560038" },
    ],
    contacts: [
      { contactPerson: "Mohan Raj", mobile: "+91-9845012345", email: "orders@officepro.in" },
    ],
    tags: ["office-supplies", "stationery"],
    status: "Active",
  },
  {
    supplierCode: "SUPP-003",
    supplierName: "TechConnect IT Distributors",
    supplierGroup: "IT Services",
    supplierType: "Company",
    territory: "South",
    defaultCurrency: "INR",
    company: "TechConnect",
    gstNumber: "33TCTD8901L1Z6",
    panNumber: "TCTD8901L",
    taxCategory: "Registered",
    creditLimit: 1500000,
    openingBalance: 0,
    paymentTerms: "30 Days",
    creditDays: 30,
    allowCreditPurchase: true,
    addresses: [
      { addressType: "Billing", addressLine1: "Tidel Park, Taramani", city: "Chennai", state: "Tamil Nadu", country: "India", postalCode: "600113" },
    ],
    contacts: [
      { contactPerson: "Srinivasan Iyer", phone: "044-45678901", mobile: "+91-9840098400", email: "srinivas@techconnect.in" },
    ],
    remarks: "IT hardware and software provider",
    tags: ["it-services", "hardware"],
    status: "Active",
  },
  {
    supplierCode: "SUPP-004",
    supplierName: "FreshLogistics Courier Services",
    supplierGroup: "Services",
    supplierType: "Company",
    territory: "North",
    defaultCurrency: "INR",
    company: "FreshLogistics",
    gstNumber: "07FLCS1234F1Z7",
    panNumber: "FLCS1234F",
    taxCategory: "Registered",
    creditLimit: 200000,
    openingBalance: 8500,
    paymentTerms: "7 Days",
    creditDays: 7,
    allowCreditPurchase: true,
    addresses: [
      { addressType: "Billing", addressLine1: "Logistics Hub, GT Karnal Road", city: "Delhi", state: "Delhi", country: "India", postalCode: "110033" },
    ],
    contacts: [
      { contactPerson: "Rajesh Khanna", mobile: "+91-9911223344", email: "rajesh@freshlogistics.in" },
    ],
    tags: ["logistics", "courier"],
    status: "Active",
  },
  {
    supplierCode: "SUPP-005",
    supplierName: "Ananya Traders",
    supplierGroup: "General",
    supplierType: "Individual",
    territory: "East",
    defaultCurrency: "INR",
    company: "Ananya Traders",
    gstNumber: "19ANTR5678H1Z3",
    panNumber: "ANTR5678H",
    taxCategory: "Registered",
    creditLimit: 300000,
    openingBalance: 0,
    paymentTerms: "30 Days",
    creditDays: 30,
    allowCreditPurchase: true,
    addresses: [
      { addressType: "Billing", addressLine1: "55, Old Market Street", city: "Kolkata", state: "West Bengal", country: "India", postalCode: "700007" },
    ],
    contacts: [
      { contactPerson: "Ananya Das", mobile: "+91-9874123650", email: "ananya@ananyatraders.in" },
    ],
    tags: ["trading", "general"],
    status: "Active",
  },
];

// ==========================================================================
// Main Seeding Function
// ==========================================================================

const seed = async () => {
  try {
    // ── Connect ──
    console.log("Connecting to MongoDB at", env.MONGODB_URI, "...");
    await mongoose.connect(env.MONGODB_URI);
    console.log("Connected.\n");

    // ── Clear existing data ──
    console.log("Clearing existing collections...");
    await Promise.all([
      Permission.deleteMany({}),
      Role.deleteMany({}),
      User.deleteMany({}),
      Account.deleteMany({}),
      Customer.deleteMany({}),
      Supplier.deleteMany({}),
      JournalEntry.deleteMany({}),
      SalesInvoice.deleteMany({}),
      PurchaseInvoice.deleteMany({}),
      CreditNote.deleteMany({}),
      DebitNote.deleteMany({}),
      Payment.deleteMany({}),
      TaxRate.deleteMany({}),
      TaxGroup.deleteMany({}),
      FiscalYear.deleteMany({}),
      NumberingSeries.deleteMany({}),
      CostCenter.deleteMany({}),
      CurrencyExchangeRate.deleteMany({}),
      Budget.deleteMany({}),
      BankAccount.deleteMany({}),
      BankTransaction.deleteMany({}),
      AssetCategory.deleteMany({}),
      Asset.deleteMany({}),
      Notification.deleteMany({}),
      ActivityLog.deleteMany({}),
    ]);
    console.log("All collections cleared.\n");

    // ──────────────────────────────────────────────────────────────────────
    // STEP 1: Permissions
    // ──────────────────────────────────────────────────────────────────────
    console.log("--- STEP 1: Seeding Permissions ---");
    const seededPermissions = await Permission.insertMany(PERMISSIONS);
    const permMap = {}; // name -> _id
    seededPermissions.forEach((p) => {
      permMap[p.name] = p._id;
    });
    console.log(`  Created ${seededPermissions.length} permissions.\n`);

    // Helper to resolve permission IDs from names
    const getPermIds = (names) => names.map((n) => permMap[n]);

    // ──────────────────────────────────────────────────────────────────────
    // STEP 2: Roles
    // ──────────────────────────────────────────────────────────────────────
    console.log("--- STEP 2: Seeding Roles ---");

    const adminRole = await Role.create({
      name: "SYSTEM_ADMIN",
      description: "System Administrator with full access to all modules",
      permissions: seededPermissions.map((p) => p._id),
    });

    const accountantRole = await Role.create({
      name: "ACCOUNTANT",
      description: "Accountant with ledger, invoice, and journal entry access",
      permissions: getPermIds([
        "accounts:create", "accounts:view", "accounts:update",
        "customers:create", "customers:view", "customers:update",
        "suppliers:create", "suppliers:view", "suppliers:update",
        "journal_entries:create", "journal_entries:view", "journal_entries:update", "journal_entries:submit",
        "sales_invoices:create", "sales_invoices:view", "sales_invoices:update", "sales_invoices:submit",
        "purchase_invoices:create", "purchase_invoices:view", "purchase_invoices:update", "purchase_invoices:submit",
      ]),
    });

    const auditorRole = await Role.create({
      name: "AUDITOR",
      description: "Read-only access for compliance auditing",
      permissions: getPermIds([
        "accounts:view",
        "customers:view",
        "suppliers:view",
        "journal_entries:view",
        "sales_invoices:view",
        "purchase_invoices:view",
      ]),
    });

    const managerRole = await Role.create({
      name: "MANAGER",
      description: "Department manager with approval authority",
      permissions: getPermIds([
        "accounts:view",
        "customers:view", "customers:update",
        "suppliers:view", "suppliers:update",
        "journal_entries:view", "journal_entries:submit", "journal_entries:cancel",
        "sales_invoices:view", "sales_invoices:submit", "sales_invoices:cancel",
        "purchase_invoices:view", "purchase_invoices:submit", "purchase_invoices:cancel",
      ]),
    });

    console.log(`  Created roles: SYSTEM_ADMIN, ACCOUNTANT, AUDITOR, MANAGER.\n`);

    // ──────────────────────────────────────────────────────────────────────
    // STEP 3: Users
    // ──────────────────────────────────────────────────────────────────────
    console.log("--- STEP 3: Seeding Users ---");

    const adminUser = await User.create({
      name: "System Admin",
      email: "admin@company.com",
      password: "AdminPassword123!",
      roles: [adminRole._id],
      status: "active",
    });

    const accountantUser = await User.create({
      name: "Arun Kumar",
      email: "accountant@company.com",
      password: "Accountant@123",
      roles: [accountantRole._id],
      status: "active",
    });

    const auditorUser = await User.create({
      name: "Meena Iyer",
      email: "auditor@company.com",
      password: "Auditor@123",
      roles: [auditorRole._id],
      status: "active",
    });

    const managerUser = await User.create({
      name: "Rajesh Sharma",
      email: "manager@company.com",
      password: "Manager@123",
      roles: [managerRole._id],
      status: "active",
    });

    const juniorAcctUser = await User.create({
      name: "Vikram Joshi",
      email: "jracct@company.com",
      password: "JrAccount@123",
      roles: [accountantRole._id],
      status: "active",
    });

    console.log("  Created users:");
    console.log(`    admin@company.com     (SYSTEM_ADMIN)  -> pwd: AdminPassword123!`);
    console.log(`    accountant@company.com (ACCOUNTANT)   -> pwd: Accountant@123`);
    console.log(`    auditor@company.com    (AUDITOR)      -> pwd: Auditor@123`);
    console.log(`    manager@company.com    (MANAGER)      -> pwd: Manager@123`);
    console.log(`    jracct@company.com     (ACCOUNTANT)   -> pwd: JrAccount@123\n`);

    const adminId = adminUser._id;

    // ──────────────────────────────────────────────────────────────────────
    // STEP 4: Chart of Accounts (hierarchical)
    // ──────────────────────────────────────────────────────────────────────
    console.log("--- STEP 4: Seeding Chart of Accounts ---");

    // Build lookup: accountCode -> account doc (after insert)
    const accountMap = {};

    // Insert in order so parents are inserted before children
    for (const accData of ACCOUNTS_DATA) {
      const doc = {
        accountCode: accData.accountCode,
        accountName: accData.accountName,
        accountType: accData.accountType,
        isGroup: accData.isGroup,
        level: accData.level,
        ancestors: [],
        currency: "INR",
        amount: accData.amount || 0,
        status: "ACTIVE",
        description: "",
        createdBy: adminId,
        updatedBy: adminId,
      };

      // Resolve parent and ancestors
      if (accData.parentCode) {
        const parent = accountMap[accData.parentCode];
        if (!parent) {
          throw new Error(`Parent account ${accData.parentCode} not found for ${accData.accountCode}`);
        }
        doc.parentAccount = parent._id;
        doc.ancestors = [...parent.ancestors, parent._id];
      }

      const created = await Account.create(doc);
      accountMap[accData.accountCode] = created;
    }

    console.log(`  Created ${Object.keys(accountMap).length} accounts.\n`);

    // ──────────────────────────────────────────────────────────────────────
    // STEP 5: Customers
    // ──────────────────────────────────────────────────────────────────────
    console.log("--- STEP 5: Seeding Customers ---");
    const customerDocs = await Customer.insertMany(CUSTOMERS_DATA);
    console.log(`  Created ${customerDocs.length} customers.\n`);

    // ──────────────────────────────────────────────────────────────────────
    // STEP 6: Suppliers
    // ──────────────────────────────────────────────────────────────────────
    console.log("--- STEP 6: Seeding Suppliers ---");
    const supplierDocs = await Supplier.insertMany(SUPPLIERS_DATA);
    console.log(`  Created ${supplierDocs.length} suppliers.\n`);

    // ──────────────────────────────────────────────────────────────────────
    // STEP 7: Journal Entries
    // ──────────────────────────────────────────────────────────────────────
    console.log("--- STEP 7: Seeding Journal Entries ---");

    const ac1101 = accountMap["1101"]._id; // Trade Receivables
    const ac4001 = accountMap["4001"]._id; // Sales Revenue
    const ac1201 = accountMap["1201"]._id; // Cash in Hand
    const ac2001 = accountMap["2001"]._id; // Accounts Payable
    const ac5001 = accountMap["5001"]._id; // Purchase Expenses
    const ac5101 = accountMap["5101"]._id; // Salary Expenses
    const ac5102 = accountMap["5102"]._id; // Rent Expenses
    const ac5103 = accountMap["5103"]._id; // Utilities Expenses
    const ac3001 = accountMap["3001"]._id; // Capital Account
    const ac1202 = accountMap["1202"]._id; // Bank Account
    const ac2101 = accountMap["2101"]._id; // GST Payable
    const ac5002 = accountMap["5002"]._id; // COGS
    const ac4101 = accountMap["4101"]._id; // Interest Income

    const journalEntriesData = [
      {
        voucherNumber: "JE-00001",
        date: new Date("2024-01-01"),
        referenceType: "Opening Entry",
        referenceNumber: "OP-001",
        remarks: "Opening balance entry - Capital contribution",
        status: "Submitted",
        totalDebit: 5000000,
        totalCredit: 5000000,
        lineItems: [
          { account: ac1202, debitAmount: 5000000, creditAmount: 0, description: "Capital deposited in bank" },
          { account: ac3001, debitAmount: 0, creditAmount: 5000000, description: "Owner capital contribution" },
        ],
        createdBy: adminId,
      },
      {
        voucherNumber: "JE-00002",
        date: new Date("2024-01-05"),
        referenceType: "Purchase",
        referenceNumber: "PO-2024-001",
        remarks: "Purchase of office equipment",
        status: "Submitted",
        totalDebit: 750000,
        totalCredit: 750000,
        lineItems: [
          { account: accountMap["1301"]._id, debitAmount: 750000, creditAmount: 0, description: "Office equipment purchase" },
          { account: ac1202, debitAmount: 0, creditAmount: 750000, description: "Payment via bank" },
        ],
        createdBy: accountantUser._id,
      },
      {
        voucherNumber: "JE-00003",
        date: new Date("2024-01-10"),
        referenceType: "Sales",
        referenceNumber: "INV-2024-0001",
        remarks: "Credit sales to TechVision Solutions",
        status: "Submitted",
        totalDebit: 236000,
        totalCredit: 236000,
        lineItems: [
          { account: ac1101, debitAmount: 236000, creditAmount: 0, description: "Amount receivable from TechVision" },
          { account: ac4001, debitAmount: 0, creditAmount: 200000, description: "Sales revenue" },
          { account: ac2101, debitAmount: 0, creditAmount: 36000, description: "GST @ 18%" },
        ],
        createdBy: accountantUser._id,
      },
      {
        voucherNumber: "JE-00004",
        date: new Date("2024-01-15"),
        referenceType: "Payment",
        referenceNumber: "PMT-2024-001",
        remarks: "Salary payment for January",
        status: "Submitted",
        totalDebit: 320000,
        totalCredit: 320000,
        lineItems: [
          { account: ac5101, debitAmount: 320000, creditAmount: 0, description: "January salaries" },
          { account: ac1202, debitAmount: 0, creditAmount: 320000, description: "Salary paid via bank" },
        ],
        createdBy: accountantUser._id,
      },
      {
        voucherNumber: "JE-00005",
        date: new Date("2024-01-20"),
        referenceType: "Expense",
        referenceNumber: "EXP-2024-001",
        remarks: "Office rent payment for Q1 2024",
        status: "Submitted",
        totalDebit: 150000,
        totalCredit: 150000,
        lineItems: [
          { account: ac5102, debitAmount: 150000, creditAmount: 0, description: "Office rent - Quarter 1" },
          { account: ac1202, debitAmount: 0, creditAmount: 150000, description: "Rent paid via bank" },
        ],
        createdBy: accountantUser._id,
      },
      {
        voucherNumber: "JE-00006",
        date: new Date("2024-02-01"),
        referenceType: "Purchase",
        referenceNumber: "PO-2024-002",
        remarks: "Purchase of raw materials from Global Industrial",
        status: "Submitted",
        totalDebit: 590000,
        totalCredit: 590000,
        lineItems: [
          { account: ac5001, debitAmount: 500000, creditAmount: 0, description: "Raw materials purchase" },
          { account: ac2101, debitAmount: 90000, creditAmount: 0, description: "Input GST credit @ 18%" },
          { account: ac2001, debitAmount: 0, creditAmount: 590000, description: "Payable to Global Industrial" },
        ],
        createdBy: accountantUser._id,
      },
      {
        voucherNumber: "JE-00007",
        date: new Date("2024-02-05"),
        referenceType: "Utilities",
        referenceNumber: "UTL-2024-001",
        remarks: "Electricity and internet bills for January",
        status: "Submitted",
        totalDebit: 45000,
        totalCredit: 45000,
        lineItems: [
          { account: ac5103, debitAmount: 45000, creditAmount: 0, description: "Electricity & internet bills" },
          { account: ac1202, debitAmount: 0, creditAmount: 45000, description: "Paid via bank" },
        ],
        createdBy: juniorAcctUser._id,
      },
      {
        voucherNumber: "JE-00008",
        date: new Date("2024-02-10"),
        referenceType: "Sales",
        referenceNumber: "INV-2024-0003",
        remarks: "Credit sales to Northern Hardware",
        status: "Draft",
        totalDebit: 354000,
        totalCredit: 354000,
        lineItems: [
          { account: ac1101, debitAmount: 354000, creditAmount: 0, description: "Amount receivable" },
          { account: ac4001, debitAmount: 0, creditAmount: 300000, description: "Sales revenue" },
          { account: ac2101, debitAmount: 0, creditAmount: 54000, description: "GST @ 18%" },
        ],
        createdBy: accountantUser._id,
      },
      {
        voucherNumber: "JE-00009",
        date: new Date("2024-02-15"),
        referenceType: "Payment Received",
        referenceNumber: "RC-2024-001",
        remarks: "Payment received from TechVision Solutions against invoice INV-2024-0001",
        status: "Submitted",
        totalDebit: 236000,
        totalCredit: 236000,
        lineItems: [
          { account: ac1202, debitAmount: 236000, creditAmount: 0, description: "Cheque deposited in bank" },
          { account: ac1101, debitAmount: 0, creditAmount: 236000, description: "Receivable settled" },
        ],
        createdBy: accountantUser._id,
      },
      {
        voucherNumber: "JE-00010",
        date: new Date("2024-03-01"),
        referenceType: "Purchase",
        referenceNumber: "PO-2024-003",
        remarks: "IT equipment purchase from TechConnect Distributors",
        status: "Submitted",
        totalDebit: 590000,
        totalCredit: 590000,
        lineItems: [
          { account: ac5001, debitAmount: 354000, creditAmount: 0, description: "Computer hardware" },
          { account: ac5002, debitAmount: 146000, creditAmount: 0, description: "Software licenses" },
          { account: ac2101, debitAmount: 90000, creditAmount: 0, description: "Input GST @ 18%" },
          { account: ac2001, debitAmount: 0, creditAmount: 590000, description: "Payable to TechConnect" },
        ],
        createdBy: accountantUser._id,
      },
      {
        voucherNumber: "JE-00011",
        date: new Date("2024-03-05"),
        referenceType: "Miscellaneous",
        referenceNumber: "INT-2024-001",
        remarks: "Interest earned on fixed deposit",
        status: "Submitted",
        totalDebit: 15000,
        totalCredit: 15000,
        lineItems: [
          { account: ac1202, debitAmount: 15000, creditAmount: 0, description: "Interest credited by bank" },
          { account: ac4101, debitAmount: 0, creditAmount: 15000, description: "Interest income" },
        ],
        createdBy: juniorAcctUser._id,
      },
    ];

    const journalEntries = await JournalEntry.insertMany(journalEntriesData);
    console.log(`  Created ${journalEntries.length} journal entries.\n`);

    // ──────────────────────────────────────────────────────────────────────
    // STEP 8: Sales Invoices
    // ──────────────────────────────────────────────────────────────────────
    console.log("--- STEP 8: Seeding Sales Invoices ---");

    const salesInvoicesData = [
      {
        invoiceNumber: "SI-00001",
        customer: customerDocs[0]._id, // TechVision Solutions
        invoiceDate: new Date("2024-01-10"),
        items: [
          { itemName: "ERP Software License - Annual", quantity: 1, rate: 150000, amount: 150000 },
          { itemName: "Implementation & Training", quantity: 1, rate: 50000, amount: 50000 },
        ],
        subtotal: 200000,
        taxAmount: 36000,
        grandTotal: 236000,
        remarks: "Annual ERP license with implementation services",
        status: "Submitted",
        createdBy: accountantUser._id,
      },
      {
        invoiceNumber: "SI-00002",
        customer: customerDocs[1]._id, // GreenLeaf Retail
        invoiceDate: new Date("2024-01-25"),
        items: [
          { itemName: "POS Software License", quantity: 5, rate: 12000, amount: 60000 },
          { itemName: "Hardware Bundle (Barcode Scanner + Printer)", quantity: 5, rate: 8000, amount: 40000 },
        ],
        subtotal: 100000,
        taxAmount: 18000,
        grandTotal: 118000,
        remarks: "Retail POS setup for 5 stores",
        status: "Submitted",
        createdBy: accountantUser._id,
      },
      {
        invoiceNumber: "SI-00003",
        customer: customerDocs[2]._id, // Northern Hardware
        invoiceDate: new Date("2024-02-10"),
        items: [
          { itemName: "Inventory Management Module", quantity: 1, rate: 200000, amount: 200000 },
          { itemName: "Custom Integration Service", quantity: 1, rate: 100000, amount: 100000 },
        ],
        subtotal: 300000,
        taxAmount: 54000,
        grandTotal: 354000,
        remarks: "Custom inventory module with SAP integration",
        status: "Draft",
        createdBy: accountantUser._id,
      },
      {
        invoiceNumber: "SI-00004",
        customer: customerDocs[3]._id, // Eastern Exports
        invoiceDate: new Date("2024-02-20"),
        items: [
          { itemName: "Export Documentation Module", quantity: 1, rate: 175000, amount: 175000 },
          { itemName: "Compliance Dashboard Setup", quantity: 1, rate: 75000, amount: 75000 },
        ],
        subtotal: 250000,
        taxAmount: 45000,
        grandTotal: 295000,
        remarks: "Export compliance software with SEZ features",
        status: "Submitted",
        createdBy: accountantUser._id,
      },
      {
        invoiceNumber: "SI-00005",
        customer: customerDocs[0]._id, // TechVision Solutions
        invoiceDate: new Date("2024-03-10"),
        items: [
          { itemName: "Annual Maintenance Renewal", quantity: 1, rate: 30000, amount: 30000 },
          { itemName: "Additional User Licenses (10 seats)", quantity: 10, rate: 5000, amount: 50000 },
        ],
        subtotal: 80000,
        taxAmount: 14400,
        grandTotal: 94400,
        remarks: "AMC renewal and additional user licenses",
        status: "Draft",
        createdBy: juniorAcctUser._id,
      },
    ];

    const salesInvoices = await SalesInvoice.insertMany(salesInvoicesData);
    console.log(`  Created ${salesInvoices.length} sales invoices.\n`);

    // ──────────────────────────────────────────────────────────────────────
    // STEP 9: Purchase Invoices
    // ──────────────────────────────────────────────────────────────────────
    console.log("--- STEP 9: Seeding Purchase Invoices ---");

    const purchaseInvoicesData = [
      {
        invoiceNumber: "PI-00001",
        supplier: supplierDocs[0]._id, // Global Industrial
        invoiceDate: new Date("2024-02-01"),
        items: [
          { itemName: "Steel Sheets (Grade 304) - 100 units", quantity: 100, rate: 3500, amount: 350000 },
          { itemName: "Aluminum Profiles - 50 units", quantity: 50, rate: 3000, amount: 150000 },
        ],
        subtotal: 500000,
        taxAmount: 90000,
        grandTotal: 590000,
        remarks: "Raw materials for Q1 production",
        status: "Submitted",
        createdBy: accountantUser._id,
      },
      {
        invoiceNumber: "PI-00002",
        supplier: supplierDocs[1]._id, // OfficePro Stationers
        invoiceDate: new Date("2024-02-05"),
        items: [
          { itemName: "Printer Paper A4 (50 boxes)", quantity: 50, rate: 500, amount: 25000 },
          { itemName: "Office Supplies Kit", quantity: 20, rate: 800, amount: 16000 },
        ],
        subtotal: 41000,
        taxAmount: 7380,
        grandTotal: 48380,
        remarks: "Monthly office supplies replenishment",
        status: "Submitted",
        createdBy: juniorAcctUser._id,
      },
      {
        invoiceNumber: "PI-00003",
        supplier: supplierDocs[2]._id, // TechConnect IT Distributors
        invoiceDate: new Date("2024-03-01"),
        items: [
          { itemName: "Dell OptiPlex Desktop (10 units)", quantity: 10, rate: 45000, amount: 450000 },
          { itemName: "Microsoft 365 Business Licenses (20 seats)", quantity: 20, rate: 5200, amount: 104000 },
        ],
        subtotal: 554000,
        taxAmount: 99720,
        grandTotal: 653720,
        remarks: "IT infrastructure upgrade for new hires",
        status: "Submitted",
        createdBy: accountantUser._id,
      },
      {
        invoiceNumber: "PI-00004",
        supplier: supplierDocs[3]._id, // FreshLogistics
        invoiceDate: new Date("2024-03-05"),
        items: [
          { itemName: "Courier Services - Monthly Contract", quantity: 1, rate: 35000, amount: 35000 },
        ],
        subtotal: 35000,
        taxAmount: 6300,
        grandTotal: 41300,
        remarks: "Monthly courier service charges - March",
        status: "Draft",
        createdBy: juniorAcctUser._id,
      },
      {
        invoiceNumber: "PI-00005",
        supplier: supplierDocs[4]._id, // Ananya Traders
        invoiceDate: new Date("2024-03-12"),
        items: [
          { itemName: "Packaging Materials Assorted", quantity: 500, rate: 45, amount: 22500 },
          { itemName: "Shipping Labels & Barcode Stickers", quantity: 1000, rate: 5, amount: 5000 },
        ],
        subtotal: 27500,
        taxAmount: 4950,
        grandTotal: 32450,
        remarks: "Packaging supplies for dispatch department",
        status: "Submitted",
        createdBy: accountantUser._id,
      },
    ];

    const purchaseInvoices = await PurchaseInvoice.insertMany(purchaseInvoicesData);
    console.log(`  Created ${purchaseInvoices.length} purchase invoices.\n`);

    // ──────────────────────────────────────────────────────────────────────
    // STEP 10: Tax Rates (GST)
    // ──────────────────────────────────────────────────────────────────────
    console.log("--- STEP 10: Seeding Tax Rates ---");

    const taxRatesData = [
      { taxName: "CGST 9%", taxCode: "CGST9", rate: 9, taxType: "CGST", effectiveFrom: new Date("2024-01-01"), description: "Central GST at 9%", isActive: true, createdBy: adminId },
      { taxName: "SGST 9%", taxCode: "SGST9", rate: 9, taxType: "SGST", effectiveFrom: new Date("2024-01-01"), description: "State GST at 9%", isActive: true, createdBy: adminId },
      { taxName: "IGST 18%", taxCode: "IGST18", rate: 18, taxType: "IGST", effectiveFrom: new Date("2024-01-01"), description: "Integrated GST at 18%", isActive: true, createdBy: adminId },
      { taxName: "CGST 6%", taxCode: "CGST6", rate: 6, taxType: "CGST", effectiveFrom: new Date("2024-01-01"), description: "Central GST at 6%", isActive: true, createdBy: adminId },
      { taxName: "SGST 6%", taxCode: "SGST6", rate: 6, taxType: "SGST", effectiveFrom: new Date("2024-01-01"), description: "State GST at 6%", isActive: true, createdBy: adminId },
    ];

    const taxRates = await TaxRate.insertMany(taxRatesData);
    console.log(`  Created ${taxRates.length} tax rates.\n`);

    // ──────────────────────────────────────────────────────────────────────
    // STEP 11: Tax Groups
    // ──────────────────────────────────────────────────────────────────────
    console.log("--- STEP 11: Seeding Tax Groups ---");

    // Find CGST 9% and SGST 9% rates
    const cgst9 = taxRates.find(r => r.taxCode === "CGST9")._id;
    const sgst9 = taxRates.find(r => r.taxCode === "SGST9")._id;
    const igst18 = taxRates.find(r => r.taxCode === "IGST18")._id;

    const taxGroupsData = [
      {
        groupName: "GST 18% (CGST 9% + SGST 9%)",
        groupCode: "GST18",
        taxes: [{ taxRate: cgst9 }, { taxRate: sgst9 }],
        description: "Standard GST at 18% (9% CGST + 9% SGST) for intra-state supplies",
        isActive: true,
        createdBy: adminId,
      },
      {
        groupName: "IGST 18%",
        groupCode: "IGST18",
        taxes: [{ taxRate: igst18 }],
        description: "Integrated GST at 18% for inter-state supplies",
        isActive: true,
        createdBy: adminId,
      },
    ];

    const taxGroups = await TaxGroup.insertMany(taxGroupsData);
    console.log(`  Created ${taxGroups.length} tax groups.\n`);

    // ──────────────────────────────────────────────────────────────────────
    // STEP 12: Fiscal Year
    // ──────────────────────────────────────────────────────────────────────
    console.log("--- STEP 12: Seeding Fiscal Year ---");

    const fiscalYearsData = [
      {
        yearName: "FY 2024-2025",
        startDate: new Date("2024-04-01"),
        endDate: new Date("2025-03-31"),
        status: "Active",
        isDefault: true,
        description: "Financial Year 2024-2025",
        createdBy: adminId,
      },
    ];

    const fiscalYears = await FiscalYear.insertMany(fiscalYearsData);
    const fiscalYear = fiscalYears[0];
    console.log(`  Created ${fiscalYears.length} fiscal year.\n`);

    // ──────────────────────────────────────────────────────────────────────
    // STEP 13: Numbering Series
    // ──────────────────────────────────────────────────────────────────────
    console.log("--- STEP 13: Seeding Numbering Series ---");

    const numberingSeriesData = [
      { documentType: "Account", prefix: "AC", startingNumber: 1, padLength: 4, description: "Auto-generated account codes", isActive: true, createdBy: adminId },
      { documentType: "Customer", prefix: "CUST", startingNumber: 6, padLength: 3, description: "Auto-generated customer codes", isActive: true, createdBy: adminId },
      { documentType: "Supplier", prefix: "SUPP", startingNumber: 6, padLength: 3, description: "Auto-generated supplier codes", isActive: true, createdBy: adminId },
      { documentType: "JournalEntry", prefix: "JE", startingNumber: 12, padLength: 5, description: "Auto-generated voucher numbers", isActive: true, createdBy: adminId },
      { documentType: "SalesInvoice", prefix: "SI", startingNumber: 6, padLength: 5, description: "Auto-generated sales invoice numbers", isActive: true, createdBy: adminId },
      { documentType: "PurchaseInvoice", prefix: "PI", startingNumber: 6, padLength: 5, description: "Auto-generated purchase invoice numbers", isActive: true, createdBy: adminId },
      { documentType: "Payment", prefix: "PMT", startingNumber: 1, padLength: 5, description: "Auto-generated payment numbers", isActive: true, createdBy: adminId },
    ];

    const numberingSeries = await NumberingSeries.insertMany(numberingSeriesData);
    console.log(`  Created ${numberingSeries.length} numbering series.\n`);

    // ──────────────────────────────────────────────────────────────────────
    // STEP 14: Cost Centers
    // ──────────────────────────────────────────────────────────────────────
    console.log("--- STEP 14: Seeding Cost Centers ---");

    const costCentersData = [
      { code: "CC-IT", name: "Information Technology", description: "IT department cost center", status: "Active", createdBy: adminId },
      { code: "CC-SALES", name: "Sales & Marketing", description: "Sales and marketing department", status: "Active", createdBy: adminId },
      { code: "CC-ADMIN", name: "Administration", description: "General administration cost center", status: "Active", createdBy: adminId },
      { code: "CC-OPS", name: "Operations", description: "Operations and production cost center", status: "Active", createdBy: adminId },
    ];

    const costCenters = await CostCenter.insertMany(costCentersData);
    console.log(`  Created ${costCenters.length} cost centers.\n`);

    // ──────────────────────────────────────────────────────────────────────
    // STEP 15: Currency Exchange Rates
    // ──────────────────────────────────────────────────────────────────────
    console.log("--- STEP 15: Seeding Currency Exchange Rates ---");

    const exchangeRatesData = [
      { fromCurrency: "USD", toCurrency: "INR", rate: 83.50, effectiveDate: new Date("2024-01-01"), isActive: true, createdBy: adminId },
      { fromCurrency: "EUR", toCurrency: "INR", rate: 90.20, effectiveDate: new Date("2024-01-01"), isActive: true, createdBy: adminId },
      { fromCurrency: "GBP", toCurrency: "INR", rate: 105.75, effectiveDate: new Date("2024-01-01"), isActive: true, createdBy: adminId },
      { fromCurrency: "INR", toCurrency: "USD", rate: 0.012, effectiveDate: new Date("2024-01-01"), isActive: true, createdBy: adminId },
    ];

    const exchangeRates = await CurrencyExchangeRate.insertMany(exchangeRatesData);
    console.log(`  Created ${exchangeRates.length} currency exchange rates.\n`);

    // ──────────────────────────────────────────────────────────────────────
    // STEP 16: Budget
    // ──────────────────────────────────────────────────────────────────────
    console.log("--- STEP 16: Seeding Budget ---");

    const budgetData = {
      name: "Annual Operating Budget FY 2024-2025",
      fiscalYear: fiscalYear._id,
      costCenter: costCenters[2]._id, // Admin
      status: "Approved",
      lineItems: [
        { account: ac5101, amount: 3840000, notes: "Annual salary budget (12 months × ₹3,20,000)" },
        { account: ac5102, amount: 600000, notes: "Annual rent (₹50,000 × 12 months)" },
        { account: ac5103, amount: 180000, notes: "Annual utilities (₹15,000 × 12 months)" },
        { account: accountMap["5104"]._id, amount: 120000, notes: "Annual office supplies" },
      ],
      description: "Comprehensive operating budget for the financial year 2024-2025",
      createdBy: adminId,
    };

    // Calculate total
    budgetData.totalAmount = budgetData.lineItems.reduce((s, i) => s + i.amount, 0);

    const budgets = await Budget.create(budgetData);
    console.log(`  Created 1 budget with ${budgetData.lineItems.length} line items.\n`);

    // ──────────────────────────────────────────────────────────────────────
    // STEP 17: Bank Accounts
    // ──────────────────────────────────────────────────────────────────────
    console.log("--- STEP 17: Seeding Bank Accounts ---");

    const bankAccountsData = [
      {
        accountName: "HDFC Current Account",
        accountNumber: "HDFC00012345678",
        bankName: "HDFC Bank",
        branchName: "MG Road Branch, Bangalore",
        ifscCode: "HDFC0001234",
        accountType: "Current",
        openingBalance: 0,
        currentBalance: 0,
        currency: "INR",
        isActive: true,
        description: "Primary business current account",
        createdBy: adminId,
      },
      {
        accountName: "ICICI Current Account",
        accountNumber: "ICICI00098765432",
        bankName: "ICICI Bank",
        branchName: "Indiranagar Branch, Bangalore",
        ifscCode: "ICIC0009876",
        accountType: "Current",
        openingBalance: 0,
        currentBalance: 0,
        currency: "INR",
        isActive: true,
        description: "Secondary business current account",
        createdBy: adminId,
      },
    ];

    const bankAccounts = await BankAccount.insertMany(bankAccountsData);
    console.log(`  Created ${bankAccounts.length} bank accounts.\n`);

    // ──────────────────────────────────────────────────────────────────────
    // STEP 18: Bank Transactions
    // ──────────────────────────────────────────────────────────────────────
    console.log("--- STEP 18: Seeding Bank Transactions ---");

    const bankTransactionsData = [
      {
        bankAccount: bankAccounts[0]._id,
        transactionDate: new Date("2024-01-01"),
        transactionType: "Deposit",
        amount: 5000000,
        description: "Initial capital deposit",
        referenceType: "JournalEntry",
        referenceNumber: "JE-00001",
        paymentMethod: "Bank Transfer",
        status: "Cleared",
        reconciliationStatus: "Reconciled",
        createdBy: adminId,
      },
      {
        bankAccount: bankAccounts[0]._id,
        transactionDate: new Date("2024-01-05"),
        transactionType: "Withdrawal",
        amount: 750000,
        description: "Office equipment purchase",
        referenceType: "JournalEntry",
        referenceNumber: "JE-00002",
        paymentMethod: "Bank Transfer",
        status: "Cleared",
        reconciliationStatus: "Reconciled",
        createdBy: accountantUser._id,
      },
      {
        bankAccount: bankAccounts[0]._id,
        transactionDate: new Date("2024-01-15"),
        transactionType: "Withdrawal",
        amount: 320000,
        description: "Salary payment for January",
        referenceType: "JournalEntry",
        referenceNumber: "JE-00004",
        paymentMethod: "Bank Transfer",
        status: "Cleared",
        reconciliationStatus: "Reconciled",
        createdBy: accountantUser._id,
      },
      {
        bankAccount: bankAccounts[0]._id,
        transactionDate: new Date("2024-01-20"),
        transactionType: "Withdrawal",
        amount: 150000,
        description: "Office rent payment for Q1",
        referenceType: "JournalEntry",
        referenceNumber: "JE-00005",
        paymentMethod: "Bank Transfer",
        status: "Cleared",
        reconciliationStatus: "Reconciled",
        createdBy: accountantUser._id,
      },
      {
        bankAccount: bankAccounts[0]._id,
        transactionDate: new Date("2024-02-05"),
        transactionType: "Withdrawal",
        amount: 45000,
        description: "Electricity and internet bills",
        referenceType: "JournalEntry",
        referenceNumber: "JE-00007",
        paymentMethod: "Bank Transfer",
        status: "Cleared",
        reconciliationStatus: "Unreconciled",
        createdBy: juniorAcctUser._id,
      },
      {
        bankAccount: bankAccounts[0]._id,
        transactionDate: new Date("2024-02-15"),
        transactionType: "Deposit",
        amount: 236000,
        description: "Payment received from TechVision Solutions",
        referenceType: "JournalEntry",
        referenceNumber: "JE-00009",
        paymentMethod: "Cheque",
        chequeNumber: "CHQ-001234",
        chequeDate: new Date("2024-02-14"),
        status: "Cleared",
        reconciliationStatus: "Unreconciled",
        createdBy: accountantUser._id,
      },
      {
        bankAccount: bankAccounts[0]._id,
        transactionDate: new Date("2024-03-05"),
        transactionType: "Deposit",
        amount: 15000,
        description: "Interest earned on fixed deposit",
        referenceType: "JournalEntry",
        referenceNumber: "JE-00011",
        paymentMethod: "Online",
        status: "Cleared",
        reconciliationStatus: "Unreconciled",
        createdBy: juniorAcctUser._id,
      },
    ];

    // Calculate the HDFC account balance from transactions
    const hdfcBalance = bankAccountsData[0].openingBalance +
      bankTransactionsData.filter(t => t.transactionType === "Deposit").reduce((s, t) => s + t.amount, 0) -
      bankTransactionsData.filter(t => t.transactionType === "Withdrawal").reduce((s, t) => s + t.amount, 0);

    // Update HDFC account balance
    await BankAccount.updateOne({ _id: bankAccounts[0]._id }, { currentBalance: hdfcBalance });

    const bankTransactions = await BankTransaction.insertMany(bankTransactionsData);
    console.log(`  Created ${bankTransactions.length} bank transactions.\n`);

    // ──────────────────────────────────────────────────────────────────────
    // STEP 19: Asset Categories & Assets
    // ──────────────────────────────────────────────────────────────────────
    console.log("--- STEP 19: Seeding Asset Categories & Assets ---");

    const assetCatData = [
      {
        categoryCode: "AC-IT",
        categoryName: "IT Equipment",
        description: "Computers, servers, and IT infrastructure",
        defaultUsefulLife: 36,
        defaultDepreciationMethod: "StraightLine",
        defaultSalvageValuePercent: 5,
        glAccount: accountMap["1301"]._id,
        depreciationExpenseAccount: accountMap["5100"]._id,
        accumulatedDepreciationAccount: accountMap["1301"]._id,
        isActive: true,
        createdBy: adminId,
      },
      {
        categoryCode: "AC-OFFICE",
        categoryName: "Office Furniture",
        description: "Office desks, chairs, and furniture",
        defaultUsefulLife: 60,
        defaultDepreciationMethod: "StraightLine",
        defaultSalvageValuePercent: 5,
        glAccount: accountMap["1302"]._id,
        depreciationExpenseAccount: accountMap["5100"]._id,
        accumulatedDepreciationAccount: accountMap["1302"]._id,
        isActive: true,
        createdBy: adminId,
      },
      {
        categoryCode: "AC-VEHICLE",
        categoryName: "Vehicles",
        description: "Company vehicles and transportation",
        defaultUsefulLife: 84,
        defaultDepreciationMethod: "WrittenDownValue",
        defaultSalvageValuePercent: 10,
        glAccount: accountMap["1300"]._id,
        depreciationExpenseAccount: accountMap["5100"]._id,
        accumulatedDepreciationAccount: accountMap["1300"]._id,
        isActive: true,
        createdBy: adminId,
      },
    ];

    const assetCategories = await AssetCategory.insertMany(assetCatData);

    const assetsData = [
      {
        assetCode: "AST-001",
        assetName: "Dell PowerEdge Server R740",
        description: "Primary production server with 64GB RAM, 4TB storage",
        category: assetCategories[0]._id,
        purchaseDate: new Date("2024-01-15"),
        purchaseCost: 450000,
        usefulLife: 36,
        depreciationMethod: "StraightLine",
        salvageValue: 22500,
        currentValue: 439375,
        accumulatedDepreciation: 10625,
        lastDepreciationDate: new Date("2024-03-31"),
        nextDepreciationDate: new Date("2024-04-30"),
        glAccount: accountMap["1301"]._id,
        depreciationExpenseAccount: accountMap["5100"]._id,
        accumulatedDepreciationAccount: accountMap["1301"]._id,
        status: "Active",
        location: "Server Room, 2nd Floor",
        assignedTo: "IT Team",
        vendorName: "TechConnect IT Distributors",
        invoiceNumber: "PI-00003",
        serialNumber: "DL-PE-R740-2024-001",
        createdBy: adminId,
      },
      {
        assetCode: "AST-002",
        assetName: "Office Workstations Bundle",
        description: "10 ergonomic workstations with chairs and desks",
        category: assetCategories[1]._id,
        purchaseDate: new Date("2024-01-05"),
        purchaseCost: 350000,
        usefulLife: 60,
        depreciationMethod: "StraightLine",
        salvageValue: 17500,
        currentValue: 344458,
        accumulatedDepreciation: 5542,
        lastDepreciationDate: new Date("2024-03-31"),
        nextDepreciationDate: new Date("2024-04-30"),
        glAccount: accountMap["1302"]._id,
        depreciationExpenseAccount: accountMap["5100"]._id,
        accumulatedDepreciationAccount: accountMap["1302"]._id,
        status: "Active",
        location: "Office Floor 1 & 2",
        assignedTo: "All Departments",
        vendorName: "Global Industrial Supplies",
        invoiceNumber: "PI-00001",
        serialNumber: "OW-BNDL-2024-001",
        createdBy: adminId,
      },
      {
        assetCode: "AST-003",
        assetName: "Company Car - Toyota Innova",
        description: "Company vehicle for executive transport",
        category: assetCategories[2]._id,
        purchaseDate: new Date("2024-01-20"),
        purchaseCost: 1200000,
        usefulLife: 84,
        depreciationMethod: "WrittenDownValue",
        salvageValue: 120000,
        currentValue: 1171429,
        accumulatedDepreciation: 28571,
        lastDepreciationDate: new Date("2024-03-31"),
        nextDepreciationDate: new Date("2024-04-30"),
        glAccount: accountMap["1300"]._id,
        depreciationExpenseAccount: accountMap["5100"]._id,
        accumulatedDepreciationAccount: accountMap["1300"]._id,
        status: "Active",
        location: "Company Parking",
        assignedTo: "Executive Team",
        vendorName: "Global Industrial Supplies",
        invoiceNumber: "PI-00001",
        serialNumber: "TOY-INN-2024-001",
        createdBy: adminId,
      },
      {
        assetCode: "AST-004",
        assetName: "Networking Equipment Bundle",
        description: "Cisco switches, routers, and firewall appliances",
        category: assetCategories[0]._id,
        purchaseDate: new Date("2024-02-01"),
        purchaseCost: 300000,
        usefulLife: 36,
        depreciationMethod: "StraightLine",
        salvageValue: 15000,
        currentValue: 289583,
        accumulatedDepreciation: 10417,
        lastDepreciationDate: new Date("2024-03-31"),
        nextDepreciationDate: new Date("2024-04-30"),
        glAccount: accountMap["1301"]._id,
        depreciationExpenseAccount: accountMap["5100"]._id,
        accumulatedDepreciationAccount: accountMap["1301"]._id,
        status: "Active",
        location: "Server Room, 2nd Floor",
        assignedTo: "IT Team",
        vendorName: "TechConnect IT Distributors",
        invoiceNumber: "PI-00003",
        serialNumber: "CISCO-NET-2024-001",
        createdBy: adminId,
      },
    ];

    const assets = await Asset.insertMany(assetsData);
    console.log(`  Created ${assetCategories.length} asset categories and ${assets.length} assets.\n`);

    // ──────────────────────────────────────────────────────────────────────
    // STEP 20: Credit Notes
    // ──────────────────────────────────────────────────────────────────────
    console.log("--- STEP 20: Seeding Credit Notes ---");

    const creditNotesData = [
      {
        creditNoteNumber: "CN-00001",
        customer: customerDocs[1]._id, // GreenLeaf Retail
        invoice: salesInvoices[1]._id, // SI-00002
        creditNoteDate: new Date("2024-02-15"),
        items: [
          { itemName: "POS Software License (Return - 1 defective unit)", quantity: 1, rate: 12000, amount: 12000 },
        ],
        subtotal: 12000,
        taxAmount: 2160,
        grandTotal: 14160,
        reason: "Defective POS software license - returned by customer",
        status: "Submitted",
        createdBy: accountantUser._id,
      },
      {
        creditNoteNumber: "CN-00002",
        customer: customerDocs[3]._id, // Eastern Exports
        creditNoteDate: new Date("2024-03-01"),
        items: [
          { itemName: "Compliance Dashboard - Partial discount adjustment", quantity: 1, rate: 10000, amount: 10000 },
        ],
        subtotal: 10000,
        taxAmount: 1800,
        grandTotal: 11800,
        reason: "Goodwill discount on compliance dashboard - early payment incentive",
        status: "Draft",
        createdBy: juniorAcctUser._id,
      },
    ];

    const creditNotes = await CreditNote.insertMany(creditNotesData);
    console.log(`  Created ${creditNotes.length} credit notes.\n`);

    // ──────────────────────────────────────────────────────────────────────
    // STEP 21: Debit Notes
    // ──────────────────────────────────────────────────────────────────────
    console.log("--- STEP 21: Seeding Debit Notes ---");

    const debitNotesData = [
      {
        debitNoteNumber: "DN-00001",
        supplier: supplierDocs[0]._id, // Global Industrial
        invoice: purchaseInvoices[0]._id, // PI-00001
        debitNoteDate: new Date("2024-02-20"),
        items: [
          { itemName: "Steel Sheets Grade 304 - Damaged goods return", quantity: 5, rate: 3500, amount: 17500 },
        ],
        subtotal: 17500,
        taxAmount: 3150,
        grandTotal: 20650,
        reason: "Damaged steel sheets returned - quality issue",
        status: "Submitted",
        createdBy: accountantUser._id,
      },
      {
        debitNoteNumber: "DN-00002",
        supplier: supplierDocs[1]._id, // OfficePro Stationers
        debitNoteDate: new Date("2024-03-10"),
        items: [
          { itemName: "Printer Paper - Incorrect specification return", quantity: 5, rate: 500, amount: 2500 },
        ],
        subtotal: 2500,
        taxAmount: 450,
        grandTotal: 2950,
        reason: "Incorrect paper size delivered - awaiting replacement",
        status: "Draft",
        createdBy: juniorAcctUser._id,
      },
    ];

    const debitNotes = await DebitNote.insertMany(debitNotesData);
    console.log(`  Created ${debitNotes.length} debit notes.\n`);

    // ──────────────────────────────────────────────────────────────────────
    // STEP 22: Payments (Receipts & Payments)
    // ──────────────────────────────────────────────────────────────────────
    console.log("--- STEP 22: Seeding Payments ---");

    const paymentsData = [
      {
        paymentNumber: "RCT-00001",
        paymentType: "Receipt",
        invoiceType: "SalesInvoice",
        invoice: salesInvoices[0]._id, // SI-00001 from TechVision
        customer: customerDocs[0]._id,
        amount: 236000,
        paymentDate: new Date("2024-02-15"),
        paymentMethod: "Cheque",
        referenceNumber: "CHQ-001234",
        account: ac1202, // Bank Account
        remarks: "Payment received for SI-00001",
        status: "Submitted",
        createdBy: accountantUser._id,
      },
      {
        paymentNumber: "PMT-00001",
        paymentType: "Payment",
        invoiceType: "PurchaseInvoice",
        invoice: purchaseInvoices[2]._id, // PI-00003 TechConnect
        supplier: supplierDocs[2]._id,
        amount: 500000,
        paymentDate: new Date("2024-03-15"),
        paymentMethod: "Bank Transfer",
        referenceNumber: "NEFT-20240315",
        account: ac1202, // Bank Account
        remarks: "Partial payment for PI-00003 - IT equipment",
        status: "Submitted",
        createdBy: accountantUser._id,
      },
      {
        paymentNumber: "PMT-00002",
        paymentType: "Payment",
        invoiceType: "PurchaseInvoice",
        invoice: purchaseInvoices[0]._id, // PI-00001 Global Industrial
        supplier: supplierDocs[0]._id,
        amount: 300000,
        paymentDate: new Date("2024-03-01"),
        paymentMethod: "Bank Transfer",
        referenceNumber: "NEFT-20240301",
        account: ac1202, // Bank Account
        remarks: "Partial payment for PI-00001 - raw materials",
        status: "Draft",
        createdBy: juniorAcctUser._id,
      },
    ];

    const payments = await Payment.insertMany(paymentsData);
    console.log(`  Created ${payments.length} payments.\n`);

    // ──────────────────────────────────────────────────────────────────────
    // STEP 23: Notifications
    // ──────────────────────────────────────────────────────────────────────
    console.log("--- STEP 23: Seeding Notifications ---");

    const notificationsData = [
      {
        recipient: accountantUser._id,
        type: "invoice_created",
        title: "Sales Invoice Created",
        message: "Sales Invoice SI-00004 has been created for Eastern Exports (₹2,95,000).",
        entityType: "SalesInvoice",
        entityId: salesInvoices[3]._id,
        isRead: true,
        createdAt: new Date("2024-02-20"),
      },
      {
        recipient: managerUser._id,
        type: "invoice_submitted",
        title: "Invoice Requires Approval",
        message: "Purchase Invoice PI-00003 (₹6,53,720) from TechConnect IT Distributors needs manager approval.",
        entityType: "PurchaseInvoice",
        entityId: purchaseInvoices[2]._id,
        isRead: false,
        createdAt: new Date("2024-03-01"),
      },
      {
        recipient: accountantUser._id,
        type: "payment_received",
        title: "Payment Received",
        message: "₹2,36,000 received from TechVision Solutions via Cheque CHQ-001234.",
        entityType: "Payment",
        isRead: false,
        createdAt: new Date("2024-02-15"),
      },
      {
        recipient: adminId,
        type: "system_alert",
        title: "Budget Utilization Alert",
        message: "Salary expenses for FY 2024-2025 have reached 25% of the annual budget.",
        entityType: "Budget",
        isRead: false,
        createdAt: new Date("2024-03-31"),
      },
      {
        recipient: accountantUser._id,
        type: "journal_submitted",
        title: "Journal Entry Posted",
        message: "Journal Entry JE-00011 (Interest Income ₹15,000) has been posted successfully.",
        entityType: "JournalEntry",
        isRead: true,
        createdAt: new Date("2024-03-05"),
      },
      {
        recipient: juniorAcctUser._id,
        type: "credit_note_issued",
        title: "Credit Note Issued",
        message: "Credit Note CN-00001 (₹14,160) issued to GreenLeaf Retail for defective POS software.",
        entityType: "CreditNote",
        entityId: creditNotes[0]._id,
        isRead: false,
        createdAt: new Date("2024-02-15"),
      },
    ];

    const notifications = await Notification.insertMany(notificationsData);
    console.log(`  Created ${notifications.length} notifications.\n`);

    // ──────────────────────────────────────────────────────────────────────
    // STEP 24: Activity Logs
    // ──────────────────────────────────────────────────────────────────────
    console.log("--- STEP 24: Seeding Activity Logs ---");

    const activityLogsData = [
      {
        action: "Seeded",
        entity: "System",
        description: "ERP seed data script executed - all modules populated with realistic test data",
        category: "business",
        performedBy: adminId,
        performedByName: "System Admin",
        metadata: { seedScript: "seed-erp-data.js", seededAt: new Date() },
      },
      {
        action: "Created",
        entity: "User",
        entityName: "accountant@company.com",
        description: "User account created for Arun Kumar (ACCOUNTANT)",
        category: "security",
        performedBy: adminId,
        performedByName: "System Admin",
      },
      {
        action: "Submitted",
        entity: "JournalEntry",
        entityId: journalEntries[0]._id,
        entityName: "JE-00001",
        description: "Opening balance entry (₹50,00,000) - Capital contribution posted",
        category: "business",
        performedBy: adminId,
        performedByName: "System Admin",
      },
      {
        action: "Submitted",
        entity: "SalesInvoice",
        entityId: salesInvoices[0]._id,
        entityName: "SI-00001",
        description: "Sales Invoice SI-00001 (₹2,36,000) submitted for TechVision Solutions",
        category: "business",
        performedBy: accountantUser._id,
        performedByName: "Arun Kumar",
      },
      {
        action: "Submitted",
        entity: "PurchaseInvoice",
        entityId: purchaseInvoices[0]._id,
        entityName: "PI-00001",
        description: "Purchase Invoice PI-00001 (₹5,90,000) submitted from Global Industrial Supplies",
        category: "business",
        performedBy: accountantUser._id,
        performedByName: "Arun Kumar",
      },
    ];

    const activityLogs = await ActivityLog.insertMany(activityLogsData);
    console.log(`  Created ${activityLogs.length} activity logs.\n`);

    // ──────────────────────────────────────────────────────────────────────
    // Summary
    // ──────────────────────────────────────────────────────────────────────
    console.log("╔══════════════════════════════════════════════════════════╗");
    console.log("║              ERP DATA SEEDING COMPLETE                   ║");
    console.log("╠══════════════════════════════════════════════════════════╣");
    console.log(`║  Permissions:          ${String(seededPermissions.length).padStart(4)}                                ║`);
    console.log(`║  Roles:                4                                ║`);
    console.log(`║  Users:                5                                ║`);
    console.log(`║  Chart of Accounts:    ${String(Object.keys(accountMap).length).padStart(4)}                                ║`);
    console.log(`║  Customers:            ${String(customerDocs.length).padStart(4)}                                ║`);
    console.log(`║  Suppliers:            ${String(supplierDocs.length).padStart(4)}                                ║`);
    console.log(`║  Tax Rates:            ${String(taxRates.length).padStart(4)}                                ║`);
    console.log(`║  Tax Groups:           ${String(taxGroups.length).padStart(4)}                                ║`);
    console.log(`║  Fiscal Years:         ${String(fiscalYears.length).padStart(4)}                                ║`);
    console.log(`║  Numbering Series:     ${String(numberingSeries.length).padStart(4)}                                ║`);
    console.log(`║  Cost Centers:         ${String(costCenters.length).padStart(4)}                                ║`);
    console.log(`║  Exchange Rates:       ${String(exchangeRates.length).padStart(4)}                                ║`);
    console.log(`║  Budgets:              1                                ║`);
    console.log(`║  Bank Accounts:        ${String(bankAccounts.length).padStart(4)}                                ║`);
    console.log(`║  Bank Transactions:    ${String(bankTransactions.length).padStart(4)}                                ║`);
    console.log(`║  Asset Categories:     ${String(assetCategories.length).padStart(4)}                                ║`);
    console.log(`║  Assets:               ${String(assets.length).padStart(4)}                                ║`);
    console.log(`║  Journal Entries:      ${String(journalEntries.length).padStart(4)}                                ║`);
    console.log(`║  Sales Invoices:       ${String(salesInvoices.length).padStart(4)}                                ║`);
    console.log(`║  Purchase Invoices:    ${String(purchaseInvoices.length).padStart(4)}                                ║`);
    console.log(`║  Credit Notes:         ${String(creditNotes.length).padStart(4)}                                ║`);
    console.log(`║  Debit Notes:          ${String(debitNotes.length).padStart(4)}                                ║`);
    console.log(`║  Payments:             ${String(payments.length).padStart(4)}                                ║`);
    console.log(`║  Notifications:        ${String(notifications.length).padStart(4)}                                ║`);
    console.log(`║  Activity Logs:        ${String(activityLogs.length).padStart(4)}                                ║`);
    console.log("╚══════════════════════════════════════════════════════════╝\n");

    console.log("Test Credentials:");
    console.log("  admin@company.com     / AdminPassword123!  (SYSTEM_ADMIN)");
    console.log("  accountant@company.com / Accountant@123    (ACCOUNTANT)");
    console.log("  auditor@company.com    / Auditor@123       (AUDITOR)");
    console.log("  manager@company.com    / Manager@123       (MANAGER)\n");

    await mongoose.connection.close();
    console.log("Database connection closed.");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seed();
