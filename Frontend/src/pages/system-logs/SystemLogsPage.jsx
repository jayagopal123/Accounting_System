import MainLayout from "../../layouts/MainLayout";
import { useEffect, useState } from "react";
import { getSystemLogs } from "../../services/systemLogsApi";
import { FaShieldAlt, FaSearch, FaExclamationTriangle, FaUserLock, FaKey, FaUserCog, FaDatabase, FaHistory } from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";

function SystemLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const loadLogs = async (p = 1, q = "") => {
    try {
      setLoading(true);
      const response = await getSystemLogs(p, 20, q);
      const data = response.data.data;
      setLogs(data.data || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
      setPage(data.page || 1);
      setError(null);
    } catch (err) {
      setError(err || "Failed to load system logs.");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs(1, search);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    loadLogs(1, searchInput);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    loadLogs(newPage, search);
  };

  const getCategoryIcon = (action) => {
    switch (action) {
      case "LOGIN_SUCCESS":
      case "LOGIN_FAILED":
        return <FaUserLock size={12} />;
      case "ROLE_CHANGE":
      case "PERMISSION_UPDATE":
        return <FaUserCog size={12} />;
      case "PASSWORD_CHANGE":
        return <FaKey size={12} />;
      case "BACKUP":
      case "AUDIT_LOG":
        return <FaDatabase size={12} />;
      default:
        return <FaShieldAlt size={12} />;
    }
  };

  const getCategoryColor = (action) => {
    switch (action) {
      case "LOGIN_FAILED":
        return "danger";
      case "LOGIN_SUCCESS":
        return "success";
      case "ROLE_CHANGE":
      case "PERMISSION_UPDATE":
        return "warning";
      case "PASSWORD_CHANGE":
        return "info";
      case "BACKUP":
        return "secondary";
      default:
        return "primary";
    }
  };

  const formatTimestamp = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return "";
    }
  };

  return (
    <MainLayout>
      {/* Page Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-4 pb-3 border-bottom">
        <div className="d-flex align-items-center gap-3">
          <div className="bg-danger bg-opacity-10 text-danger rounded p-2 d-flex align-items-center justify-content-center">
            <FaShieldAlt size={18} />
          </div>
          <div>
            <h4 className="fw-bold tracking-tight text-dark mb-0">System Audit Logs</h4>
            <p className="text-muted small mb-0">Security events, authentication history, and administrative actions.</p>
          </div>
        </div>
        <div className="d-flex align-items-center gap-2">
          <span className="text-muted font-mono" style={{ fontSize: "0.7rem" }}>
            {total} event{total !== 1 ? "s" : ""} recorded
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-4">
        <div className="input-group">
          <span className="input-group-text bg-white border-end-0">
            <FaSearch size={12} className="text-muted" />
          </span>
          <input
            type="text"
            className="form-control border-start-0"
            placeholder="Search by action, entity, description, or user..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            style={{ fontSize: "0.8rem" }}
          />
          <button className="btn btn-outline-secondary" type="submit" style={{ fontSize: "0.8rem" }}>
            Search
          </button>
        </div>
      </form>

      {/* Error Alert */}
      {error ? (
        <div className="alert alert-danger py-2 mb-4" style={{ fontSize: "0.8rem" }}>
          <FaExclamationTriangle size={12} className="me-2" />
          {error}
        </div>
      ) : null}

      {/* Logs Table */}
      <div className="page-card p-0 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-premium align-middle mb-0">
            <thead>
              <tr>
                <th style={{ width: "40px" }}></th>
                <th>Event / Action</th>
                <th>Description</th>
                <th>Performed By</th>
                <th className="text-end">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-5">
                    <div className="spinner-border spinner-border-sm text-muted" role="status" style={{ width: "14px", height: "14px" }}></div>
                    <p className="text-muted mt-2 mb-0" style={{ fontSize: "0.75rem" }}>Loading audit logs...</p>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-5">
                    <FaHistory size={24} className="text-muted mb-2" />
                    <p className="text-muted mb-0" style={{ fontSize: "0.8rem" }}>No audit log entries found.</p>
                    {search ? (
                      <p className="text-muted mt-1" style={{ fontSize: "0.75rem" }}>Try a different search term.</p>
                    ) : null}
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id}>
                    <td className="text-center">
                      <span className={`badge bg-${getCategoryColor(log.action)} bg-opacity-10 text-${getCategoryColor(log.action)} p-1 border border-${getCategoryColor(log.action)} border-opacity-25`}>
                        {getCategoryIcon(log.action)}
                      </span>
                    </td>
                    <td>
                      <span className="fw-semibold text-dark" style={{ fontSize: "0.78rem" }}>{log.action}</span>
                      <div className="text-muted" style={{ fontSize: "0.65rem" }}>{log.entity}</div>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.75rem" }}>{log.description}</span>
                      {log.metadata && Object.keys(log.metadata).length > 0 ? (
                        <div className="text-muted mt-1" style={{ fontSize: "0.6rem", fontFamily: "monospace" }}>
                          {JSON.stringify(log.metadata).substring(0, 80)}
                          {JSON.stringify(log.metadata).length > 80 ? "..." : ""}
                        </div>
                      ) : null}
                    </td>
                    <td>
                      <span style={{ fontSize: "0.75rem" }}>{log.performedByName || log.performedBy?.name || "System"}</span>
                    </td>
                    <td className="text-end">
                      <span className="text-muted font-mono" style={{ fontSize: "0.65rem" }} title={new Date(log.createdAt).toLocaleString()}>
                        {formatTimestamp(log.createdAt)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 ? (
        <div className="d-flex justify-content-between align-items-center mt-3">
          <span className="text-muted" style={{ fontSize: "0.75rem" }}>
            Page {page} of {totalPages}
          </span>
          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-secondary btn-sm"
              disabled={page <= 1}
              onClick={() => handlePageChange(page - 1)}
              style={{ fontSize: "0.75rem" }}
            >
              Previous
            </button>
            <button
              className="btn btn-outline-secondary btn-sm"
              disabled={page >= totalPages}
              onClick={() => handlePageChange(page + 1)}
              style={{ fontSize: "0.75rem" }}
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </MainLayout>
  );
}

export default SystemLogsPage;
