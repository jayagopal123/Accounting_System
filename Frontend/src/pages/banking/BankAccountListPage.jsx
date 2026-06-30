import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { getBankAccounts, toggleBankAccountStatus } from "../../services/bankAccountApi";
import { BsBank, BsPlusLg, BsToggleOn, BsToggleOff } from "react-icons/bs";

function BankAccountListPage() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const response = await getBankAccounts();
      setAccounts(response.data.data || []);
      setError("");
    } catch (err) {
      const msg = String(err);
      if (!msg.includes("Access denied")) setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const handleToggleStatus = async (id) => {
    try {
      await toggleBankAccountStatus(id);
      await loadAccounts();
    } catch (err) {
      setError(String(err));
    }
  };

  return (
    <MainLayout>
      <div className="page-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h5 className="page-header-title mb-1">Bank Accounts</h5>
            <p className="page-header-subtitle">
              Manage bank accounts for transactions and reconciliation
            </p>
          </div>
          <Link
            className="btn btn-primary d-flex align-items-center gap-2"
            to="/bank-accounts/new"
          >
            <BsPlusLg size={13} /> New Bank Account
          </Link>
        </div>

        {error ? (
          <div className="alert alert-danger py-2" style={{ fontSize: "0.8rem" }}>
            {error}
          </div>
        ) : null}

        <div className="table-responsive">
          <table className="table table-premium align-middle">
            <thead>
              <tr>
                <th>Account Name</th>
                <th>Bank Name</th>
                <th>Account Number</th>
                <th>Type</th>
                <th className="text-end">Current Balance</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-5">
                    <div className="d-flex flex-column align-items-center gap-2">
                      <div
                        className="spinner-border text-secondary"
                        role="status"
                        style={{ width: "1.25rem", height: "1.25rem" }}
                      />
                      <span className="text-muted small">
                        Loading bank accounts...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : accounts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-5">
                    <div className="d-flex flex-column align-items-center gap-2">
                      <div className="empty-state-icon">
                        <BsBank size={18} />
                      </div>
                      <div
                        className="fw-semibold text-dark"
                        style={{ fontSize: "0.875rem" }}
                      >
                        No bank accounts found
                      </div>
                      <div className="text-muted small">
                        Create a new bank account to start recording transactions.
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                accounts.map((acc) => (
                  <tr key={acc._id}>
                    <td className="fw-semibold">{acc.accountName}</td>
                    <td>{acc.bankName}</td>
                    <td className="font-mono text-muted">
                      {acc.accountNumber.slice(-4).padStart(acc.accountNumber.length, "•")}
                    </td>
                    <td>
                      <span className="badge-premium badge-premium-active">
                        {acc.accountType}
                      </span>
                    </td>
                    <td className="text-end font-mono fw-semibold">
                      {acc.currency}{" "}
                      {acc.currentBalance?.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td>
                      <span
                        className={`badge-premium ${
                          acc.isActive
                            ? "badge-premium-submitted"
                            : "badge-premium-cancelled"
                        }`}
                      >
                        {acc.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="d-flex gap-1 justify-content-end">
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() =>
                            navigate(`/bank-accounts/${acc._id}/edit`)
                          }
                          title="Edit"
                        >
                          <BsBank size={13} />
                        </button>
                        <button
                          className={`btn btn-sm ${
                            acc.isActive
                              ? "btn-outline-warning"
                              : "btn-outline-success"
                          }`}
                          onClick={() => handleToggleStatus(acc._id)}
                          title={acc.isActive ? "Deactivate" : "Activate"}
                        >
                          {acc.isActive ? (
                            <BsToggleOn size={13} />
                          ) : (
                            <BsToggleOff size={13} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
}

export default BankAccountListPage;
