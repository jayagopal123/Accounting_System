import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";

function ProtectedRoute({ children }) {
  const { user, setUser } = useAuth();
  const [status, setStatus] = useState("validating"); // "validating" | "authorized" | "unauthorized"

  useEffect(() => {
    const token = localStorage.getItem("token");

    // No stored auth data at all — redirect to login immediately
    if (!user && !token) {
      setStatus("unauthorized");
      return;
    }

    let cancelled = false;

    const validate = async () => {
      try {
        // Make a lightweight request to verify the session is still valid
        await axios.get("http://localhost:5000/api/dashboard/summary", {
          withCredentials: true,
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!cancelled) setStatus("authorized");
      } catch (err) {
        if (cancelled) return;

        if (err.response && [401, 403].includes(err.response.status)) {
          // Token expired / invalid — clear stale data and redirect to login
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
          setStatus("unauthorized");
        } else {
          // Network error or server down — let user through anyway
          // Dashboard API calls will surface individual errors
          setStatus("authorized");
        }
      }
    };

    validate();

    return () => {
      cancelled = true;
    };
  }, [user, setUser]);

  if (status === "validating") {
    return (
      <div className="d-flex align-items-center justify-content-center vh-100">
        <div className="text-center">
          <div
            className="spinner-border text-secondary mb-2"
            role="status"
            style={{ width: "1.25rem", height: "1.25rem" }}
          />
          <p className="text-muted small mb-0">Authenticating session...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthorized") {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
