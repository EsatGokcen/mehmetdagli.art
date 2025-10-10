import { Outlet, Link } from "react-router-dom";
import ActiveNavLink from "../components/ActiveNavLink.jsx";
import LanguageSwitch from "../components/LanguageSwitch.jsx";
import { useI18n } from "../i18n/index.jsx";

export default function Layout() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="navbar bg-base-100 shadow">
        <div className="flex-1">
          <Link to="/" className="btn btn-ghost text-xl">
            Mehmet Dağlı
          </Link>
        </div>
        <nav className="flex-none flex items-center gap-2">
          <ActiveNavLink to="/portfolio">{t("nav.portfolio")}</ActiveNavLink>
          <ActiveNavLink to="/events">{t("nav.events")}</ActiveNavLink>
          <ActiveNavLink to="/bio">{t("nav.bio")}</ActiveNavLink>
          <ActiveNavLink to="/contact">{t("nav.contact")}</ActiveNavLink>
          <ActiveNavLink to="/admin/login">{t("nav.admin")}</ActiveNavLink>
          <LanguageSwitch />
        </nav>
      </header>

      <main className="flex-grow">
        <Outlet />
      </main>

      <footer className="footer p-4 bg-base-200 justify-center">
        <p>© {new Date().getFullYear()} Mehmet Dağlı</p>
      </footer>
    </div>
  );
}
