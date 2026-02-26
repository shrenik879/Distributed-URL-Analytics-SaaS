import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "./api";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Urls from "./pages/Urls";
import Analytics from "./pages/Analytics";
import Abuse from "./pages/Abuse";
import Domains from "./pages/Domains";
import {
    LayoutDashboard,
    Users as UsersIcon,
    Link2,
    BarChart3,
    ShieldAlert,
    Globe,
    LogOut,
} from "lucide-react";

function Sidebar({ user }) {
    const nav = useNavigate();
    const loc = useLocation();
    const links = [
        { path: "/", label: "Dashboard", icon: LayoutDashboard },
        { path: "/users", label: "Users", icon: UsersIcon },
        { path: "/urls", label: "URLs", icon: Link2 },
        { path: "/analytics", label: "Analytics", icon: BarChart3 },
        { path: "/domains", label: "Domains", icon: Globe },
        { path: "/abuse", label: "Abuse", icon: ShieldAlert },
    ];

    const handleLogout = () => {
        localStorage.removeItem("admin_token");
        window.location.href = "/login";
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                Cli<span>q</span>
            </div>
            <div className="sidebar-badge">ADMIN PANEL</div>

            <nav className="sidebar-nav">
                {links.map((l) => (
                    <button
                        key={l.path}
                        className={`sidebar-link ${loc.pathname === l.path ? "active" : ""}`}
                        onClick={() => nav(l.path)}
                    >
                        <l.icon size={16} /> {l.label}
                    </button>
                ))}
            </nav>

            <div className="sidebar-footer">
                <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 8 }}>
                    {user?.name || user?.email} <span style={{ opacity: 0.5 }}>({user?.role})</span>
                </p>
                <button className="sidebar-link" onClick={handleLogout} style={{ color: "#ef4444" }}>
                    <LogOut size={14} /> Sign out
                </button>
            </div>
        </aside>
    );
}

export default function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if we have a stored token
        const token = localStorage.getItem("admin_token");
        if (!token) {
            setLoading(false);
            return;
        }

        // Verify token is still valid
        api.get("/user/me")
            .then((res) => {
                const u = res.data.user || res.data;
                if (u && u.role === "ADMIN") setUser(u);
                else {
                    localStorage.removeItem("admin_token");
                    setUser(null);
                }
            })
            .catch(() => {
                localStorage.removeItem("admin_token");
                setUser(null);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="loading-center" style={{ minHeight: "100vh" }}>
                <p className="text-muted">Loading...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <Routes>
                <Route path="/login" element={<Login onLogin={setUser} />} />
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        );
    }

    return (
        <div className="admin-layout">
            <Sidebar user={user} />
            <main className="main-content">
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/users" element={<Users />} />
                    <Route path="/urls" element={<Urls />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/domains" element={<Domains />} />
                    <Route path="/abuse" element={<Abuse />} />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </main>
        </div>
    );
}
