import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { getCustomerById, updateCustomer } from "../../services/customerApi";

function EditCustomerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCustomer = async () => {
      try {
        const response = await getCustomerById(id);
        const customer = response.data.data;
        setFormData({
          ...customer,
          addresses: customer.addresses?.length ? customer.addresses : [{ addressType: "Billing" }],
          contacts: customer.contacts?.length ? customer.contacts : [{}],
        });
      } catch (err) {
        setError(String(err));
      }
    };
    loadCustomer();
  }, [id]);

  const updateField = (name, value) => setFormData((current) => ({ ...current, [name]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await updateCustomer(id, formData);
      navigate("/customers");
    } catch (err) {
      setError(String(err));
    }
  };

  return (
    <MainLayout>
      <div className="page-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Edit Customer</h2>
          <Link className="btn btn-outline-secondary" to="/customers">Back</Link>
        </div>
        {error ? <div className="alert alert-danger">{error}</div> : null}
        {!formData ? (
          <div>Loading customer...</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6"><label className="form-label">Customer Code</label><input className="form-control" value={formData.customerCode || ""} onChange={(e) => updateField("customerCode", e.target.value)} /></div>
              <div className="col-md-6"><label className="form-label">Customer Name</label><input className="form-control" value={formData.customerName || ""} onChange={(e) => updateField("customerName", e.target.value)} /></div>
              <div className="col-md-6"><label className="form-label">Company</label><input className="form-control" value={formData.company || ""} onChange={(e) => updateField("company", e.target.value)} /></div>
              <div className="col-md-6"><label className="form-label">Currency</label><input className="form-control" value={formData.defaultCurrency || ""} onChange={(e) => updateField("defaultCurrency", e.target.value)} /></div>
              <div className="col-12"><label className="form-label">Remarks</label><textarea className="form-control" rows="3" value={formData.remarks || ""} onChange={(e) => updateField("remarks", e.target.value)} /></div>
            </div>
            <div className="mt-4 d-flex gap-2">
              <button className="btn btn-primary">Update Customer</button>
              <Link className="btn btn-outline-secondary" to="/customers">Cancel</Link>
            </div>
          </form>
        )}
      </div>
    </MainLayout>
  );
}

export default EditCustomerPage;
