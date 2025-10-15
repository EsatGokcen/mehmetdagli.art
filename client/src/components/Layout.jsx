import { Outlet, Link } from "react-router-dom";
import ActiveNavLink from "../components/ActiveNavLink.jsx";
import LanguageSwitch from "../components/LanguageSwitch.jsx";
import { useI18n } from "../i18n/index.jsx";

export default function Layout() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* sticky header; visual tweaks only */}
      <header className="navbar bg-base-100 shadow sticky top-0 z-40 backdrop-blur-sm">
        <div className="flex-1">
          <Link to="/" className="btn btn-ghost text-xl">
            <span className="inline-flex items-center gap-3">
              {/* Logo from /public */}
              <img
                src="/mehmet-logo.png"
                alt="Mehmet Dağlı logo"
                className="h-8 md:h-9 w-auto object-contain"
                loading="eager"
                decoding="async"
              />
              {t("layout.brand") || "Mehmet Dağlı"}
            </span>
          </Link>
        </div>

        <nav className="flex items-center gap-1">
          <ActiveNavLink to="/">{t("nav.home")}</ActiveNavLink>
          <ActiveNavLink to="/portfolio">{t("nav.portfolio")}</ActiveNavLink>
          <ActiveNavLink to="/events">{t("nav.events")}</ActiveNavLink>
          <ActiveNavLink to="/bio">{t("nav.bio")}</ActiveNavLink>
          <ActiveNavLink to="/contact">{t("nav.contact")}</ActiveNavLink>
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
