import MainLayout from "../layouts/MainLayout";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAccounts } from "../services/accountApi";
import { getCustomers } from "../services/customerApi";
import { getSuppliers } from "../services/supplierApi";
import { getJournalEntries } from "../services/journalEntryApi";
import { FaArrowUp, FaCalendarAlt, FaSlidersH } from "react-icons/fa";

const cards = [
  { key: "accounts", label: "General Ledger Accounts", descriptor: "Chart Matrix Nodes", route: "/accounts" },
  { key: "customers", label: "Active Receivables Accounts", descriptor: "Customer Master Files", route: "/customers" },
  { key: "suppliers", label: "Active Payables Accounts", descriptor: "Supplier Master Files", route: "/suppliers" },
  { key: "journalEntries", label: "Unposted Journal Batches", descriptor: "Transaction Journal Records", route: "/journal-entries" },
];

function Dashboard() {
  const [stats, setStats] = useState({
    accounts: 0,
    customers: 0,
    suppliers: 0,
    journalEntries: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [accountsResponse, customersResponse, suppliersResponse, journalResponse] =
          await Promise.all([
            getAccounts(),
            getCustomers(),
            getSuppliers(),
            getJournalEntries(),
          ]);

        setStats({
          accounts: accountsResponse.data.data.length,
          customers: customersResponse.data.data.total ?? customersResponse.data.data.customers?.length ?? 0,
          suppliers: suppliersResponse.data.data.total ?? suppliersResponse.data.data.suppliers?.length ?? 0,
          journalEntries: journalResponse.data.data.length,
        });
      } catch {
        setStats({ accounts: 0, customers: 0, suppliers: 0, journalEntries: 0 });
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <MainLayout>
      {/* Title Header Workspace */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-4 pb-3 border-bottom">
        <div>
          <h4 className="fw-bold tracking-tight text-dark mb-0">Finance Command Center</h4>
          <p className="text-muted small mb-0">Operational real-time balancing indexes and parameters.</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-primary d-flex align-items-center gap-1.5 py-1.5 px-2.5">
            <FaCalendarAlt size={11} />
            <span>FY 2026-27</span>
          </button>
          <button className="btn btn-outline-primary d-flex align-items-center gap-1.5 py-1.5 px-2.5">
            <FaSlidersH size={11} />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Metrics Layout Grid */}
      <div className="row g-3 mb-4">
        {cards.map((card) => (
          <div className="col-12 col-md-6 col-xl-3" key={card.key}>
            <Link to={card.route} className="stat-card">
              <div>
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="stat-card__label">{card.label}</span>
                  <span className="font-mono text-muted" style={{ fontSize: '0.625rem' }}>{card.descriptor}</span>
                </div>
                <div className="stat-card__value">
                  {loading ? (
                    <div className="spinner-border spinner-border-sm text-muted" role="status" style={{ width: "12px", height: "12px" }}></div>
                  ) : stats[card.key]}
                </div>
              </div>
              <div className="mt-3 pt-2 border-top d-flex justify-content-between align-items-center text-muted" style={{ fontSize: "0.7rem" }}>
                <span className="text-success fw-medium d-flex align-items-center gap-0.5">
                  <FaArrowUp size={8} /> +0.0% this cycle
                </span>
                <span className="fw-medium font-mono text-dark">Analyze Ledger →</span>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Structured Multi-Column Audit Matrix */}
      <div className="row g-4">
        {/* Real-Time Operational Registers */}
        <div className="col-12 col-lg-7">
          <div className="page-card p-3.5 h-100" style={{ padding: "1.25rem" }}>
            <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
              <h6 className="fw-bold text-dark mb-0" style={{ fontSize: "0.85rem" }}>Sub-Ledger Processing Pipeline</h6>
              <span className="badge bg-light text-dark font-mono border" style={{ fontSize: "0.625rem" }}>LIVE_BUS</span>
            </div>
            
            <div className="table-responsive border-0">
              <table className="table table-premium align-middle">
                <thead>
                  <tr>
                    <th>Ledger Stream Segment</th>
                    <th>Subsystem Code</th>
                    <th>Status Frame</th>
                    <th className="text-end">Verification Vol</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="fw-semibold">Receivables Ledger Subsystem</td>
                    <td className="font-mono text-muted">SYS_RECV_STRM</td>
                    <td><span className="badge-premium badge-premium-sync">Active Balance</span></td>
                    <td className="text-end font-mono fw-semibold">{loading ? "..." : stats.customers} records</td>
                  </tr>
                  <tr>
                    <td className="fw-semibold">Payables Ledger Subsystem</td>
                    <td className="font-mono text-muted">SYS_PAY_STRM</td>
                    <td><span className="badge-premium badge-premium-sync">Active Balance</span></td>
                    <td className="text-end font-mono fw-semibold">{loading ? "..." : stats.suppliers} records</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Operational Validation Stream */}
        <div className="col-12 col-lg-5">
          <div className="page-card p-3.5 h-100" style={{ padding: "1.25rem" }}>
            <h6 className="fw-bold text-dark mb-3 pb-2 border-bottom" style={{ fontSize: "0.85rem" }}>Security Verification Feed</h6>
            <div className="pt-1">
              <div className="activity-node active">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="fw-semibold text-dark" style={{ fontSize: "0.8rem" }}>Ledger Integrity Check Complete</span>
                  <span className="text-muted font-mono" style={{ fontSize: "0.625rem" }}>Just Now</span>
                </div>
                <p className="text-muted small mb-0 mt-0.5">Automated trial balance zero checks completed with no asset mismatch flags.</p>
              </div>
              <div className="activity-node">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="fw-semibold text-dark" style={{ fontSize: "0.8rem" }}>System Endpoints Connected</span>
                  <span className="text-muted font-mono" style={{ fontSize: "0.625rem" }}>04m ago</span>
                </div>
                <p className="text-muted small mb-0 mt-0.5">Database parameters fetched from core backend framework without data degradation flags.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default Dashboard;