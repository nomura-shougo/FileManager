import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

export default function SideBar() {
  const currentNavClass = (linkPath: string) =>
    linkPath === useLocation().pathname ? "border-start border-info border-3" : "";

  return (
    <div className="col-2 m-0">
      <ul className="nav flex-column">
        <li className="nav-item">
          <Link to="/" className={"nav-link link-dark " + currentNavClass("/")}>
            ファイル一覧
          </Link>
        </li>
        <li className="nav-item">
          <Link
            to="/tags"
            className={"nav-link link-dark " + currentNavClass("/tags")}
          >
            タグ一覧
          </Link>
        </li>
      </ul>
    </div>
  );
}
