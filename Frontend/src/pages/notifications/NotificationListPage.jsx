import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { getNotifications, markAllAsRead, markAsRead } from "../../services/notificationApi";
import { BsBell, BsCheck2, BsCheck2All, BsFileText, BsCashCoin, BsJournalCheck, BsExclamationTriangle } from "react-icons/bs";
import { formatDistanceToNow } from "date-fns";

const TYPE_ICONS = {
  invoice_created: BsFileText,
  invoice_submitted: BsFileText,
  invoice_cancelled: BsFileText,
  payment_received: BsCashCoin,
  payment_made: BsCashCoin,
  journal_submitted: BsJournalCheck,
  budget_approved: BsCheck2,
  budget_exceeded: BsExclamationTriangle,
  credit_note_issued: BsFileText,
  debit_note_issued: BsFileText,
  system_alert: BsExclamationTriangle,
};

function NotificationListPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const loadNotifications = async (p = 1) => {
    try {
      setLoading(true);
      const response = await getNotifications(p);
      const data = response.data.data;
      setNotifications(data.data || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
      setPage(data.page || 1);
      setError("");
    } catch (err) {
      const msg = String(err);
      if (!msg.includes("Access denied")) setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications(1);
  }, []);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n)),
      );
    } catch {}
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() })),
      );
    } catch {}
  };

  const getIcon = (type) => {
    const Icon = TYPE_ICONS[type] || BsBell;
    return Icon;
  };

  const formatTime = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return "";
    }
  };

  const colSpan = 3;

  return (
    <MainLayout>
      <div className="page-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h5 className="page-header-title mb-1">Notifications</h5>
            <p className="page-header-subtitle">
              {total} notification{total !== 1 ? "s" : ""}
              {unreadCount > 0 ? ` · ${unreadCount} unread` : ""}
            </p>
          </div>
          {unreadCount > 0 && (
            <div className="d-flex gap-2">
              <button className="btn btn-sm btn-outline-primary" onClick={handleMarkAllAsRead}>
                <BsCheck2All size={13} className="me-1" /> Mark All Read
              </button>
            </div>
          )}
        </div>

        {error ? <div className="alert alert-danger">{error}</div> : null}

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-secondary" role="status" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-5">
            <div className="d-flex flex-column align-items-center gap-2">
              <div className="text-muted" style={{ fontSize: "2rem", opacity: 0.4 }}><BsBell /></div>
              <div className="fw-semibold text-dark" style={{ fontSize: "0.875rem" }}>No notifications</div>
              <div className="text-muted small">You're all caught up!</div>
            </div>
          </div>
        ) : (
          <div className="list-group list-group-flush">
            {notifications.map((notif) => {
              const Icon = getIcon(notif.type);
              return (
                <div
                  key={notif._id}
                  className={`list-group-item list-group-item-action d-flex gap-3 align-items-start border-bottom py-3 px-0 ${!notif.isRead ? "bg-primary bg-opacity-5" : ""}`}
                  style={{ cursor: "pointer", borderLeft: notif.isRead ? "3px solid transparent" : "3px solid var(--bs-primary, #0d6efd)" }}
                  onClick={() => {
                    if (!notif.isRead) handleMarkAsRead(notif._id);
                    if (notif.link) navigate(notif.link);
                  }}
                >
                  <div className={`rounded p-2 d-flex align-items-center justify-content-center flex-shrink-0 ${notif.isRead ? "bg-light text-muted" : "bg-primary bg-opacity-10 text-primary"}`}>
                    <Icon size={16} />
                  </div>
                  <div className="flex-grow-1 min-w-0">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <span className={`fw-semibold small ${notif.isRead ? "text-dark" : "text-dark"}`}>{notif.title}</span>
                        {!notif.isRead && <span className="badge bg-primary ms-2" style={{ fontSize: "0.5rem" }}>NEW</span>}
                      </div>
                      <span className="text-muted font-mono" style={{ fontSize: "0.65rem", whiteSpace: "nowrap", marginLeft: "8px" }}>
                        {formatTime(notif.createdAt)}
                      </span>
                    </div>
                    <div className="text-muted mt-1" style={{ fontSize: "0.75rem" }}>
                      {notif.message}
                    </div>
                    {notif.link && (
                      <div className="mt-1">
                        <span className="text-primary small" style={{ fontSize: "0.65rem" }}>View details →</span>
                      </div>
                    )}
                  </div>
                  {!notif.isRead && (
                    <button
                      className="btn btn-sm btn-outline-secondary flex-shrink-0"
                      onClick={(e) => { e.stopPropagation(); handleMarkAsRead(notif._id); }}
                      title="Mark as read"
                      style={{ padding: "2px 6px", fontSize: "0.65rem" }}
                    >
                      <BsCheck2 size={13} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
            <button className="btn btn-sm btn-outline-secondary" disabled={page <= 1} onClick={() => loadNotifications(page - 1)}>Previous</button>
            <span className="text-muted small font-mono">Page {page} of {totalPages}</span>
            <button className="btn btn-sm btn-outline-secondary" disabled={page >= totalPages} onClick={() => loadNotifications(page + 1)}>Next</button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default NotificationListPage;
