import React from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import Layout from "./ui/Layout.jsx";
import Home from "./pages/Home.jsx";
import Portfolio from "./pages/Portfolio.jsx";
import Events from "./pages/Events.jsx";
import Bio from "./pages/Bio.jsx";
import Contact from "./pages/Contact.jsx";
import AdminLogin from "./pages/admin/AdminLogin.jsx";
import Admin from "./pages/admin/Admin.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: "portfolio", element: <Portfolio /> },
      { path: "events", element: <Events /> },
      { path: "bio", element: <Bio /> },
      { path: "contact", element: <Contact /> },
      { path: "admin/login", element: <AdminLogin /> },
      { path: "admin", element: <Admin /> },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
