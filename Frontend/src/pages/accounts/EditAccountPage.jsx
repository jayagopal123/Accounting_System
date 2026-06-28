import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { getAccountById, getAccountTree, updateAccount } from "../../services/accountApi";

function EditAccountPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [formData, setFormData] = useState({
    accountCode: "",
    accountName: "",
    accountType: "ASSET",
    parentAccount: "",
    isGroup: false,
    currency: "INR",
    amount: 0,
    description: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [accountResponse, treeResponse] = await Promise.all([getAccountById(id), getAccountTree()]);
        const account = accountResponse.data.data;
        const flatten = (items) => items.flatMap((item) => [item, ...(item.children ? flatten(item.children) : [])]);
        setAccounts(flatten(treeResponse.data.data).filter((item) => item._id !== id));
        setFormData({
      accountCode: account.accountCode || "",
      accountName: account.accountName || "",
      accountType: account.accountType || "ASSET",
      parentAccount: account.parentAccount || "",
      isGroup: Boolean(account.isGroup),
      currency: account.currency || "INR",
      amount: account.amount || 0,
      description: account.description || "",
    });
      } catch (err) {
        setError(String(err));
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  };

  const isParentSelected = Boolean(formData.parentAccount);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        ...formData,
        parentAccount: formData.parentAccount || null,
      };

      if (payload.parentAccount) {
        delete payload.accountType;
      }

      await updateAccount(id, payload);
      navigate("/accounts");
    } catch (err) {
      setError(String(err));
    }
  };

  return (
    <MainLayout>
      <div className="page-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h5 className="page-header-title mb-1">Edit Account</h5>
            <p className="page-header-subtitle">Modify general ledger account details</p>
          </div>
          <Link className="btn btn-outline-secondary" to="/accounts">← Back</Link>
        </div>
        {error ? <div className="alert alert-danger">{error}</div> : null}
        {loading ? (
          <div className="d-flex align-items-center gap-2 py-4">
            <div className="spinner-border spinner-border-sm text-secondary" role="status" />
            <span className="text-muted small">Loading account...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-section-title">Account Details</div>
            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label className="form-label">Account Code</label>
                <input className="form-control font-mono" name="accountCode" value={formData.accountCode} disabled required />
              </div>
              <div className="col-md-6">
                <label className="form-label">Account Name</label>
                <input className="form-control" name="accountName" value={formData.accountName} onChange={handleChange} required />
              </div>
              <div className="col-md-6">
                <label className="form-label">Account Type</label>
                <select
                  className="form-select"
                  name="accountType"
                  value={formData.accountType}
                  onChange={handleChange}
                  disabled={isParentSelected}
                >
                  <option value="ASSET">Asset</option>
                  <option value="LIABILITY">Liability</option>
                  <option value="EQUITY">Equity</option>
                  <option value="INCOME">Income</option>
                  <option value="EXPENSE">Expense</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Parent Account</label>
                <select className="form-select" name="parentAccount" value={formData.parentAccount} onChange={handleChange}>
                  <option value="">None (Top Level)</option>
                  {accounts.map((account) => (
                    <option key={account._id} value={account._id}>{account.accountCode} - {account.accountName}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-section-title">Financial Settings</div>
            <div className="row g-3 mb-4">
              <div className="col-md-3">
                <label className="form-label">Currency</label>
                <select className="form-select" name="currency" value={formData.currency} onChange={handleChange}>
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="AED">AED (د.إ)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  name="amount"
                  value={formData.amount || ""}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Description</label>
                <textarea className="form-control" rows="2" name="description" value={formData.description} onChange={handleChange} />
              </div>
              <div className="col-12">
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" name="isGroup" checked={formData.isGroup} onChange={handleChange} id="isGroup" />
                  <label className="form-check-label" htmlFor="isGroup">Group Account (can have sub-accounts)</label>
                </div>
              </div>
            </div>

            <div className="d-flex gap-2 pt-3 border-top">
              <button className="btn btn-primary">Update Account</button>
              <Link className="btn btn-outline-secondary" to="/accounts">Cancel</Link>
            </div>
          </form>
        )}
      </div>
    </MainLayout>
  );
}

export default EditAccountPage;
