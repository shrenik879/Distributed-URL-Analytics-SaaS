import { useEffect, useState } from "react";
import api from "../api";
import { Users, Link2, MousePointerClick, TrendingUp, Loader2 } from "lucide-react";

export default function Dashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        api.get("/admin/overview")
            .then((r) => setData(r.data))
            .catch((err) => {
                console.error("Overview error:", err);
                setError(err.response?.data?.error || err.message || "Failed to load");
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="loading-center"><Loader2 size={24} style={{ animation: "spin 1s linear infinite" }} /></div>;

    if (error || !data) {
        return (
            <div className="loading-center">
                <div style={{ textAlign: "center" }}>
                    <p style={{ color: "#ef4444", fontWeight: 600, marginBottom: 8 }}>{error || "Failed to load dashboard"}</p>
                    <button className="btn btn-primary" onClick={() => window.location.reload()}>Retry</button>
                </div>
            </div>
        );
    }

    const stats = [
        { label: "Total Users", value: data.totalUsers ?? 0, Icon: Users, color: "#3b82f6", bg: "#eff6ff" },
        { label: "Total URLs", value: data.totalUrls ?? 0, Icon: Link2, color: "#EE6123", bg: "#fff7ed" },
        { label: "Total Clicks", value: (data.totalClicks ?? 0).toLocaleString(), Icon: MousePointerClick, color: "#10b981", bg: "#ecfdf5" },
        { label: "URLs Today", value: data.urlsToday ?? 0, Icon: TrendingUp, color: "#8b5cf6", bg: "#f5f3ff" },
    ];

    return (
        <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24 }}>Dashboard</h1>

            {/* Stat cards — Minimal Design */}
            <div className="grid-4 mb-6">
                {stats.map((s) => (
                    <div key={s.label} className="stat-card" style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 14,
                        padding: "20px",
                        borderRadius: 16,
                        background: "#fff",
                        border: "1px solid #e5e7eb",
                        borderBottom: "2px solid transparent",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                        transition: "all 0.3s ease",
                        cursor: "default",
                    }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateY(-2px)";
                            e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)";
                            e.currentTarget.style.borderBottomColor = s.color;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.04)";
                            e.currentTarget.style.borderBottomColor = "transparent";
                        }}
                    >
                        {/* Icon */}
                        <div style={{
                            width: 40, height: 40, borderRadius: 12,
                            background: s.bg, color: s.color,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0,
                            transition: "transform 0.3s ease",
                        }}>
                            <s.Icon size={18} />
                        </div>

                        {/* Text */}
                        <div>
                            <p style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{s.label}</p>
                            <p style={{ fontSize: 28, fontWeight: 800, color: "#0B1736", letterSpacing: "-0.02em", lineHeight: 1 }}>{s.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid-2">
                {/* Top 5 URLs */}
                <div className="card">
                    <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Top 5 Most Clicked URLs</h3>
                    <div className="table-wrap">
                        <table>
                            <thead><tr><th>Short ID</th><th>Destination</th><th>Clicks</th></tr></thead>
                            <tbody>
                                {(data.topUrls || []).map((u) => (
                                    <tr key={u._id}>
                                        <td><code style={{ fontSize: 12, background: "#f3f4f6", padding: "2px 6px", borderRadius: 4 }}>{u.shortId}</code></td>
                                        <td><span className="truncate" style={{ display: "block" }}>{u.redirectURL}</span></td>
                                        <td style={{ fontWeight: 700 }}>{u.clicks}</td>
                                    </tr>
                                ))}
                                {(!data.topUrls || data.topUrls.length === 0) && <tr><td colSpan={3} style={{ textAlign: "center", color: "#9ca3af" }}>No URLs yet</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recent users */}
                <div className="card">
                    <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Recently Registered Users</h3>
                    <div className="table-wrap">
                        <table>
                            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Plan</th></tr></thead>
                            <tbody>
                                {(data.recentUsers || []).map((u) => (
                                    <tr key={u._id}>
                                        <td style={{ fontWeight: 600 }}>{u.name}</td>
                                        <td style={{ fontSize: 12, color: "#6b7280" }}>{u.email}</td>
                                        <td><span className={`badge ${u.role === "ADMIN" ? "badge-admin" : "badge-normal"}`}>{u.role}</span></td>
                                        <td><span className="badge badge-normal">{u.plan}</span></td>
                                    </tr>
                                ))}
                                {(!data.recentUsers || data.recentUsers.length === 0) && <tr><td colSpan={4} style={{ textAlign: "center", color: "#9ca3af" }}>No users yet</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
