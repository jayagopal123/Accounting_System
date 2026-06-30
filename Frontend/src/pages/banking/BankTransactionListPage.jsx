import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { getBankAccounts } from "../../services/bankAccountApi";
import {
  getBankTransactions,
  updateTransactionStatus,
  cancelBankTransaction,
} from "../../services/bankTransactionApi";
import { BsBank, BsCheckLg, BsXLg } from "react-icons/bs";

function BankTransactionListPage() {
  const [transactions, setTransactions] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bankFilter, setBankFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const params = {};
      if (bankFilter) params.bankAccount = bankFilter;
      if (typeFilter) params.transactionType = typeFilter;
      if (statusFilter) params.status = statusFilter;

      const [txnRes, acctRes] = await Promise.all([
        getBankTransactions(params),
        getBankAccounts(),
      ]);
      setTransactions(txnRes.data.data || []);
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
    loadTransactions();
  }, [bankFilter, typeFilter, statusFilter]);

  const handleClear = async (id) => {
    try {
      await updateTransactionStatus(id, "Cleared");
      await loadTransactions();
    } catch (err) {
      setError(String(err));
    }
  };

  const handleBounce = async (id) => {
    try {
      await updateTransactionStatus(id, "Bounced");
      await loadTransactions();
    } catch (err) {
      setError(String(err));
    }
  };

  const handleCancel = async (id) => {
    try {
      await cancelBankTransaction(id);
      await loadTransactions();
    } catch (err) {
      setError(String(err));
    }
  };

  const formatCurrency = (amount) =>
    amount?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || "0.00";

  return (
    <MainLayout>
      <div className="page-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h5 className="page-header-title mb-1">Bank Transactions</h5>
            <p className="page-header-subtitle">
              View and manage all bank transactions
            </p>
          </div>
          <Link
            className="btn btn-primary d-flex align-items-center gap-2"
            to="/bank-transactions/new"
          >
            <span>+</span> New Transaction
          </Link>
        </div>

        {error ? (
          <div className="alert alert-danger py-2" style={{ fontSize: "0.8rem" }}>
            {error}
          </div>
        ) : null}

        <div className="row g-3 mb-3">
          <div className="col-md-3">
            <select
              className="form-select"
              value={bankFilter}
              onChange={(e) => setBankFilter(e.target.value)}
            >
              <option value="">All Bank Accounts</option>
              {bankAccounts.map((acc) => (
                <option key={acc._id} value={acc._id}>
                  {acc.accountName} ({acc.bankName})
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <select
              className="form-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="Deposit">Deposit</option>
              <option value="Withdrawal">Withdrawal</option>
              <option value="Transfer">Transfer</option>
            </select>
          </div>
          <div className="col-md-3">
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Cleared">Cleared</option>
              <option value="Pending">Pending</option>
              <option value="Bounced">Bounced</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-premium align-middle">
            <thead>
              <tr>
                <th>Date</th>
                <th>Bank Account</th>
                <th>Type</th>
                <th className="text-end">Amount</th>
                <th>Reference</th>
                <th>Payment Method</th>
                <th>Status</th>
                <th>Reconciliation</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-5">
                    <div className="d-flex flex-column align-items-center gap-2">
                      <div
                        className="spinner-border text-secondary"
                        role="status"
                        style={{ width: "1.25rem", height: "1.25rem" }}
                      />
                      <span className="text-muted small">
                        Loading transactions...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-5">
                    <div className="d-flex flex-column align-items-center gap-2">
                      <div className="empty-state-icon">
                        <BsBank size={18} />
                      </div>
                      <div
                        className="fw-semibold text-dark"
                        style={{ fontSize: "0.875rem" }}
                      >
                        No transactions found
                      </div>
                      <div className="text-muted small">
                        Transactions appear when payments are made via bank transfer or cheque.
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                transactions.map((txn) => (
                  <tr key={txn._id}>
                    <td className="font-mono text-muted" style={{ fontSize: "0.8rem" }}>
                      {new Date(txn.transactionDate).toLocaleDateString()}
                    </td>
                    <td className="fw-medium" style={{ fontSize: "0.85rem" }}>
                      {txn.bankAccount?.accountName || "—"}
                    </td>
                    <td>
                      <span
                        className={`badge-premium ${
                          txn.transactionType === "Deposit"
                            ? "badge-premium-submitted"
                            : "badge-premium-draft"
                        }`}
                      >
                        {txn.transactionType}
                      </span>
                    </td>
                    <td className="text-end font-mono fw-semibold">
                      {txn.transactionType === "Deposit" ? "+" : "-"}
                      {formatCurrency(txn.amount)}
                    </td>
                    <td className="text-muted" style={{ fontSize: "0.8rem" }}>
                      {txn.referenceNumber || txn.referenceType || "—"}
                    </td>
                    <td className="text-muted">{txn.paymentMethod}</td>
                    <td>
                      <span
                        className={`badge-premium ${
                          txn.status === "Cleared"
                            ? "badge-premium-submitted"
                            : txn.status === "Pending"
                              ? "badge-premium-draft"
                              : "badge-premium-cancelled"
                        }`}
                      >
                        {txn.status}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge-premium ${
                          txn.reconciliationStatus === "Reconciled"
                            ? "badge-premium-submitted"
                            : "badge-premium-draft"
                        }`}
                      >
                        {txn.reconciliationStatus}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="d-flex gap-1 justify-content-end">
                        {txn.status === "Pending" ? (
                          <>
                            <button
                              className="btn btn-sm btn-outline-success"
                              onClick={() => handleClear(txn._id)}
                              title="Mark Cleared"
                            >
                              <BsCheckLg size={13} />
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleBounce(txn._id)}
                              title="Mark Bounced"
                            >
                              <BsXLg size={13} />
                            </button>
                          </>
                        ) : null}
                        {txn.status !== "Cancelled" &&
                        txn.reconciliationStatus !== "Reconciled" ? (
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => handleCancel(txn._id)}
                            title="Cancel"
                          >
                            <BsXLg size={13} />
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

export default BankTransactionListPage;
