import MainLayout from "../../layouts/MainLayout";
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { deleteAccount, getAccounts, updateStatus } from "../../services/accountApi";

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
              placeholder="Search account..."
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
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-center py-4">Loading accounts...</td></tr>
              ) : filteredAccounts.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-4">No accounts found.</td></tr>
              ) : (
                filteredAccounts.map((account) => (
                  <tr key={account._id}>
                    <td>{account.accountCode}</td>
                    <td>{account.accountName}</td>
                    <td>{account.accountType}</td>
                    <td>{account.currency}</td>
                    <td>
                      <span className={`badge ${account.status === "ACTIVE" ? "bg-success" : "bg-secondary"}`}>
                        {account.status}
                      </span>
                    </td>
                    <td className="text-end">
                      <Link className="btn btn-sm btn-outline-warning me-2" to={`/accounts/${account._id}/edit`}>
                        Edit
                      </Link>
                      <button
                        className="btn btn-sm btn-outline-secondary me-2"
                        onClick={() => handleStatus(account._id, account.status === "ACTIVE" ? "INACTIVE" : "ACTIVE")}
                      >
                        {account.status === "ACTIVE" ? "Deactivate" : "Activate"}
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(account._id)}>
                        Delete
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
