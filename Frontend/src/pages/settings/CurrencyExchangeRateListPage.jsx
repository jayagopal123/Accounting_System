import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { getExchangeRates } from "../../services/currencyExchangeRateApi";
import { BsCurrencyExchange, BsPencilSquare } from "react-icons/bs";

function CurrencyExchangeRateListPage() {
  const navigate = useNavigate();
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRates = async () => {
    try {
      setLoading(true);
      const response = await getExchangeRates();
      setRates(response.data.data || []);
      setError("");
    } catch (err) {
      const msg = String(err);
      if (!msg.includes("Access denied")) setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRates();
  }, []);

  return (
    <MainLayout>
      <div className="page-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h5 className="page-header-title mb-1">Currency Exchange Rates</h5>
            <p className="page-header-subtitle">Manage cross-currency conversion rates</p>
          </div>
          <Link className="btn btn-primary d-flex align-items-center gap-2" to="/settings/exchange-rates/new">
            <span>+</span> New Rate
          </Link>
        </div>

        {error ? <div className="alert alert-danger py-2" style={{ fontSize: "0.8rem" }}>{error}</div> : null}

        <div className="table-responsive">
          <table className="table table-premium align-middle">
            <thead>
              <tr>
                <th>From</th>
                <th>To</th>
                <th>Rate</th>
                <th>Effective Date</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-5">
                    <div className="d-flex flex-column align-items-center gap-2">
                      <div className="spinner-border text-secondary" role="status" style={{ width: "1.25rem", height: "1.25rem" }} />
                      <span className="text-muted small">Loading exchange rates...</span>
                    </div>
                  </td>
                </tr>
              ) : rates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-5">
                    <div className="d-flex flex-column align-items-center gap-2">
                      <div className="empty-state-icon"><BsCurrencyExchange size={18} /></div>
                      <div className="fw-semibold text-dark" style={{ fontSize: "0.875rem" }}>No exchange rates found</div>
                      <div className="text-muted small">Add an exchange rate to get started.</div>
                    </div>
                  </td>
                </tr>
              ) : (
                rates.map((r) => (
                  <tr key={r._id}>
                    <td className="fw-semibold font-mono">{r.fromCurrency}</td>
                    <td className="fw-semibold font-mono">{r.toCurrency}</td>
                    <td className="font-mono fw-bold">{r.rate}</td>
                    <td className="text-muted font-mono">{new Date(r.effectiveDate).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge-premium ${r.isActive ? "badge-premium-active" : "badge-premium-blocked"}`}>
                        {r.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => navigate(`/settings/exchange-rates/${r._id}/edit`)}
                        title="Edit"
                      >
                        <BsPencilSquare size={13} />
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

export default CurrencyExchangeRateListPage;
