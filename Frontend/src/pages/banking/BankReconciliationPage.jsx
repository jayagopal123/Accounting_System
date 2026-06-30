import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { getBankAccounts } from "../../services/bankAccountApi";
import {
  getReconciliations,
  createReconciliation,
  completeReconciliation,
  verifyReconciliation,
} from "../../services/bankReconciliationApi";
import { BsBank, BsCheckLg, BsPlusLg, BsShieldCheck } from "react-icons/bs";

function BankReconciliationPage() {
  const navigate = useNavigate();
  const [reconciliations, setReconciliations] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  // New reconciliation form
  const [formData, setFormData] = useState({
    bankAccount: "",
    statementStartDate: "",
    statementEndDate: "",
    openingBalance: "",
    closingBalance: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [recRes, acctRes] = await Promise.all([
        getReconciliations(),
        getBankAccounts(),
      ]);
      setReconciliations(recRes.data.data || []);
      setBankAccounts(acctRes.data.data || []);
      setError("");
    } catch (err) {
      const msg = String(err);
      if (!msg.includes("Access denied")) setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateReconciliation = async (event) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      setError("");

      await createReconciliation({
        bankAccount: formData.bankAccount,
        statementStartDate: formData.statementStartDate,
        statementEndDate: formData.statementEndDate,
        openingBalance: Number(formData.openingBalance) || 0,
        closingBalance: Number(formData.closingBalance) || 0,
        notes: formData.notes,
      });

      setSuccess(true);
      setShowForm(false);
      setFormData({
        bankAccount: "",
        statementStartDate: "",
        statementEndDate: "",
        openingBalance: "",
        closingBalance: "",
        notes: "",
      });
      setTimeout(() => {
        setSuccess(false);
        loadData();
      }, 800);
    } catch (err) {
      const msg = String(err);
      if (!msg.includes("Access denied")) setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleComplete = async (id) => {
    try {
      await completeReconciliation(id);
      await loadData();
    } catch (err) {
      setError(String(err));
    }
  };

  const handleVerify = async (id) => {
    try {
      await verifyReconciliation(id);
      await loadData();
    } catch (err) {
      setError(String(err));
    }
  };

  const getBankAccountName = (id) => {
    const acc = bankAccounts.find((a) => a._id === id);
    return acc ? `${acc.accountName} (${acc.bankName})` : "—";
  };

  return (
    <MainLayout>
      <div className="page-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h5 className="page-header-title mb-1">Bank Reconciliation</h5>
            <p className="page-header-subtitle">
              Match bank statement entries with system transactions
            </p>
          </div>
          <button
            className="btn btn-primary d-flex align-items-center gap-2"
            onClick={() => setShowForm(!showForm)}
          >
            <BsPlusLg size={13} />{" "}
            {showForm ? "Cancel" : "New Reconciliation"}
          </button>
        </div>

        {error ? (
          <div className="alert alert-danger py-2" style={{ fontSize: "0.8rem" }}>
            {error}
          </div>
        ) : null}
        {success && (
          <div
            className="alert alert-success d-flex align-items-center gap-2 mb-3"
            style={{
              fontSize: "0.8rem",
              backgroundColor: "#ecfdf5",
              color: "#065f46",
              border: "none",
            }}
          >
            <span>Reconciliation created successfully.</span>
          </div>
        )}

        {/* New Reconciliation Form */}
        {showForm && (
          <div className="card mb-4 border">
            <div className="card-body">
              <h6 className="fw-semibold mb-3">Start New Reconciliation</h6>
              <form onSubmit={handleCreateReconciliation}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Bank Account *</label>
                    <select
                      className="form-select"
                      value={formData.bankAccount}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          bankAccount: e.target.value,
                        }))
                      }
                      required
                    >
                      <option value="">Select bank account</option>
                      {bankAccounts
                        .filter((a) => a.isActive)
                        .map((acc) => (
                          <option key={acc._id} value={acc._id}>
                            {acc.accountName} - {acc.bankName} (Balance:{" "}
                            {acc.currency}{" "}
                            {acc.currentBalance?.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                            })}
                            )
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Statement Start Date *</label>
                    <input
                      className="form-control"
                      type="date"
                      value={formData.statementStartDate}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          statementStartDate: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Statement End Date *</label>
                    <input
                      className="form-control"
                      type="date"
                      value={formData.statementEndDate}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          statementEndDate: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">
                      Opening Balance (as per statement) *
                    </label>
                    <input
                      className="form-control font-mono"
                      type="number"
                      step="0.01"
                      value={formData.openingBalance}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          openingBalance: e.target.value,
                        }))
                      }
                      required
                      placeholder="0.00"
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">
                      Closing Balance (as per statement) *
                    </label>
                    <input
                      className="form-control font-mono"
                      type="number"
                      step="0.01"
                      value={formData.closingBalance}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          closingBalance: e.target.value,
                        }))
                      }
                      required
                      placeholder="0.00"
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Notes</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          notes: e.target.value,
                        }))
                      }
                      placeholder="Optional notes..."
                    />
                  </div>
                  <div className="col-12">
                    <button
                      className="btn btn-primary"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                          ></span>
                          Creating...
                        </>
                      ) : (
                        "Create Reconciliation"
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Reconciliations List */}
        <div className="table-responsive">
          <table className="table table-premium align-middle">
            <thead>
              <tr>
                <th>Bank Account</th>
                <th>Statement Period</th>
                <th className="text-end">System Balance</th>
                <th className="text-end">Statement Closing</th>
                <th className="text-end">Difference</th>
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
                        Loading reconciliations...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : reconciliations.length === 0 ? (
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
                        No reconciliations found
                      </div>
                      <div className="text-muted small">
                        Start a new reconciliation to match bank statements with
                        system records.
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                reconciliations.map((rec) => (
                  <tr key={rec._id}>
                    <td className="fw-medium">
                      {getBankAccountName(rec.bankAccount)}
                    </td>
                    <td className="text-muted" style={{ fontSize: "0.8rem" }}>
                      {new Date(
                        rec.statementStartDate,
                      ).toLocaleDateString()}{" "}
                      -{" "}
                      {new Date(rec.statementEndDate).toLocaleDateString()}
                    </td>
                    <td className="text-end font-mono">
                      {rec.systemBalance?.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="text-end font-mono">
                      {rec.closingBalance?.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="text-end font-mono">
                      <span
                        className={
                          Math.abs(rec.difference) > 0
                            ? "text-danger"
                            : "text-success"
                        }
                      >
                        {rec.difference >= 0 ? "+" : ""}
                        {rec.difference?.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge-premium ${
                          rec.status === "Verified"
                            ? "badge-premium-submitted"
                            : rec.status === "Completed"
                              ? "badge-premium-active"
                              : "badge-premium-draft"
                        }`}
                      >
                        {rec.status}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="d-flex gap-1 justify-content-end">
                        {rec.status === "Draft" ? (
                          <button
                            className="btn btn-sm btn-outline-success"
                            onClick={() => handleComplete(rec._id)}
                            title="Complete"
                          >
                            <BsCheckLg size={13} />
                          </button>
                        ) : null}
                        {rec.status === "Completed" ? (
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleVerify(rec._id)}
                            title="Verify"
                          >
                            <BsShieldCheck size={13} />
                          </button>
                        ) : null}
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

export default BankReconciliationPage;
