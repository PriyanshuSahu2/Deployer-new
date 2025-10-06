import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/dashboard/Dashboard";
import GithubCallback from "./pages/auth/GithubCallback";
import GoogleCallback from "./pages/auth/GoogleCallback";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route index element={<Dashboard />}></Route>
          <Route path="/login" element={<Login />}></Route>
          <Route path="/register" element={<Register />}></Route>
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
