import { useEffect, useState } from "react";
import api from "../api";
import { Trash2, ToggleLeft, ToggleRight, Loader2, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";

export default function UrlsPage() {
    const [urls, setUrls] = useState([]);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(1);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [acting, setActing] = useState(null);

    const fetchUrls = () => {
        setLoading(true);
        setError("");
        api.get("/admin/urls", { params: { page, limit: 15 } })
            .then((r) => {
                setUrls(r.data?.urls || []);
                setTotal(r.data?.total || 0);
                setPages(r.data?.pages || 1);
            })
            .catch((err) => {
                console.error(err);
                setError(err.response?.data?.error || "Failed to load URLs");
                setUrls([]);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchUrls(); }, [page]);

    const toggleActive = async (id) => {
        setActing(id);
        try {
            await api.put(`/admin/urls/${id}/toggle`);
            fetchUrls();
        } catch (err) { console.error(err); }
        setActing(null);
    };

    const deleteUrl = async (id, shortId) => {
        if (!window.confirm(`Delete URL "${shortId}"?`)) return;
        setActing(id);
        try {
            await api.delete(`/admin/urls/${id}`);
            fetchUrls();
        } catch (err) { console.error(err); }
        setActing(null);
    };

    return (
        <div>
            <div className="flex-between mb-6">
                <h1 style={{ fontSize: 24, fontWeight: 800 }}>URL Management</h1>
                <span className="text-muted text-sm">{total} URLs total</span>
            </div>

            {error && (
                <div style={{ textAlign: "center", padding: 32, color: "#ef4444", fontWeight: 600 }}>
                    {error}
                    <br />
                    <button className="btn btn-primary mt-4" onClick={fetchUrls}>Retry</button>
                </div>
            )}

            {!error && (
                <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                    {loading ? (
                        <div className="loading-center"><Loader2 size={24} style={{ animation: "spin 1s linear infinite" }} /></div>
                    ) : (
                        <div className="table-wrap">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Short ID</th><th>Destination</th><th>Clicks</th><th>Status</th><th>Created</th><th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {urls.map((u) => (
                                        <tr key={u._id}>
                                            <td>
                                                <a href={`http://localhost:8002/url/${u.shortId}`} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 4, color: "#3b82f6", fontWeight: 600, fontSize: 12 }}>
                                                    {u.shortId} <ExternalLink size={10} />
                                                </a>
                                            </td>
                                            <td><span className="truncate" style={{ display: "block", maxWidth: 280, fontSize: 12 }}>{u.redirectURL}</span></td>
                                            <td style={{ fontWeight: 700 }}>{u.clicks ?? 0}</td>
                                            <td>
                                                <span className={`badge ${u.isActive !== false ? "badge-active" : "badge-disabled"}`}>
                                                    {u.isActive !== false ? "Active" : "Disabled"}
                                                </span>
                                            </td>
                                            <td style={{ fontSize: 12, color: "#9ca3af" }}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}</td>
                                            <td>
                                                <div style={{ display: "flex", gap: 4 }}>
                                                    <button
                                                        className={`btn btn-sm ${u.isActive !== false ? "btn-warning" : "btn-success"}`}
                                                        onClick={() => toggleActive(u._id)}
                                                        disabled={acting === u._id}
                                                        title={u.isActive !== false ? "Disable URL" : "Enable URL"}
                                                    >
                                                        {u.isActive !== false ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-danger"
                                                        onClick={() => deleteUrl(u._id, u.shortId)}
                                                        disabled={acting === u._id}
                                                        title="Delete URL"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {urls.length === 0 && (
                                        <tr><td colSpan={6} style={{ textAlign: "center", color: "#9ca3af", padding: 32 }}>No URLs found</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {pages > 1 && (
                <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 16 }}>
                    <button className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={14} /> Prev</button>
                    <span style={{ display: "flex", alignItems: "center", fontSize: 13, fontWeight: 600 }}>Page {page} of {pages}</span>
                    <button className="btn btn-outline btn-sm" disabled={page >= pages} onClick={() => setPage(p => p + 1)}>Next <ChevronRight size={14} /></button>
                </div>
            )}

            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
