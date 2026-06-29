import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { useAuth } from "../../contexts/AuthContext";
import { cancelJournalEntry, getJournalEntries, submitJournalEntry } from "../../services/journalEntryApi";
import { BsFileText, BsCheckLg, BsXLg } from "react-icons/bs";

function JournalEntryListPage() {
  const { hasPermission } = useAuth();
  const canCreate = hasPermission("journal_entries:create");
  const canSubmit = hasPermission("journal_entries:submit");
  const canCancel = hasPermission("journal_entries:cancel");

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
      const msg = String(err);
      if (!msg.includes("Access denied")) setError(msg);
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

  const colSpan = 6 + (canSubmit || canCancel ? 1 : 0);

  return (
    <MainLayout>
      <div className="page-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h5 className="page-header-title mb-1">Journal Entries</h5>
            <p className="page-header-subtitle">Record and manage general journal vouchers</p>
          </div>
          {canCreate && (
            <Link className="btn btn-primary d-flex align-items-center gap-2" to="/journal-entries/new">
              <span>+</span> New Entry
            </Link>
          )}
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
          <table className="table table-premium align-middle">
            <thead>
              <tr>
                <th>Voucher</th>
                <th>Date</th>
                <th>Remarks</th>
                <th className="text-end">Total Debit</th>
                <th className="text-end">Total Credit</th>
                <th>Status</th>
                {canSubmit || canCancel ? <th className="text-end">Actions</th> : null}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={colSpan} className="text-center py-5">
                  <div className="d-flex flex-column align-items-center gap-2">
                    <div className="spinner-border text-secondary" role="status" style={{ width: "1.25rem", height: "1.25rem" }} />
                    <span className="text-muted small">Loading journal entries...</span>
                  </div>
                </td></tr>
              ) : filteredEntries.length === 0 ? (
                <tr><td colSpan={colSpan} className="text-center py-5">
                  <div className="d-flex flex-column align-items-center gap-2">
                    <div className="empty-state-icon"><BsFileText size={18} /></div>
                    <div className="fw-semibold text-dark" style={{ fontSize: "0.875rem" }}>No journal entries found</div>
                    <div className="text-muted small">Create a new journal entry to get started.</div>
                  </div>
                </td></tr>
              ) : filteredEntries.map((entry) => (
                <tr key={entry._id}>
                  <td className="fw-semibold font-mono">{entry.voucherNumber}</td>
                  <td className="text-muted">{new Date(entry.date).toLocaleDateString()}</td>
                  <td className="text-muted" style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.remarks || "—"}</td>
                  <td className="font-mono fw-semibold text-end">{Number(entry.totalDebit).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="font-mono fw-semibold text-end">{Number(entry.totalCredit).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td><span className={`badge-premium ${entry.status === "Draft" ? "badge-premium-draft" : entry.status === "Submitted" ? "badge-premium-submitted" : "badge-premium-cancelled"}`}>{entry.status}</span></td>
                  {canSubmit || canCancel ? (
                    <td className="text-end">
                      <div className="d-flex gap-1 justify-content-end">
                        {canSubmit && entry.status === "Draft" ? (
                          <button className="btn btn-sm btn-outline-success" onClick={() => handleAction(() => submitJournalEntry(entry._id))} title="Submit">
                            <BsCheckLg size={13} />
                          </button>
                        ) : null}
                        {canCancel && entry.status !== "Cancelled" ? (
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleAction(() => cancelJournalEntry(entry._id))} title="Cancel">
                            <BsXLg size={13} />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  ) : null}
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
