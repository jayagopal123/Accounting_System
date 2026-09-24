import Account from "../models/Account.js";
import Customer from "../models/Customer.js";
import Supplier from "../models/Supplier.js";
import JournalEntry from "../models/JournalEntry.js";
import Payment from "../models/Payment.js";
import activityLogService from "./ActivityLogService.js";

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

  async getRecentActivities(limit = 10) {
    return activityLogService.getRecentBusinessActivities(limit);
  }

  /**
   * Daily cash inflow/outflow series for the last N days, derived from
   * submitted Payments (Receipt = inflow, Payment = outflow).
   * Days with no movement are filled with zeros so charts render a continuous axis.
   */
  async getCashFlowSeries(days = 30) {
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    since.setDate(since.getDate() - (days - 1));

    const payments = await Payment.find({
      status: "Submitted",
      paymentDate: { $gte: since },
    })
      .select("paymentType amount paymentDate")
      .lean();

    // Index payments by YYYY-MM-DD day key
    const dayMap = new Map();
    for (let i = 0; i < days; i++) {
      const d = new Date(since);
      d.setDate(since.getDate() + i);
      dayMap.set(d.toISOString().slice(0, 10), { inflow: 0, outflow: 0 });
    }

    for (const p of payments) {
      const key = new Date(p.paymentDate).toISOString().slice(0, 10);
      const bucket = dayMap.get(key);
      if (!bucket) continue;
      if (p.paymentType === "Receipt") bucket.inflow += p.amount || 0;
      else bucket.outflow += p.amount || 0;
    }

    return Array.from(dayMap.entries()).map(([date, v]) => ({
      date,
      inflow: Math.round(v.inflow * 100) / 100,
      outflow: Math.round(v.outflow * 100) / 100,
      net: Math.round((v.inflow - v.outflow) * 100) / 100,
    }));
  }
}

export default new DashboardService();
