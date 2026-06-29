import MainLayout from "../layouts/MainLayout";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getDashboardSummary, getRecentActivities } from "../services/dashboardApi";
import { FaArrowUp, FaCalendarAlt, FaSlidersH, FaUserPlus, FaFileInvoiceDollar, FaCheckCircle, FaBook, FaBan } from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";

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
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);
  const [error, setError] = useState(null);

  const getActivityIcon = (action) => {
    switch (action) {
      case "Created":
        return <FaUserPlus size={11} className="text-success" />;
      case "Submitted":
        return <FaCheckCircle size={11} className="text-primary" />;
      case "Updated":
        return <FaBook size={11} className="text-info" />;
      case "Cancelled":
        return <FaBan size={11} className="text-danger" />;
      case "Deleted":
        return <FaBan size={11} className="text-danger" />;
      case "Activated":
        return <FaCheckCircle size={11} className="text-success" />;
      case "Blocked":
        return <FaBan size={11} className="text-warning" />;
      default:
        return <FaFileInvoiceDollar size={11} className="text-muted" />;
    }
  };

  const getEntityBadge = (entity) => {
    switch (entity) {
      case "Customer":
        return <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25" style={{ fontSize: "0.6rem", fontWeight: 600 }}>Customer</span>;
      case "Supplier":
        return <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25" style={{ fontSize: "0.6rem", fontWeight: 600 }}>Supplier</span>;
      case "SalesInvoice":
        return <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25" style={{ fontSize: "0.6rem", fontWeight: 600 }}>Sales Inv.</span>;
      case "PurchaseInvoice":
        return <span className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25" style={{ fontSize: "0.6rem", fontWeight: 600 }}>Purchase Inv.</span>;
      case "JournalEntry":
        return <span className="badge bg-purple bg-opacity-10 text-purple border border-purple border-opacity-25" style={{ fontSize: "0.6rem", fontWeight: 600 }}>Journal</span>;
      default:
        return <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25" style={{ fontSize: "0.6rem", fontWeight: 600 }}>{entity}</span>;
    }
  };

  const formatTimestamp = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return "";
    }
  };

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await getDashboardSummary();
        const data = response.data.data;
        setStats({
          accounts: data.totalActiveLedgerAccounts,
          customers: data.totalActiveReceivableAccounts,
          suppliers: data.totalActivePayableAccounts,
          journalEntries: data.totalUnpostedJournalEntries,
        });
        setError(null);
      } catch (err) {
        setError(err || "Failed to load dashboard summary.");
        setStats({ accounts: 0, customers: 0, suppliers: 0, journalEntries: 0 });
      } finally {
        setLoading(false);
      }
    };

    const loadActivities = async () => {
      try {
        const response = await getRecentActivities(8);
        setActivities(response.data.data || []);
      } catch {
        // silently fail, activities are non-critical
      } finally {
        setActivityLoading(false);
      }
    };

    loadStats();
    loadActivities();
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

      {error ? <div className="alert alert-danger py-2 mb-4" style={{ fontSize: "0.8rem" }}>{error}</div> : null}

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

        {/* Recent Activity Stream */}
        <div className="col-12 col-lg-5">
          <div className="page-card p-3.5 h-100" style={{ padding: "1.25rem" }}>
            <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
              <h6 className="fw-bold text-dark mb-0" style={{ fontSize: "0.85rem" }}>Recent Activity</h6>
              <span className="badge bg-light text-dark font-mono border" style={{ fontSize: "0.625rem" }}>LIVE</span>
            </div>
            <div className="pt-1">
              {activityLoading ? (
                <div className="text-center py-4">
                  <div className="spinner-border spinner-border-sm text-muted" role="status" style={{ width: "12px", height: "12px" }}></div>
                  <p className="text-muted mt-2 mb-0" style={{ fontSize: "0.7rem" }}>Loading activities...</p>
                </div>
              ) : activities.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted mb-0" style={{ fontSize: "0.75rem" }}>No recent business activities recorded.</p>
                </div>
              ) : (
                activities.map((activity, index) => (
                  <div className={`activity-node ${index === 0 ? "active" : ""}`} key={activity._id}>
                    <div className="d-flex align-items-start gap-2">
                      <div className="mt-0.5">
                        {getActivityIcon(activity.action)}
                      </div>
                      <div className="flex-grow-1 min-w-0">
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="fw-semibold text-dark" style={{ fontSize: "0.75rem" }}>{activity.action}: {activity.entityName || activity.entity}</span>
                          <span className="text-muted font-mono flex-shrink-0 ms-2" style={{ fontSize: "0.6rem" }}>{formatTimestamp(activity.createdAt)}</span>
                        </div>
                        <p className="text-muted mb-0 mt-0.5" style={{ fontSize: "0.7rem", lineHeight: 1.3 }}>{activity.description}</p>
                        <div className="mt-1">
                          {getEntityBadge(activity.entity)}
                          {activity.performedByName ? (
                            <span className="text-muted ms-2" style={{ fontSize: "0.6rem" }}>by {activity.performedByName}</span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default Dashboard;