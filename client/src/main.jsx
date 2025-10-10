import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";

import AppLayout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import Portfolio from "./pages/Portfolio.jsx";
import Events from "./pages/Events.jsx";
import Bio from "./pages/Bio.jsx";
import Contact from "./pages/Contact.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import { I18nProvider } from "./i18n/index.jsx";

import AdminLogin from "./pages/admin/AdminLogin.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import NotFound from "./pages/NotFound.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "portfolio", element: <Portfolio /> },
      { path: "events", element: <Events /> },
      { path: "bio", element: <Bio /> },
      { path: "contact", element: <Contact /> },

      // Admin
      { path: "admin/login", element: <AdminLogin /> },
      { path: "admin", element: <AdminDashboard /> },

      // 404
      { path: "*", element: <NotFound /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <I18nProvider defaultLang="tr">
        <RouterProvider router={router} />
      </I18nProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
