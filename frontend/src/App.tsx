import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/dashboard/Dashboard";
import GithubCallback from "./pages/auth/GithubCallback";
import GoogleCallback from "./pages/auth/GoogleCallback";
import VerifyEmail from "./pages/auth/VerifyEmail";
import EmailNotVerified from "./pages/auth/EmailNotVerified";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route index element={<Dashboard />}></Route>
          <Route path="/login" element={<Login />}></Route>
          <Route path="/register" element={<Register />}></Route>
          <Route path="/forgot-password" element={<ForgotPassword />}></Route>
          <Route path="/reset-password" element={<ResetPassword />}></Route>
          <Route path="/verify-email" element={<VerifyEmail />}></Route>
          <Route
            path="/email-not-verified"
            element={<EmailNotVerified />}
          ></Route>
          <Route
            path="/auth/github/callback"
            element={<GithubCallback />}
          ></Route>
          <Route
            path="/auth/google/callback"
            element={<GoogleCallback />}
          ></Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
