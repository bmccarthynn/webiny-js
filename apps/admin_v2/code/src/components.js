import React from "react";
import { cloneElement, Children } from "react";
import { Link } from "react-router-v6";
import { useAdmin } from "@webiny/admin";

export const Dashboard = () => {
  const {
    components: { Layout },
  } = useAdmin();
  return (
    <Layout>
      <h2>Dashboard</h2>
      <Link to={"/random-route"}>Take me somewhere</Link>
    </Layout>
  );
};

export const NotFound = () => {
  const {
    components: { Layout },
  } = useAdmin();

  return (
    <Layout>
      <h2>NotFound</h2>
    </Layout>
  );
};

export const Navigation = ({ menus }) => {
  return (
    <ul>{menus.map((menu, index) => cloneElement(menu, { key: index }))}</ul>
  );
};

export const Menu = ({ text, path, children }) => {
  const menus = Children.toArray(children);
  return (
    <li>
      {path ? <Link to={path}>{text}</Link> : text}
      {children ? (
        <ul>
          {menus.map((menu, index) => cloneElement(menu, { key: index }))}
        </ul>
      ) : null}
    </li>
  );
};

export const Layout = ({ children }) => {
  const {
    menus,
    components: { Navigation },
  } = useAdmin();
  return (
    <div>
      <nav>Layout</nav>
      <div style={{ display: "flex" }}>
        <div style={{ flexBasis: 200 }}>
          <Navigation menus={menus} />
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};
