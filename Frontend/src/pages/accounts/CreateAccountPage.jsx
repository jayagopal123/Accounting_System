import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { createAccount, getAccountTree } from "../../services/accountApi";

function CreateAccountPage() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [formData, setFormData] = useState({
    companyId: "",
    accountCode: "",
    accountName: "",
    accountType: "ASSET",
    parentAccount: "",
    isGroup: false,
    currency: "INR",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTree = async () => {
      try {
        const response = await getAccountTree();
        const flatten = (items) =>
          items.flatMap((item) => [item, ...(item.children ? flatten(item.children) : [])]);
        setAccounts(flatten(response.data.data));
      } catch {
        setAccounts([]);
      }
    };
    loadTree();
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      setError("");
      await createAccount({
        ...formData,
        parentAccount: formData.parentAccount || null,
      });
      navigate("/accounts");
    } catch (err) {
      setError(String(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="page-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Create Account</h2>
          <Link className="btn btn-outline-secondary" to="/accounts">Back</Link>
        </div>
        {error ? <div className="alert alert-danger">{error}</div> : null}
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Company Id</label>
              <input className="form-control" name="companyId" value={formData.companyId} onChange={handleChange} required />
            </div>
            <div className="col-md-6">
              <label className="form-label">Account Code</label>
              <input className="form-control" name="accountCode" value={formData.accountCode} onChange={handleChange} required />
            </div>
            <div className="col-md-6">
              <label className="form-label">Account Name</label>
              <input className="form-control" name="accountName" value={formData.accountName} onChange={handleChange} required />
            </div>
            <div className="col-md-6">
              <label className="form-label">Account Type</label>
              <select className="form-select" name="accountType" value={formData.accountType} onChange={handleChange}>
                <option value="ASSET">ASSET</option>
                <option value="LIABILITY">LIABILITY</option>
                <option value="EQUITY">EQUITY</option>
                <option value="INCOME">INCOME</option>
                <option value="EXPENSE">EXPENSE</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Parent Account</label>
              <select className="form-select" name="parentAccount" value={formData.parentAccount} onChange={handleChange}>
                <option value="">None</option>
                {accounts.map((account) => (
                  <option key={account._id} value={account._id}>
                    {account.accountCode} - {account.accountName}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Currency</label>
              <input className="form-control" name="currency" value={formData.currency} onChange={handleChange} />
            </div>
            <div className="col-12">
              <label className="form-label">Description</label>
              <textarea className="form-control" rows="3" name="description" value={formData.description} onChange={handleChange} />
            </div>
            <div className="col-12">
              <div className="form-check">
                <input className="form-check-input" type="checkbox" name="isGroup" checked={formData.isGroup} onChange={handleChange} />
                <label className="form-check-label">Group Account</label>
              </div>
            </div>
          </div>
          <div className="mt-4 d-flex gap-2">
            <button className="btn btn-primary" disabled={submitting}>{submitting ? "Saving..." : "Save Account"}</button>
            <Link className="btn btn-outline-secondary" to="/accounts">Cancel</Link>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}

export default CreateAccountPage;
