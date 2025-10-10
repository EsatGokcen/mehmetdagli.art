import { NavLink } from "react-router-dom";

export default function ActiveNavLink({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `btn btn-ghost ${isActive ? "btn-active font-semibold" : ""}`
      }
    >
      {children}
    </NavLink>
  );
}
