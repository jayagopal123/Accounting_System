import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { getExchangeRateById, updateExchangeRate } from "../../services/currencyExchangeRateApi";

const CURRENCIES = ["INR", "USD", "EUR", "GBP", "AED", "JPY", "CNY", "AUD", "CAD", "SGD"];

function EditCurrencyExchangeRatePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fromCurrency: "USD",
    toCurrency: "INR",
    rate: "",
    effectiveDate: "",
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getExchangeRateById(id);
        const r = response.data.data;
        setFormData({
          fromCurrency: r.fromCurrency,
          toCurrency: r.toCurrency,
          rate: r.rate,
          effectiveDate: r.effectiveDate ? r.effectiveDate.slice(0, 10) : "",
          isActive: r.isActive,
        });
      } catch (err) {
        setError(String(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError("");
      await updateExchangeRate(id, {
        ...formData,
        rate: parseFloat(formData.rate),
        effectiveDate: new Date(formData.effectiveDate),
      });
      navigate("/settings/exchange-rates");
    } catch (err) {
      setError(String(err));
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
            <h5 className="page-header-title mb-1">Edit Exchange Rate</h5>
            <p className="page-header-subtitle">Update currency conversion rate</p>
          </div>
          <Link className="btn btn-outline-secondary" to="/settings/exchange-rates">← Back</Link>
        </div>

        {error ? <div className="alert alert-danger">{error}</div> : null}

        <form onSubmit={handleSubmit}>
          <div className="form-section-title">Rate Details</div>
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <label className="form-label">From Currency</label>
              <select className="form-select font-mono" name="fromCurrency" value={formData.fromCurrency} onChange={handleChange} required>
                {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">To Currency</label>
              <select className="form-select font-mono" name="toCurrency" value={formData.toCurrency} onChange={handleChange} required>
                {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Exchange Rate</label>
              <input type="number" step="0.0001" min="0.0001" className="form-control font-mono" name="rate" value={formData.rate} onChange={handleChange} required />
            </div>
            <div className="col-md-4">
              <label className="form-label">Effective Date</label>
              <input type="date" className="form-control" name="effectiveDate" value={formData.effectiveDate} onChange={handleChange} required />
            </div>
            <div className="col-md-4 d-flex align-items-end">
              <div className="form-check">
                <input className="form-check-input" type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} id="isActive" />
                <label className="form-check-label" htmlFor="isActive">Active</label>
              </div>
            </div>
          </div>

          <div className="d-flex gap-2 pt-3 border-top">
            <button className="btn btn-primary" disabled={submitting}>
              {submitting ? <><span className="spinner-border spinner-border-sm me-2" role="status"></span>Saving...</> : "Update Rate"}
            </button>
            <Link className="btn btn-outline-secondary" to="/settings/exchange-rates">Cancel</Link>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}

export default EditCurrencyExchangeRatePage;
