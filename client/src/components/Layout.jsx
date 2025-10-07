import { Link, Outlet, NavLink } from "react-router-dom";

export default function Layout() {
  return (
    <div className="min-h-screen bg-base-200">
      <div className="navbar bg-base-100 shadow">
        <div className="flex-1">
          <Link to="/" className="btn btn-ghost text-xl">
            Mehmet Dağlı
          </Link>
        </div>
        <nav className="flex gap-2">
          {[
            ["Portfolio", "/portfolio"],
            ["Events", "/events"],
            ["Bio", "/bio"],
            ["Contact", "/contact"],
          ].map(([label, to]) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `btn btn-ghost ${isActive ? "btn-active" : ""}`
              }
            >
              {label}
            </NavLink>
          ))}
          <NavLink to="/admin/login" className="btn btn-primary">
            Admin
          </NavLink>
        </nav>
      </div>

      <main className="container mx-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
