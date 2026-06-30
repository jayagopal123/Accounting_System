import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { useAuth } from "../../contexts/AuthContext";
import { getTaxGroups } from "../../services/taxGroupApi";
import { BsLayers } from "react-icons/bs";

function TaxGroupListPage() {
  const { hasPermission } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadGroups = async () => {
    try {
      setLoading(true);
      const res = await getTaxGroups();
      setGroups(res.data.data || []);
    } catch (err) {
      const msg = String(err);
      if (!msg.includes("Access denied")) setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroups();
  }, []);

  const totalRate = (taxes) => {
    if (!taxes || taxes.length === 0) return 0;
    return taxes.reduce((sum, t) => sum + (t.taxRate?.rate || 0), 0);
  };

  return (
    <MainLayout>
      <div className="page-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h5 className="page-header-title mb-1">Tax Groups</h5>
            <p className="page-header-subtitle">Combine tax rates into groups (e.g., CGST + SGST = 18%)</p>
          </div>
          {hasPermission("tax_groups:create") && (
            <Link className="btn btn-primary d-flex align-items-center gap-2" to="/tax-groups/new">
              <span>+</span> New Tax Group
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
                <th>Composition</th>
                <th className="text-end">Total Rate</th>
                <th>Status</th>
                {hasPermission("tax_groups:update") && <th className="text-end">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-5">
                  <div className="spinner-border text-secondary" role="status" style={{ width: "1.25rem", height: "1.25rem" }} />
                </td></tr>
              ) : groups.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-5">
                  <div className="d-flex flex-column align-items-center gap-2">
                    <div className="empty-state-icon"><BsLayers size={18} /></div>
                    <div className="fw-semibold text-dark" style={{ fontSize: "0.875rem" }}>No tax groups configured</div>
                    <div className="text-muted small">Create groups like "GST 18%" combining CGST 9% + SGST 9%.</div>
                  </div>
                </td></tr>
              ) : groups.map((g) => (
                <tr key={g._id}>
                  <td className="fw-semibold font-mono">{g.groupCode}</td>
                  <td>{g.groupName}</td>
                  <td>
                    <div className="d-flex flex-wrap gap-1">
                      {(g.taxes || []).map((t, i) => (
                        t.taxRate ? (
                          <span key={i} className="badge-premium badge-premium-submitted" style={{ fontSize: "0.7rem", padding: "0.2rem 0.45rem" }}>
                            {t.taxRate.taxCode} ({t.taxRate.rate}%)
                          </span>
                        ) : null
                      ))}
                    </div>
                  </td>
                  <td className="font-mono fw-semibold text-end">{totalRate(g.taxes)}%</td>
                  <td><span className={`badge-premium ${g.isActive ? "badge-premium-submitted" : "badge-premium-cancelled"}`}>{g.isActive ? "Active" : "Inactive"}</span></td>
                  {hasPermission("tax_groups:update") && (
                    <td className="text-end">
                      <Link className="btn btn-sm btn-outline-secondary" to={`/tax-groups/${g._id}/edit`}>Edit</Link>
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

export default TaxGroupListPage;
