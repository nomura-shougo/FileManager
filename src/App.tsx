import React from "react";
import HomeView from "./views/HomeView";

import { HashRouter as Router, Switch, Route } from "react-router-dom";
import "./index.scss";

export default function App() {
  return (
    <>
      <HomeView />
    </>
  );
}
