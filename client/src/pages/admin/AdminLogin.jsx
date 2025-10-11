import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login as apiLogin } from "../../lib/api.js";
import ErrorAlert from "../../components/ErrorAlert.jsx";

const cls = (...xs) => xs.filter(Boolean).join(" ");
const Surface = ({ className = "", children }) => (
  <div
    className={cls(
      "rounded-2xl bg-white border border-neutral-200/70",
      "shadow-[0_6px_20px_rgba(0,0,0,0.10)]",
      "hover:shadow-[0_18px_48px_rgba(0,0,0,0.22)] transition-shadow",
      className
    )}
  >
    {children}
  </div>
);

export default function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  function onChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    if (!form.username.trim() || !form.password) {
      setErr("Lütfen kullanıcı adı ve şifre girin.");
      return;
    }
    try {
      setLoading(true);
      await apiLogin(form.username.trim(), form.password);
      navigate("/admin", { replace: true });
    } catch (ex) {
      setErr("Giriş başarısız. Bilgileri kontrol edip tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto px-4 min-h-[68vh] flex items-center justify-center py-12">
      <Surface className="w-full max-w-md p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold text-neutral-900">
            Yönetici Girişi
          </h1>
          <p className="mt-1 text-neutral-600 text-sm">
            Lütfen yönetici hesabınızla giriş yapın.
          </p>
        </div>

        <ErrorAlert message={err} />

        <form className="space-y-5 mt-4" onSubmit={onSubmit} noValidate>
          <div>
            <label className="label block mb-2">
              <span className="label-text text-neutral-800">Kullanıcı Adı</span>
            </label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={onChange}
              className="input input-bordered w-full text-neutral-900 placeholder-neutral-500"
              autoComplete="username"
            />
          </div>

          <div>
            <label className="label block mb-2">
              <span className="label-text text-neutral-800">Şifre</span>
            </label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={onChange}
                className="input input-bordered w-full pr-12 text-neutral-900 placeholder-neutral-500"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-sm rounded-full no-animation transition-none active:translate-y-0 active:scale-100"
                onClick={() => setShowPw((s) => !s)}
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? "Gizle" : "Göster"}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className={cls(
                "btn w-full rounded-full bg-neutral-900 text-white hover:bg-black",
                loading && "btn-disabled opacity-70"
              )}
            >
              {loading ? "Giriş yapılıyor…" : "Giriş Yap"}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-xs text-neutral-500">
          © {new Date().getFullYear()} Mehmet Dağlı — Yönetim Paneli
        </div>
      </Surface>
    </div>
  );
}
