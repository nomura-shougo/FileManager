import React, { useState, useEffect } from "react";
import { Link, useHistory } from "react-router-dom";

export default function Header() {
  const history = useHistory();
  return (
    <div>
      <nav className="navbar navbar-light bg-light">
        <div className="container-fluid">
          <button
            onClick={() => history.goBack()}
            className="btn btn-outline-primary"
          >
            Back
          </button>
          <a className="navbar-brand" href="#">
            FileManager
          </a>
        </div>
      </nav>
      {/* <button
        onClick={() => history.goBack()}
        className="btn btn-outline-primary"
      >
        Back
      </button>
      <h1>Hello World!</h1> */}
    </div>
  );
}
