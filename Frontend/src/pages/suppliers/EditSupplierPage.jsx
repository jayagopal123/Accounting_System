import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { getSupplierById, updateSupplier } from "../../services/supplierApi";

function EditSupplierPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSupplier = async () => {
      try {
        const response = await getSupplierById(id);
        const supplier = response.data.data;
        setFormData({
          ...supplier,
          addresses: supplier.addresses?.length ? supplier.addresses : [{ addressType: "Billing" }],
          contacts: supplier.contacts?.length ? supplier.contacts : [{}],
        });
      } catch (err) {
        setError(String(err));
      }
    };
    loadSupplier();
  }, [id]);

  const updateField = (name, value) => setFormData((current) => ({ ...current, [name]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await updateSupplier(id, formData);
      navigate("/suppliers");
    } catch (err) {
      setError(String(err));
    }
  };

  return (
    <MainLayout>
      <div className="page-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Edit Supplier</h2>
          <Link className="btn btn-outline-secondary" to="/suppliers">Back</Link>
        </div>
        {error ? <div className="alert alert-danger">{error}</div> : null}
        {!formData ? (
          <div>Loading supplier...</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6"><label className="form-label">Supplier Code</label><input className="form-control" value={formData.supplierCode || ""} onChange={(e) => updateField("supplierCode", e.target.value)} /></div>
              <div className="col-md-6"><label className="form-label">Supplier Name</label><input className="form-control" value={formData.supplierName || ""} onChange={(e) => updateField("supplierName", e.target.value)} /></div>
              <div className="col-md-6"><label className="form-label">Company</label><input className="form-control" value={formData.company || ""} onChange={(e) => updateField("company", e.target.value)} /></div>
              <div className="col-md-6"><label className="form-label">Currency</label><input className="form-control" value={formData.defaultCurrency || ""} onChange={(e) => updateField("defaultCurrency", e.target.value)} /></div>
              <div className="col-12"><label className="form-label">Remarks</label><textarea className="form-control" rows="3" value={formData.remarks || ""} onChange={(e) => updateField("remarks", e.target.value)} /></div>
            </div>
            <div className="mt-4 d-flex gap-2">
              <button className="btn btn-primary">Update Supplier</button>
              <Link className="btn btn-outline-secondary" to="/suppliers">Cancel</Link>
            </div>
          </form>
        )}
      </div>
    </MainLayout>
  );
}

export default EditSupplierPage;
