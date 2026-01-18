import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "./api/axios";

import URLShortener from "./pages/URLShortner";
import PublicPage from "./pages/Publicpage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔐 CHECK LOGIN ON APP LOAD
  useEffect(() => {
    api.get("/user/me")
      .then(res => setUser(res.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  // ⏳ wait until auth is checked
  if (loading) return <p>Loading...</p>;

  return (
    <BrowserRouter>
      <Routes>

        {/* 🔒 PROTECTED DASHBOARD */}
        <Route
          path="/"
          element={
            user ? <URLShortener /> : <Navigate to="/login" />
          }
        />

        {/* 🌍 PUBLIC PAGE */}
        <Route path="/u/:pageId" element={<PublicPage />} />


        <Route path="/login" element={<Login/>}/>
        <Route path="/signup" element={<Signup />} />

      </Routes>
    </BrowserRouter>
  );
}

