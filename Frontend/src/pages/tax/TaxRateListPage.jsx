import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { useAuth } from "../../contexts/AuthContext";
import { getTaxRates } from "../../services/taxRateApi";
import { BsPercent } from "react-icons/bs";

const taxTypeBadge = {
  CGST: "badge-premium-submitted",
  SGST: "badge-premium-submitted",
  IGST: "badge-premium-draft",
  CESS: "badge-premium-cancelled",
  OTHER: "badge-premium-draft",
};

function TaxRateListPage() {
  const { hasPermission } = useAuth();
  const [taxRates, setTaxRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTaxRates = async () => {
    try {
      setLoading(true);
      const res = await getTaxRates();
      setTaxRates(res.data.data || []);
    } catch (err) {
      const msg = String(err);
      if (!msg.includes("Access denied")) setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTaxRates();
  }, []);

  return (
    <MainLayout>
      <div className="page-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h5 className="page-header-title mb-1">Tax Rates</h5>
            <p className="page-header-subtitle">Configure GST and other tax rates</p>
          </div>
          {hasPermission("tax_rates:create") && (
            <Link className="btn btn-primary d-flex align-items-center gap-2" to="/tax-rates/new">
              <span>+</span> New Tax Rate
            </Link>
          )}
        </div>
        {error ? <div className="alert alert-danger">{error}</div> : null}
        <div className="table-responsive">
          <table className="table table-premium align-middle">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Type</th>
                <th className="text-end">Rate (%)</th>
                <th>Effective From</th>
                <th>Status</th>
                {hasPermission("tax_rates:update") && <th className="text-end">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-5">
                  <div className="spinner-border text-secondary" role="status" style={{ width: "1.25rem", height: "1.25rem" }} />
                </td></tr>
              ) : taxRates.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-5">
                  <div className="d-flex flex-column align-items-center gap-2">
                    <div className="empty-state-icon"><BsPercent size={18} /></div>
                    <div className="fw-semibold text-dark" style={{ fontSize: "0.875rem" }}>No tax rates configured</div>
                    <div className="text-muted small">Create tax rates like CGST 9%, SGST 9%, IGST 18%.</div>
                  </div>
                </td></tr>
              ) : taxRates.map((tr) => (
                <tr key={tr._id}>
                  <td className="fw-semibold font-mono">{tr.taxCode}</td>
                  <td>{tr.taxName}</td>
                  <td><span className={`badge-premium ${taxTypeBadge[tr.taxType] || "badge-premium-draft"}`}>{tr.taxType}</span></td>
                  <td className="font-mono fw-semibold text-end">{tr.rate}%</td>
                  <td className="text-muted small">{new Date(tr.effectiveFrom).toLocaleDateString()}</td>
                  <td><span className={`badge-premium ${tr.isActive ? "badge-premium-submitted" : "badge-premium-cancelled"}`}>{tr.isActive ? "Active" : "Inactive"}</span></td>
                  {hasPermission("tax_rates:update") && (
                    <td className="text-end">
                      <Link className="btn btn-sm btn-outline-secondary" to={`/tax-rates/${tr._id}/edit`}>Edit</Link>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
}

export default TaxRateListPage;
