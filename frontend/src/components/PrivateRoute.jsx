import React from "react";
import { Navigate } from "react-router-dom";
import Navbar from "./Navbar";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? (
    <>
      <Navbar />
      {children}
    </>
  ) : (
    <Navigate to="/" />
  );
};

export default PrivateRoute;
