import Account from "../models/Account.js";
import Customer from "../models/Customer.js";
import Supplier from "../models/Supplier.js";
import JournalEntry from "../models/JournalEntry.js";

class DashboardService {
  async getSummary() {
    const [activeAccounts, activeCustomers, activeSuppliers, unpostedJournals] =
      await Promise.all([
        Account.countDocuments({ status: "ACTIVE" }),
        Customer.countDocuments({ status: "Active", isDeleted: false }),
        Supplier.countDocuments({ status: "Active", isDeleted: false }),
        JournalEntry.countDocuments({ status: "Draft" }),
      ]);

    return {
      totalActiveLedgerAccounts: activeAccounts,
      totalActiveReceivableAccounts: activeCustomers,
      totalActivePayableAccounts: activeSuppliers,
      totalUnpostedJournalEntries: unpostedJournals,
    };
  }
}

export default new DashboardService();
