import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Route } from "react-router-dom";

const ProtectedRoute = ({ path, exact, children }) => {
  const auth = useSelector((store) => store.authenticated);

  return auth ? (
    <>
      {children}
    </>
  ) : (
    <Navigate replace to="/login" />
  );
};

export default ProtectedRoute;