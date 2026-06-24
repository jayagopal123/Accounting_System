import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { getAccounts } from "../../services/accountApi";
import { createJournalEntry } from "../../services/journalEntryApi";

function CreateJournalEntryPage() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0, 10),
    referenceType: "",
    referenceNumber: "",
    remarks: "",
    lineItems: [
      { account: "", debitAmount: 0, creditAmount: 0, description: "" },
      { account: "", debitAmount: 0, creditAmount: 0, description: "" },
    ],
  });

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const response = await getAccounts();
        setAccounts(response.data.data);
      } catch {
        setAccounts([]);
      }
    };
    loadAccounts();
  }, []);

  const totals = useMemo(() => {
    return formData.lineItems.reduce(
      (accumulator, item) => ({
        debit: accumulator.debit + Number(item.debitAmount || 0),
        credit: accumulator.credit + Number(item.creditAmount || 0),
      }),
      { debit: 0, credit: 0 }
    );
  }, [formData.lineItems]);

  const updateLineItem = (index, field, value) => {
    setFormData((current) => ({
      ...current,
      lineItems: current.lineItems.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: field.includes("Amount") ? Number(value) : value } : item
      ),
    }));
  };

  const addLine = () => {
    setFormData((current) => ({
      ...current,
      lineItems: [...current.lineItems, { account: "", debitAmount: 0, creditAmount: 0, description: "" }],
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await createJournalEntry(formData);
      navigate("/journal-entries");
    } catch (err) {
      setError(String(err));
    }
  };

  return (
    <MainLayout>
      <div className="page-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Create Journal Entry</h2>
          <Link className="btn btn-outline-secondary" to="/journal-entries">Back</Link>
        </div>
        {error ? <div className="alert alert-danger">{error}</div> : null}
        <form onSubmit={handleSubmit}>
          <div className="row g-3 mb-4">
            <div className="col-md-4"><label className="form-label">Date</label><input className="form-control" type="date" value={formData.date} onChange={(e) => setFormData((c) => ({ ...c, date: e.target.value }))} /></div>
            <div className="col-md-4"><label className="form-label">Reference Type</label><input className="form-control" value={formData.referenceType} onChange={(e) => setFormData((c) => ({ ...c, referenceType: e.target.value }))} /></div>
            <div className="col-md-4"><label className="form-label">Reference Number</label><input className="form-control" value={formData.referenceNumber} onChange={(e) => setFormData((c) => ({ ...c, referenceNumber: e.target.value }))} /></div>
            <div className="col-12"><label className="form-label">Remarks</label><textarea className="form-control" rows="3" value={formData.remarks} onChange={(e) => setFormData((c) => ({ ...c, remarks: e.target.value }))} /></div>
          </div>
          <div className="form-section-title">Line Items</div>
          {formData.lineItems.map((item, index) => (
            <div className="row g-3 mb-3" key={index}>
              <div className="col-md-4">
                <select className="form-select" value={item.account} onChange={(e) => updateLineItem(index, "account", e.target.value)} required>
                  <option value="">Select account</option>
                  {accounts.map((account) => (
                    <option key={account._id} value={account._id}>{account.accountCode} - {account.accountName}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-2"><input className="form-control" type="number" min="0" step="0.01" placeholder="Debit" value={item.debitAmount} onChange={(e) => updateLineItem(index, "debitAmount", e.target.value)} /></div>
              <div className="col-md-2"><input className="form-control" type="number" min="0" step="0.01" placeholder="Credit" value={item.creditAmount} onChange={(e) => updateLineItem(index, "creditAmount", e.target.value)} /></div>
              <div className="col-md-4"><input className="form-control" placeholder="Description" value={item.description} onChange={(e) => updateLineItem(index, "description", e.target.value)} /></div>
            </div>
          ))}
          <div className="d-flex justify-content-between align-items-center mt-3">
            <button type="button" className="btn btn-outline-primary" onClick={addLine}>+ Add Line</button>
            <div className="text-end">
              <div>Total Debit: {totals.debit.toFixed(2)}</div>
              <div>Total Credit: {totals.credit.toFixed(2)}</div>
            </div>
          </div>
          <div className="mt-4 d-flex gap-2">
            <button className="btn btn-primary">Save Journal Entry</button>
            <Link className="btn btn-outline-secondary" to="/journal-entries">Cancel</Link>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}

export default CreateJournalEntryPage;
