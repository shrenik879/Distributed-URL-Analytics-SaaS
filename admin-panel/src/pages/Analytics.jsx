import { useEffect, useState } from "react";
import api from "../api";
import { Loader2, TrendingUp, BarChart3 } from "lucide-react";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar,
} from "recharts";

export default function AnalyticsPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        api.get("/admin/analytics")
            .then((r) => setData(r.data))
            .catch((err) => {
                console.error(err);
                setError(err.response?.data?.error || "Failed to load analytics");
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="loading-center"><Loader2 size={24} style={{ animation: "spin 1s linear infinite" }} /></div>;

    if (error || !data) {
        return (
            <div className="loading-center">
                <div style={{ textAlign: "center" }}>
                    <p style={{ color: "#ef4444", fontWeight: 600, marginBottom: 8 }}>{error || "Failed to load"}</p>
                    <button className="btn btn-primary" onClick={() => window.location.reload()}>Retry</button>
                </div>
            </div>
        );
    }

    const clicksPerDay = data.clicksPerDay || [];
    const userGrowth = data.userGrowth || [];
    const topUrls = data.topUrls || [];
    const activeUsers = data.activeUsers || [];

    return (
        <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24 }}>Analytics Center</h1>

            <div className="grid-2 mb-6">
                {/* Clicks per day chart */}
                <div className="card">
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                        <TrendingUp size={16} color="#EE6123" />
                        <h3 style={{ fontSize: 14, fontWeight: 700 }}>Clicks Per Day (Last 30 Days)</h3>
                    </div>
                    {clicksPerDay.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <LineChart data={clicksPerDay}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="_id" tick={{ fontSize: 10 }} />
                                <YAxis tick={{ fontSize: 10 }} />
                                <Tooltip />
                                <Line type="monotone" dataKey="clicks" stroke="#EE6123" strokeWidth={2} dot={{ r: 3 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-muted text-sm" style={{ textAlign: "center", padding: 40 }}>No click data yet</p>
                    )}
                </div>

                {/* User growth chart */}
                <div className="card">
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                        <BarChart3 size={16} color="#3b82f6" />
                        <h3 style={{ fontSize: 14, fontWeight: 700 }}>New Users Per Day (Last 30 Days)</h3>
                    </div>
                    {userGrowth.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={userGrowth}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="_id" tick={{ fontSize: 10 }} />
                                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                                <Tooltip />
                                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-muted text-sm" style={{ textAlign: "center", padding: 40 }}>No user growth data yet</p>
                    )}
                </div>
            </div>

            <div className="grid-2">
                {/* Top 10 performing URLs */}
                <div className="card">
                    <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Top 10 Performing URLs</h3>
                    <div className="table-wrap">
                        <table>
                            <thead><tr><th>#</th><th>Short ID</th><th>Destination</th><th>Clicks</th></tr></thead>
                            <tbody>
                                {topUrls.map((u, i) => (
                                    <tr key={u._id}>
                                        <td style={{ fontWeight: 700, color: i < 3 ? "#EE6123" : "#9ca3af" }}>{i + 1}</td>
                                        <td><code style={{ fontSize: 12, background: "#f3f4f6", padding: "2px 6px", borderRadius: 4 }}>{u.shortId}</code></td>
                                        <td><span className="truncate" style={{ display: "block" }}>{u.redirectURL}</span></td>
                                        <td style={{ fontWeight: 700 }}>{u.clicks ?? 0}</td>
                                    </tr>
                                ))}
                                {topUrls.length === 0 && <tr><td colSpan={4} style={{ textAlign: "center", color: "#9ca3af" }}>No data</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Most active users */}
                <div className="card">
                    <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Most Active Users</h3>
                    <div className="table-wrap">
                        <table>
                            <thead><tr><th>#</th><th>User</th><th>URLs</th><th>Total Clicks</th></tr></thead>
                            <tbody>
                                {activeUsers.map((u, i) => (
                                    <tr key={u._id}>
                                        <td style={{ fontWeight: 700, color: i < 3 ? "#EE6123" : "#9ca3af" }}>{i + 1}</td>
                                        <td>
                                            <div>
                                                <p style={{ fontWeight: 600, fontSize: 13 }}>{u.user?.name || "Unknown"}</p>
                                                <p style={{ fontSize: 11, color: "#9ca3af" }}>{u.user?.email || "—"}</p>
                                            </div>
                                        </td>
                                        <td style={{ fontWeight: 600 }}>{u.urlCount ?? 0}</td>
                                        <td style={{ fontWeight: 700 }}>{u.totalClicks ?? 0}</td>
                                    </tr>
                                ))}
                                {activeUsers.length === 0 && <tr><td colSpan={4} style={{ textAlign: "center", color: "#9ca3af" }}>No data</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
