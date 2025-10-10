import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as api from "../../lib/api";

export default function AdminLogin() {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();
  const loc = useLocation();
  const redirectTo = loc.state?.from || "/admin";

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api.login(username, password);
      await api.refreshCsrf(); // rotate/get CSRF after auth
      nav(redirectTo, { replace: true });
    } catch (err) {
      setError(String(err.message || err));
    } finally {
      setBusy(false);
    }
  }

  // Optional: redirect if already logged in
  useEffect(() => {
    (async () => {
      try {
        const me = await api.get("/api/auth/me");
        if (me?.is_admin) {
          await api.refreshCsrf();
          nav("/admin", { replace: true });
        }
      } catch (_) {
        /* not logged in */
      }
    })();
  }, [nav]);

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Admin Login</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="form-control">
          <div className="label">
            <span className="label-text">Username</span>
          </div>
          <input
            className="input input-bordered"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
          />
        </label>
        <label className="form-control">
          <div className="label">
            <span className="label-text">Password</span>
          </div>
          <input
            type="password"
            className="input input-bordered"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error && <div className="alert alert-error">{error}</div>}
        <button className="btn btn-primary w-full" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
