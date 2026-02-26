import { useEffect, useState } from "react";
import api from "../api";
import { Loader2, ShieldAlert, ToggleLeft, ToggleRight, AlertTriangle, Ban } from "lucide-react";

export default function AbusePage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [acting, setActing] = useState(null);

    const fetchData = () => {
        setLoading(true);
        setError("");
        api.get("/admin/abuse")
            .then((r) => setData(r.data))
            .catch((err) => {
                console.error(err);
                setError(err.response?.data?.error || "Failed to load");
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchData(); }, []);

    const toggleUrl = async (id) => {
        setActing(id);
        try {
            await api.put(`/admin/urls/${id}/toggle`);
            fetchData();
        } catch (err) { console.error(err); }
        setActing(null);
    };

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

    const suspicious = data.suspicious || [];
    const disabled = data.disabled || [];
    const suspendedUsers = data.suspendedUsers || [];

    return (
        <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24 }}>Abuse & Moderation</h1>

            {/* Suspicious high-click URLs */}
            <div className="card mb-6">
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                    <AlertTriangle size={16} color="#f59e0b" />
                    <h3 style={{ fontSize: 14, fontWeight: 700 }}>Suspicious High-Click URLs</h3>
                    <span className="badge badge-admin" style={{ marginLeft: "auto" }}>{suspicious.length} flagged</span>
                </div>
                {suspicious.length > 0 ? (
                    <div className="table-wrap">
                        <table>
                            <thead><tr><th>Short ID</th><th>Destination</th><th>Clicks</th><th>Status</th><th>Action</th></tr></thead>
                            <tbody>
                                {suspicious.map((u) => (
                                    <tr key={u._id}>
                                        <td><code style={{ fontSize: 12, background: "#fef3c7", padding: "2px 6px", borderRadius: 4, color: "#92400e" }}>{u.shortId}</code></td>
                                        <td><span className="truncate" style={{ display: "block", maxWidth: 300 }}>{u.redirectURL}</span></td>
                                        <td style={{ fontWeight: 700, color: "#ef4444" }}>{u.clicks ?? 0}</td>
                                        <td><span className={`badge ${u.isActive !== false ? "badge-active" : "badge-disabled"}`}>{u.isActive !== false ? "Active" : "Disabled"}</span></td>
                                        <td>
                                            <button
                                                className={`btn btn-sm ${u.isActive !== false ? "btn-danger" : "btn-success"}`}
                                                onClick={() => toggleUrl(u._id)}
                                                disabled={acting === u._id}
                                            >
                                                {u.isActive !== false ? <><ToggleRight size={12} /> Disable</> : <><ToggleLeft size={12} /> Enable</>}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-muted text-sm" style={{ textAlign: "center", padding: 32 }}>No suspicious URLs detected (threshold: 50+ clicks)</p>
                )}
            </div>

            {/* Disabled URLs */}
            <div className="card mb-6">
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                    <Ban size={16} color="#ef4444" />
                    <h3 style={{ fontSize: 14, fontWeight: 700 }}>Disabled URLs</h3>
                    <span className="badge badge-disabled" style={{ marginLeft: "auto" }}>{disabled.length}</span>
                </div>
                {disabled.length > 0 ? (
                    <div className="table-wrap">
                        <table>
                            <thead><tr><th>Short ID</th><th>Destination</th><th>Action</th></tr></thead>
                            <tbody>
                                {disabled.map((u) => (
                                    <tr key={u._id}>
                                        <td><code style={{ fontSize: 12, background: "#fee2e2", padding: "2px 6px", borderRadius: 4, color: "#991b1b" }}>{u.shortId}</code></td>
                                        <td><span className="truncate" style={{ display: "block", maxWidth: 340 }}>{u.redirectURL}</span></td>
                                        <td>
                                            <button className="btn btn-sm btn-success" onClick={() => toggleUrl(u._id)} disabled={acting === u._id}>
                                                <ToggleLeft size={12} /> Re-enable
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-muted text-sm" style={{ textAlign: "center", padding: 32 }}>No disabled URLs</p>
                )}
            </div>

            {/* Suspended users */}
            <div className="card">
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                    <ShieldAlert size={16} color="#8b5cf6" />
                    <h3 style={{ fontSize: 14, fontWeight: 700 }}>Suspended Users</h3>
                    <span className="badge badge-suspended" style={{ marginLeft: "auto" }}>{suspendedUsers.length}</span>
                </div>
                {suspendedUsers.length > 0 ? (
                    <div className="table-wrap">
                        <table>
                            <thead><tr><th>Name</th><th>Email</th><th>Suspended Since</th></tr></thead>
                            <tbody>
                                {suspendedUsers.map((u) => (
                                    <tr key={u._id}>
                                        <td style={{ fontWeight: 600 }}>{u.name}</td>
                                        <td style={{ fontSize: 12, color: "#6b7280" }}>{u.email}</td>
                                        <td style={{ fontSize: 12, color: "#9ca3af" }}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-muted text-sm" style={{ textAlign: "center", padding: 32 }}>No suspended users</p>
                )}
            </div>

            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
