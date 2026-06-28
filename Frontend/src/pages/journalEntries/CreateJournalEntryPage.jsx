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
          <div>
            <h5 className="page-header-title mb-1">Create Journal Entry</h5>
            <p className="page-header-subtitle">Record a general journal voucher</p>
          </div>
          <Link className="btn btn-outline-secondary" to="/journal-entries">← Back</Link>
        </div>
        {error ? <div className="alert alert-danger">{error}</div> : null}
        <form onSubmit={handleSubmit}>
          <div className="form-section-title">Voucher Details</div>
          <div className="row g-3 mb-4">
            <div className="col-md-3"><label className="form-label">Date</label><input className="form-control" type="date" value={formData.date} onChange={(e) => setFormData((c) => ({ ...c, date: e.target.value }))} /></div>
            <div className="col-md-4"><label className="form-label">Reference Type</label>
              <select className="form-select" value={formData.referenceType} onChange={(e) => setFormData((c) => ({ ...c, referenceType: e.target.value }))}>
                <option value="">Select type</option>
                <option value="Sales">Sales</option>
                <option value="Purchase">Purchase</option>
                <option value="Payment">Payment</option>
                <option value="Receipt">Receipt</option>
                <option value="Contra">Contra</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="col-md-5"><label className="form-label">Reference Number</label><input className="form-control" value={formData.referenceNumber} onChange={(e) => setFormData((c) => ({ ...c, referenceNumber: e.target.value }))} placeholder="e.g. INV-001" /></div>
            <div className="col-12"><label className="form-label">Remarks</label><textarea className="form-control" rows="2" value={formData.remarks} onChange={(e) => setFormData((c) => ({ ...c, remarks: e.target.value }))} placeholder="Brief description of the entry..." /></div>
          </div>

          <div className="form-section-title">Accounting Line Items</div>
          <div className="table-responsive border-0 mb-3">
            <table className="table table-premium align-middle mb-0">
              <thead>
                <tr>
                  <th style={{width: '35%'}}>Account</th>
                  <th style={{width: '15%'}} className="text-end">Debit</th>
                  <th style={{width: '15%'}} className="text-end">Credit</th>
                  <th style={{width: '35%'}}>Description</th>
                </tr>
              </thead>
              <tbody>
                {formData.lineItems.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <select className="form-select form-select-sm" value={item.account} onChange={(e) => updateLineItem(index, "account", e.target.value)} required>
                        <option value="">Select account</option>
                        {accounts.map((account) => (
                          <option key={account._id} value={account._id}>{account.accountCode} - {account.accountName}</option>
                        ))}
                      </select>
                    </td>
                    <td><input className="form-control form-control-sm text-end font-mono" type="number" min="0" step="0.01" placeholder="0.00" value={item.debitAmount} onChange={(e) => updateLineItem(index, "debitAmount", e.target.value)} /></td>
                    <td><input className="form-control form-control-sm text-end font-mono" type="number" min="0" step="0.01" placeholder="0.00" value={item.creditAmount} onChange={(e) => updateLineItem(index, "creditAmount", e.target.value)} /></td>
                    <td><input className="form-control form-control-sm" placeholder="Description" value={item.description} onChange={(e) => updateLineItem(index, "description", e.target.value)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="d-flex justify-content-between align-items-center mt-2 mb-4">
            <div className="d-flex gap-2">
              <button type="button" className="btn btn-sm btn-outline-primary" onClick={addLine}>+ Add Line</button>
              {formData.lineItems.length > 2 && (
                <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => setFormData((c) => ({ ...c, lineItems: c.lineItems.slice(0, -1) }))}>Remove Last</button>
              )}
            </div>
            <div className="text-end">
              <div className="summary-row">
                <span className="summary-label">Total Debit</span>
                <span className="summary-value">{totals.debit.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Total Credit</span>
                <span className="summary-value">{totals.credit.toFixed(2)}</span>
              </div>
              <div className={`summary-row total ${Math.abs(totals.debit - totals.credit) < 0.01 ? '' : 'text-danger'}`}>
                <span className="summary-label">Difference</span>
                <span className="summary-value" style={{color: Math.abs(totals.debit - totals.credit) < 0.01 ? '#059669' : '#dc2626'}}>
                  {Math.abs(totals.debit - totals.credit).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="d-flex gap-2 pt-3 border-top">
            <button className="btn btn-primary">Save Journal Entry</button>
            <Link className="btn btn-outline-secondary" to="/journal-entries">Cancel</Link>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}

export default CreateJournalEntryPage;
