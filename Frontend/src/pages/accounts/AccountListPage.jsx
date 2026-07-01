import MainLayout from "../../layouts/MainLayout";
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { deleteAccount, getAccounts, updateStatus } from "../../services/accountApi";
import { BsPencilSquare, BsToggleOff, BsToggleOn, BsTrash, BsBook } from "react-icons/bs";

function AccountListPage() {
  const [accounts, setAccounts] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAccounts = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getAccounts();
      setAccounts(response.data.data);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const filteredAccounts = useMemo(() => {
    return accounts.filter((account) => {
      const matchesSearch =
        account.accountCode?.toLowerCase().includes(search.toLowerCase()) ||
        account.accountName?.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter ? account.accountType === typeFilter : true;
      return matchesSearch && matchesType;
    });
  }, [accounts, search, typeFilter]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this account?")) return;
    try {
      await deleteAccount(id);
      await loadAccounts();
    } catch (err) {
      setError(String(err));
    }
  };

  const handleStatus = async (id, status) => {
    try {
      await updateStatus(id, status);
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
            <h5 className="page-header-title mb-1">Chart Of Accounts</h5>
            <p className="page-header-subtitle">Manage your general ledger account structure</p>
          </div>
          <Link className="btn btn-primary d-flex align-items-center gap-2" to="/accounts/new">
            <span>+</span> New Account
          </Link>
        </div>

        {error ? <div className="alert alert-danger">{error}</div> : null}

        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <input
              type="text"
              className="form-control"
              placeholder="Search by code or account name"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="col-md-3">
            <select className="form-select" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
              <option value="">All Types</option>
              <option value="ASSET">Asset</option>
              <option value="LIABILITY">Liability</option>
              <option value="EQUITY">Equity</option>
              <option value="INCOME">Income</option>
              <option value="EXPENSE">Expense</option>
            </select>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-premium align-middle mb-0">
            <thead>
              <tr>
                <th>Code</th>
                <th>Account Name</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-5">
                    <div className="d-flex flex-column align-items-center gap-2">
                      <div className="spinner-border text-secondary" role="status" aria-hidden="true" style={{ width: "1.25rem", height: "1.25rem" }} />
                      <span className="text-muted small">Loading accounts...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-5">
                    <div className="d-flex flex-column align-items-center gap-2">
                      <div className="empty-state-icon">
                        <BsBook size={18} />
                      </div>
                      <div className="fw-semibold text-dark" style={{ fontSize: "0.875rem" }}>No accounts found</div>
                      <div className="text-muted small">Try adjusting the search or create a new account.</div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((account) => (
                  <tr key={account._id}>
                    <td className="fw-semibold font-mono">{account.accountCode}</td>
                    <td className="fw-medium">{account.accountName}</td>
                    <td>
                      <span className="badge-premium" style={{
                        backgroundColor: account.accountType === 'ASSET' ? '#e2f5ea' : account.accountType === 'LIABILITY' ? '#fef9c3' : account.accountType === 'EQUITY' ? '#dbeafe' : account.accountType === 'INCOME' ? '#ede9fe' : '#fce7f3',
                        color: account.accountType === 'ASSET' ? '#047857' : account.accountType === 'LIABILITY' ? '#854d0e' : account.accountType === 'EQUITY' ? '#1e40af' : account.accountType === 'INCOME' ? '#6d28d9' : '#be185d'
                      }}>{account.accountType}</span>
                    </td>
                    <td className="font-mono fw-semibold text-end">{account.amount ? account.amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}</td>
                    <td>
                      <span className={`badge-premium ${account.status === "ACTIVE" ? "badge-premium-active" : "badge-premium-cancelled"}`}>
                        {account.status}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="d-flex gap-1 justify-content-end">
                        <Link
                          className="btn btn-sm btn-outline-secondary"
                          to={`/accounts/${account._id}/edit`}
                          aria-label={`Edit ${account.accountName}`}
                          title="Edit"
                        >
                          <BsPencilSquare size={13} />
                        </Link>
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => handleStatus(account._id, account.status === "ACTIVE" ? "INACTIVE" : "ACTIVE")}
                          aria-label={account.status === "ACTIVE" ? `Deactivate ${account.accountName}` : `Activate ${account.accountName}`}
                          title={account.status === "ACTIVE" ? "Deactivate" : "Activate"}
                        >
                          {account.status === "ACTIVE" ? <BsToggleOn size={13} /> : <BsToggleOff size={13} />}
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(account._id)}
                          aria-label={`Delete ${account.accountName}`}
                          title="Delete"
                        >
                          <BsTrash size={13} />
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

export default AccountListPage;
