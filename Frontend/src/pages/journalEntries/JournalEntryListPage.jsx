import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { useAuth } from "../../contexts/AuthContext";
import { cancelJournalEntry, getJournalEntries, submitJournalEntry } from "../../services/journalEntryApi";
import { BsFileText, BsCheckLg, BsXLg, BsPencilSquare } from "react-icons/bs";

function JournalEntryListPage() {
  const { hasPermission } = useAuth();
  const canCreate = hasPermission("journal_entries:create");
  const canSubmit = hasPermission("journal_entries:submit");
  const canCancel = hasPermission("journal_entries:cancel");

  const [entries, setEntries] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
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

  const filteredEntries = useMemo(() => {
    let result = entries;
    if (statusFilter) {
      result = result.filter((entry) => entry.status === statusFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (entry) =>
          entry.voucherNumber?.toLowerCase().includes(q) ||
          entry.remarks?.toLowerCase().includes(q) ||
          entry.referenceNumber?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [entries, statusFilter, search]);

  const paginatedEntries = useMemo(() => {
    const itemsPerPage = 10;
    const start = (page - 1) * itemsPerPage;
    return filteredEntries.slice(start, start + itemsPerPage);
  }, [filteredEntries, page]);

  useEffect(() => {
    const itemsPerPage = 10;
    setTotalPages(Math.max(1, Math.ceil(filteredEntries.length / itemsPerPage)));
    setPage(1);
  }, [filteredEntries]);

  const handleAction = async (action) => {
    try {
      await action();
      await loadEntries();
    } catch (err) {
      setError(String(err));
    }
  };

  const canEdit = hasPermission("journal_entries:update");
  const hasActions = canEdit || canSubmit || canCancel;
  const colSpan = 6 + (hasActions ? 1 : 0);

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
          <div className="col-md-4">
            <input className="form-control" placeholder="Search by voucher number or remarks..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
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
                {hasActions ? <th className="text-end">Actions</th> : null}
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
              ) : paginatedEntries.map((entry) => (
                <tr key={entry._id}>
                  <td className="fw-semibold font-mono">{entry.voucherNumber}</td>
                  <td className="text-muted">{new Date(entry.date).toLocaleDateString()}</td>
                  <td className="text-muted" style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.remarks || "—"}</td>
                  <td className="font-mono fw-semibold text-end">{Number(entry.totalDebit).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="font-mono fw-semibold text-end">{Number(entry.totalCredit).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td><span className={`badge-premium ${entry.status === "Draft" ? "badge-premium-draft" : entry.status === "Submitted" ? "badge-premium-submitted" : "badge-premium-cancelled"}`}>{entry.status}</span></td>
                  {hasActions ? (
                    <td className="text-end">
                      <div className="d-flex gap-1 justify-content-end">
                        {entry.status === "Draft" && canEdit && (
                          <Link className="btn btn-sm btn-outline-secondary" to={`/journal-entries/${entry._id}/edit`} title="Edit">
                            <BsPencilSquare size={13} />
                          </Link>
                        )}
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
        <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
          <button className="btn btn-sm btn-outline-secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
          <span className="text-muted small font-mono">Page {page} of {totalPages}</span>
          <button className="btn btn-sm btn-outline-secondary" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
        </div>
      </div>
    </MainLayout>
  );
}

export default JournalEntryListPage;
