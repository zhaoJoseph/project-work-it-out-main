import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./Protected";
import Home from "./pages/Home";
import UpdateEmail from "../pages/UpdateEmail";
import UpdatePassword from "../pages/UpdatePassword";
import Profile from "../pages/Profile";
import ExercisesPage from "../pages/ExercisesPage";
import SMSForm from "../pages/SMSForm";
import Disable2FA from "../pages/Disable2FA";
import Performance from "../pages/Performance";
import ImportPage from "../pages/ImportPage";

export default function ProtectedRoutes() {
  return (
    <Routes>
    <Route path="/" element={
    <ProtectedRoute>
    <Home/>
    </ProtectedRoute>
    }/>
    <Route path="/updateemail" element={
    <ProtectedRoute>
    <UpdateEmail />
    </ProtectedRoute>
    }/>
      <Route path="/updatepassword" element={
    <ProtectedRoute>
    <UpdatePassword />
    </ProtectedRoute>
    }/>
    <Route path="/profile" element={
    <ProtectedRoute>
    <Profile />
    </ProtectedRoute>
    }/>
    <Route path="/exercises" element={
    <ProtectedRoute>
    <ExercisesPage />
    </ProtectedRoute>
    }/>
    <Route path="/exercises/:id" element={
    <ProtectedRoute>
    <ExercisesPage />
    </ProtectedRoute>
    }/>
    <Route path='/activate2fa' element={
    <ProtectedRoute>
    <SMSForm />
    </ProtectedRoute>
    }/>
    <Route path='/disable2fa' element={
    <ProtectedRoute>
    <Disable2FA />
    </ProtectedRoute>
    }/>
    <Route path='/performance' element={
    <ProtectedRoute>
    <Performance />
    </ProtectedRoute>
    }/>
    <Route path='/import' element={
    <ProtectedRoute>
    <ImportPage />
    </ProtectedRoute>
    }/>
    </Routes>
  );
}