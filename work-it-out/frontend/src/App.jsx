import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import CreationSuccess from "./pages/CreationSuccess";
import Verify from "./pages/Verify";
import ResetPasswordRequest from "./pages/ResetPasswordRequest";
import PasswordReset from "./pages/PasswordReset";
import ExercisesPage from "./pages/ExercisesPage";
import ExercisePage from "./pages/ExercisePage";
import Home from "./pages/Home";
import store from "./store/store";
import ProtectedRoutes from "./components/ProtectedRoutes";
import VerifyCode from "./pages/VerifyCode";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/creationsuccess" element={<CreationSuccess />} />
        <Route path="/activate/:token" element={<Verify />} />
        <Route path="/resetpassword/:token" element={<PasswordReset />} />
        <Route path="/forgotpassword" element={<ResetPasswordRequest />} />
        <Route path="/verifycode/:id" element={<VerifyCode/>} />
      </Routes>
      <ProtectedRoutes />
    </BrowserRouter>
  );
}

export default App;
