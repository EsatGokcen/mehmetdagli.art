import { Outlet, Link } from "react-router-dom";
import ActiveNavLink from "../components/ActiveNavLink.jsx";
import LanguageSwitch from "../components/LanguageSwitch.jsx";
import { useI18n } from "../i18n/index.jsx";

export default function Layout() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Sticky header */}
      <header className="navbar bg-base-100 shadow sticky top-0 z-40 backdrop-blur-sm">
        <div className="flex-1">
          {/* Brand: bigger logo + underline animation */}
          <Link
            to="/"
            className="group inline-flex items-center gap-3 px-2 py-2 rounded-md focus:outline-none"
            aria-label={t("layout.brand") || "Mehmet Dağlı"}
          >
            <span className="relative inline-flex items-center gap-3">
              {/* Logo from /public */}
              <img
                src="/mehmet-logo.png"
                alt="Mehmet Dağlı logo"
                className="h-10 md:h-12 w-auto object-contain"
                loading="eager"
                decoding="async"
              />
              <span className="text-xl md:text-2xl font-semibold tracking-tight text-neutral-900">
                {t("layout.brand") || "Mehmet Dağlı"}
              </span>

              {/* Underline: animates across logo + title */}
              <span
                aria-hidden
                className="
                  pointer-events-none
                  absolute -bottom-1 left-0 h-[2px] w-0
                  bg-neutral-900/90
                  transition-[width] duration-300 ease-out
                  group-hover:w-full group-focus-visible:w-full
                "
              />
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
