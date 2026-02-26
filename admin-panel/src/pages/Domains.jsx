import { useState, useEffect } from "react";
import api from "../api";
import { Globe, CheckCircle, XCircle, Clock, Trash2, RefreshCw } from "lucide-react";

export default function Domains() {
    const [domains, setDomains] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("");
    const [actionLoading, setActionLoading] = useState(null);

    const fetchDomains = () => {
        setLoading(true);
        const params = filter ? `?status=${filter}` : "";
        api.get(`/admin/domains${params}`)
            .then((res) => setDomains(res.data.domains || []))
            .catch((err) => console.error("Fetch domains error:", err))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchDomains(); }, [filter]);

    const handleApprove = async (id) => {
        setActionLoading(id);
        try {
            await api.put(`/admin/domains/${id}/approve`);
            fetchDomains();
        } catch (err) {
            alert("Failed to approve");
        }
        setActionLoading(null);
    };

    const handleReject = async (id) => {
        setActionLoading(id);
        try {
            await api.put(`/admin/domains/${id}/reject`);
            fetchDomains();
        } catch (err) {
            alert("Failed to reject");
        }
        setActionLoading(null);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this domain?")) return;
        try {
            await api.delete(`/admin/domains/${id}`);
            fetchDomains();
        } catch (err) {
            alert("Failed to delete");
        }
    };

    const statusBadge = (status) => {
        switch (status) {
            case "PENDING":
                return <span className="badge" style={{ background: "#FFF8F0", color: "#f59e0b" }}>Pending</span>;
            case "PENDING_APPROVAL":
                return <span className="badge" style={{ background: "#FFF2E8", color: "#EE6123" }}>Awaiting Approval</span>;
            case "VERIFIED":
                return <span className="badge badge-active">Verified</span>;
            case "REJECTED":
                return <span className="badge badge-suspended">Rejected</span>;
            default:
                return <span className="badge">{status}</span>;
        }
    };

    const pendingCount = domains.filter((d) => d.status === "PENDING_APPROVAL").length;

    return (
        <div>
            <div className="flex-between mb-6">
                <div>
                    <h1 className="font-extrabold" style={{ fontSize: 24 }}>
                        <Globe size={22} style={{ verticalAlign: "text-bottom", marginRight: 8 }} />
                        Domain Management
                    </h1>
                    <p className="text-muted text-sm" style={{ marginTop: 4 }}>
                        Review and approve user domain verification requests
                    </p>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    {pendingCount > 0 && (
                        <span style={{
                            background: "#EE6123", color: "#fff", padding: "4px 12px",
                            borderRadius: 20, fontSize: 12, fontWeight: 700
                        }}>
                            {pendingCount} pending
                        </span>
                    )}
                    <button className="btn btn-outline" onClick={fetchDomains}>
                        <RefreshCw size={14} /> Refresh
                    </button>
                </div>
            </div>

            {/* Filter tabs */}
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                {["", "PENDING_APPROVAL", "VERIFIED", "REJECTED", "PENDING"].map((f) => (
                    <button
                        key={f}
                        className={`btn btn-sm ${filter === f ? "btn-primary" : "btn-outline"}`}
                        onClick={() => setFilter(f)}
                    >
                        {f === "" ? "All" : f === "PENDING_APPROVAL" ? "Awaiting Approval" : f === "VERIFIED" ? "Verified" : f === "REJECTED" ? "Rejected" : "Pending"}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="loading-center"><p className="text-muted">Loading domains...</p></div>
            ) : domains.length === 0 ? (
                <div className="card" style={{ textAlign: "center", padding: 40 }}>
                    <Globe size={40} style={{ color: "#D1D5DB", margin: "0 auto 12px" }} />
                    <p className="text-muted">No domains found</p>
                </div>
            ) : (
                <div className="card" style={{ padding: 0 }}>
                    <div className="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>Domain</th>
                                    <th>Owner</th>
                                    <th>Status</th>
                                    <th>Added</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {domains.map((d) => (
                                    <tr key={d._id}>
                                        <td>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                <Globe size={14} style={{ color: "#EE6123" }} />
                                                <strong>{d.domain}</strong>
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{ fontSize: 13 }}>
                                                {d.user?.name || "Unknown"}
                                            </span>
                                            <br />
                                            <span className="text-muted text-xs">{d.user?.email || ""}</span>
                                        </td>
                                        <td>{statusBadge(d.status)}</td>
                                        <td className="text-sm text-muted">
                                            {new Date(d.createdAt).toLocaleDateString("en-IN")}
                                        </td>
                                        <td>
                                            <div style={{ display: "flex", gap: 6 }}>
                                                {(d.status === "PENDING_APPROVAL" || d.status === "PENDING") && (
                                                    <>
                                                        <button
                                                            className="btn btn-sm btn-success"
                                                            onClick={() => handleApprove(d._id)}
                                                            disabled={actionLoading === d._id}
                                                        >
                                                            <CheckCircle size={13} /> Approve
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-danger"
                                                            onClick={() => handleReject(d._id)}
                                                            disabled={actionLoading === d._id}
                                                        >
                                                            <XCircle size={13} /> Reject
                                                        </button>
                                                    </>
                                                )}
                                                {d.status === "REJECTED" && (
                                                    <button
                                                        className="btn btn-sm btn-success"
                                                        onClick={() => handleApprove(d._id)}
                                                        disabled={actionLoading === d._id}
                                                    >
                                                        <CheckCircle size={13} /> Approve
                                                    </button>
                                                )}
                                                <button
                                                    className="btn btn-sm btn-danger"
                                                    onClick={() => handleDelete(d._id)}
                                                    style={{ border: "none" }}
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
