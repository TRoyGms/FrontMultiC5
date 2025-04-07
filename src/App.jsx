import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Swal from "sweetalert2";

import Header from "./components/Header";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Temperature from "./pages/Temperature";
import Light from "./pages/Light";
import Movement from "./pages/Movement";
import Sound from "./pages/Sound";
import Login from "./pages/Login";

import Admin from "./pages/Admin";


import { requestPermissionAndGetToken, listenToForegroundMessages } from "./services/notifications";


function LayoutWithHeader() {
  const location = useLocation();
  const hideHeader = location.pathname === "/login" || location.pathname === "/admin";

  return (
    <>
      {!hideHeader && <Header />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/temperature"
          element={
            <ProtectedRoute>
              <Temperature />
            </ProtectedRoute>
          }
        />
        <Route
          path="/light"
          element={
            <ProtectedRoute>
              <Light />
            </ProtectedRoute>
          }
        />
        <Route
          path="/movement"
          element={
            <ProtectedRoute>
              <Movement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sound"
          element={
            <ProtectedRoute>
              <Sound />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}


function App() {
  useEffect(() => {
   // requestPermissionAndGetToken();

    listenToForegroundMessages((payload) => {
      const { title, body } = payload.notification;

      Swal.fire({
        title,
        text: body,
        icon: "info",
        toast: true,
        position: "top-end",
        timer: 5000,
        showConfirmButton: false,
      });
    });
  }, []);

  return (
    <Router>
      <LayoutWithHeader />
    </Router>
  );
}

export default App;
