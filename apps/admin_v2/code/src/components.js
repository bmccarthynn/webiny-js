import React from "react";
import { cloneElement, Children } from "react";
import { Link } from "react-router-v6";
import { useAdmin } from "@webiny/admin/v2";

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
  
  console.log("NOT FOUND");

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
