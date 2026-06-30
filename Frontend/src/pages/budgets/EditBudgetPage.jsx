import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { getBudgetById, updateBudget } from "../../services/budgetApi";
import { getFiscalYears } from "../../services/fiscalYearApi";
import { getCostCenters } from "../../services/costCenterApi";
import { getAccounts } from "../../services/accountApi";
import { BsPlusLg, BsTrash } from "react-icons/bs";

function EditBudgetPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [fiscalYears, setFiscalYears] = useState([]);
  const [costCenters, setCostCenters] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    fiscalYear: "",
    costCenter: "",
    description: "",
  });
  const [lineItems, setLineItems] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [budgetRes, fyRes, ccRes, acctRes] = await Promise.all([
          getBudgetById(id),
          getFiscalYears(),
          getCostCenters(),
          getAccounts(),
        ]);

        const budget = budgetRes.data.data;
        setFormData({
          name: budget.name,
          fiscalYear: budget.fiscalYear?._id || "",
          costCenter: budget.costCenter?._id || "",
          description: budget.description || "",
        });
        setLineItems(
          (budget.lineItems || []).map((li) => ({
            account: li.account?._id || "",
            amount: li.amount,
            notes: li.notes || "",
          })),
        );

        setFiscalYears(fyRes.data.data || []);
        setCostCenters(ccRes.data.data || []);
        setAccounts(acctRes.data.data || []);
      } catch (err) {
        setError(String(err));
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLineChange = (index, field, value) => {
    setLineItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  const addLine = () => {
    setLineItems((prev) => [...prev, { account: "", amount: "", notes: "" }]);
  };

  const removeLine = (index) => {
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  const totalAmount = lineItems.reduce(
    (sum, item) => sum + (parseFloat(item.amount) || 0),
    0,
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError("");

      const validLines = lineItems.filter((l) => l.account && l.amount);
      if (validLines.length === 0) {
        throw new Error("Add at least one budget line item.");
      }

      await updateBudget(id, {
        ...formData,
        costCenter: formData.costCenter || null,
        lineItems: validLines.map((l) => ({
          account: l.account,
          amount: parseFloat(l.amount),
          notes: l.notes || "",
        })),
      });
      navigate("/budgets");
    } catch (err) {
      setError(err?.message || String(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="text-center py-5">
          <div className="spinner-border text-secondary" role="status" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="page-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h5 className="page-header-title mb-1">Edit Budget</h5>
            <p className="page-header-subtitle">Update budget allocations</p>
          </div>
        </div>

        {error ? <div className="alert alert-danger">{error}</div> : null}

        <form onSubmit={handleSubmit}>
          <div className="form-section-title">Budget Information</div>
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <label className="form-label">Budget Name</label>
              <input className="form-control" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="col-md-4">
              <label className="form-label">Fiscal Year</label>
              <select className="form-select" name="fiscalYear" value={formData.fiscalYear} onChange={handleChange} required>
                <option value="">Select Fiscal Year</option>
                {fiscalYears.map((fy) => (
                  <option key={fy._id} value={fy._id}>{fy.yearName}</option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Cost Center</label>
              <select className="form-select" name="costCenter" value={formData.costCenter} onChange={handleChange}>
                <option value="">None (Global)</option>
                {costCenters.map((cc) => (
                  <option key={cc._id} value={cc._id}>{cc.name}</option>
                ))}
              </select>
            </div>
            <div className="col-12">
              <label className="form-label">Description</label>
              <textarea className="form-control" rows="2" name="description" value={formData.description} onChange={handleChange} />
            </div>
          </div>

          <div className="form-section-title">Budget Lines</div>
          <div className="table-responsive mb-3">
            <table className="table table-premium align-middle">
              <thead>
                <tr>
                  <th style={{ width: "40%" }}>Account</th>
                  <th style={{ width: "25%" }}>Amount</th>
                  <th style={{ width: "30%" }}>Notes</th>
                  <th style={{ width: "5%" }}></th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <select className="form-select form-select-sm" value={item.account} onChange={(e) => handleLineChange(index, "account", e.target.value)} required>
                        <option value="">Select Account</option>
                        {accounts.map((a) => (
                          <option key={a._id} value={a._id}>{a.accountCode} - {a.accountName}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input type="number" step="0.01" min="0" className="form-control form-control-sm font-mono" value={item.amount} onChange={(e) => handleLineChange(index, "amount", e.target.value)} required placeholder="0.00" />
                    </td>
                    <td>
                      <input className="form-control form-control-sm" value={item.notes} onChange={(e) => handleLineChange(index, "notes", e.target.value)} placeholder="Optional" />
                    </td>
                    <td>
                      {lineItems.length > 1 && (
                        <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeLine(index)}>
                          <BsTrash size={12} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button type="button" className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1 mb-3" onClick={addLine}>
            <BsPlusLg size={10} /> Add Line
          </button>

          <div className="bg-light rounded p-3 mb-4 border d-flex justify-content-between align-items-center">
            <span className="fw-semibold text-dark">Total Budget Amount</span>
            <span className="font-mono fw-bold" style={{ fontSize: "1.1rem", color: "#0f172a" }}>
              {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="d-flex gap-2 pt-3 border-top">
            <button className="btn btn-primary" disabled={submitting}>
              {submitting ? <><span className="spinner-border spinner-border-sm me-2" role="status"></span>Saving...</> : "Update Budget"}
            </button>
            <button type="button" className="btn btn-outline-secondary" onClick={() => navigate("/budgets")}>Cancel</button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}

export default EditBudgetPage;
