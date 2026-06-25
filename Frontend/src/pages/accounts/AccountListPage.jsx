import MainLayout from "../../layouts/MainLayout";
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { deleteAccount, getAccounts, updateStatus } from "../../services/accountApi";
import { BsPencilSquare, BsToggleOff, BsToggleOn, BsTrash } from "react-icons/bs";

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
          <h2>Chart Of Accounts</h2>
          <Link className="btn btn-primary" to="/accounts/new">+ New Account</Link>
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
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Code</th>
                <th>Account Name</th>
                <th>Type</th>
                <th>Currency</th>
                <th>Amount</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-5">
                    <div className="d-flex flex-column align-items-center gap-2">
                      <div className="spinner-border text-primary" role="status" aria-hidden="true" />
                      <span className="text-muted">Loading accounts...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-5">
                    <div className="d-flex flex-column align-items-center gap-2">
                      <div className="fs-4">No accounts found</div>
                      <div className="text-muted">Try adjusting the search or create a new account.</div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((account) => (
                  <tr key={account._id}>
                    <td>{account.accountCode}</td>
                    <td>{account.accountName}</td>
                    <td>{account.accountType}</td>
                    <td>{account.currency}</td>
                    <td>{account.amount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}</td>
                    <td>
                      <span className={`badge rounded-pill px-3 py-2 ${account.status === "ACTIVE" ? "bg-success-subtle text-success" : "bg-secondary-subtle text-secondary"}`}>
                        {account.status}
                      </span>
                    </td>
                    <td className="text-end">
                      <Link
                        className="btn btn-sm btn-outline-warning rounded-circle me-2"
                        to={`/accounts/${account._id}/edit`}
                        aria-label={`Edit ${account.accountName}`}
                        title="Edit"
                      >
                        <BsPencilSquare />
                      </Link>
                      <button
                        className="btn btn-sm btn-outline-secondary rounded-circle me-2"
                        onClick={() => handleStatus(account._id, account.status === "ACTIVE" ? "INACTIVE" : "ACTIVE")}
                        aria-label={account.status === "ACTIVE" ? `Deactivate ${account.accountName}` : `Activate ${account.accountName}`}
                        title={account.status === "ACTIVE" ? "Deactivate" : "Activate"}
                      >
                        {account.status === "ACTIVE" ? <BsToggleOn /> : <BsToggleOff />}
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger rounded-circle"
                        onClick={() => handleDelete(account._id)}
                        aria-label={`Delete ${account.accountName}`}
                        title="Delete"
                      >
                        <BsTrash />
                      </button>
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
