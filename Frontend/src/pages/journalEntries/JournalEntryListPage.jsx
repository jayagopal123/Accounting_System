import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { cancelJournalEntry, getJournalEntries, submitJournalEntry } from "../../services/journalEntryApi";

function JournalEntryListPage() {
  const [entries, setEntries] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadEntries = async () => {
    try {
      setLoading(true);
      const response = await getJournalEntries();
      setEntries(response.data.data);
      setError("");
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEntries();
  }, []);

  const filteredEntries = useMemo(
    () => entries.filter((entry) => (statusFilter ? entry.status === statusFilter : true)),
    [entries, statusFilter]
  );

  const handleAction = async (action) => {
    try {
      await action();
      await loadEntries();
    } catch (err) {
      setError(String(err));
    }
  };

  return (
    <MainLayout>
      <div className="page-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Journal Entries</h2>
          <Link className="btn btn-primary" to="/journal-entries/new">+ New Journal Entry</Link>
        </div>
        {error ? <div className="alert alert-danger">{error}</div> : null}
        <div className="row g-3 mb-3">
          <div className="col-md-3">
            <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Submitted">Submitted</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Voucher</th>
                <th>Date</th>
                <th>Remarks</th>
                <th>Total Debit</th>
                <th>Total Credit</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="text-center py-4">Loading journal entries...</td></tr>
              ) : filteredEntries.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-4">No journal entries found.</td></tr>
              ) : filteredEntries.map((entry) => (
                <tr key={entry._id}>
                  <td>{entry.voucherNumber}</td>
                  <td>{new Date(entry.date).toLocaleDateString()}</td>
                  <td>{entry.remarks || "-"}</td>
                  <td>{entry.totalDebit}</td>
                  <td>{entry.totalCredit}</td>
                  <td><span className="badge bg-info">{entry.status}</span></td>
                  <td className="text-end">
                    {entry.status === "Draft" ? (
                      <button className="btn btn-sm btn-outline-success me-2" onClick={() => handleAction(() => submitJournalEntry(entry._id))}>Submit</button>
                    ) : null}
                    {entry.status !== "Cancelled" ? (
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleAction(() => cancelJournalEntry(entry._id))}>Cancel</button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
}

export default JournalEntryListPage;
