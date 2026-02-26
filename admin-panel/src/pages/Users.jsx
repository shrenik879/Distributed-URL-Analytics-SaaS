import { useEffect, useState } from "react";
import api from "../api";
import { Search, Shield, ShieldOff, Trash2, Ban, CheckCircle, Loader2, ChevronLeft, ChevronRight } from "lucide-react";

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(1);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [acting, setActing] = useState(null);

    const fetchUsers = () => {
        setLoading(true);
        setError("");
        const params = { page, limit: 15 };
        if (search) params.search = search;
        if (roleFilter) params.role = roleFilter;
        if (statusFilter) params.status = statusFilter;

        api.get("/admin/users", { params })
            .then((r) => {
                setUsers(r.data?.users || []);
                setTotal(r.data?.total || 0);
                setPages(r.data?.pages || 1);
            })
            .catch((err) => {
                console.error(err);
                setError(err.response?.data?.error || "Failed to load users");
                setUsers([]);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchUsers(); }, [page, roleFilter, statusFilter]);

    const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchUsers(); };

    const toggleRole = async (id, currentRole) => {
        setActing(id);
        try {
            const newRole = currentRole === "ADMIN" ? "NORMAL" : "ADMIN";
            await api.put(`/admin/users/${id}/role`, { role: newRole });
            fetchUsers();
        } catch (err) { console.error(err); }
        setActing(null);
    };

    const toggleStatus = async (id, currentStatus) => {
        setActing(id);
        try {
            const newStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
            await api.put(`/admin/users/${id}/status`, { status: newStatus });
            fetchUsers();
        } catch (err) { console.error(err); }
        setActing(null);
    };

    const deleteUser = async (id, name) => {
        if (!window.confirm(`Delete user "${name}" and all their URLs?`)) return;
        setActing(id);
        try {
            await api.delete(`/admin/users/${id}`);
            fetchUsers();
        } catch (err) { console.error(err); }
        setActing(null);
    };

    return (
        <div>
            <div className="flex-between mb-6">
                <h1 style={{ fontSize: 24, fontWeight: 800 }}>User Management</h1>
                <span className="text-muted text-sm">{total} users total</span>
            </div>

            {/* Filters */}
            <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
                <form onSubmit={handleSearch} style={{ display: "flex", gap: 8, flex: 1, minWidth: 200 }}>
                    <div style={{ position: "relative", flex: 1 }}>
                        <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
                        <input
                            className="input-field"
                            placeholder="Search by name or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ paddingLeft: 34 }}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary btn-sm">Search</button>
                </form>

                <select className="input-field" style={{ width: 140 }} value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}>
                    <option value="">All Roles</option>
                    <option value="ADMIN">Admin</option>
                    <option value="NORMAL">Normal</option>
                </select>

                <select className="input-field" style={{ width: 160 }} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
                    <option value="">All Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="SUSPENDED">Suspended</option>
                </select>
            </div>

            {/* Error */}
            {error && (
                <div style={{ textAlign: "center", padding: 32, color: "#ef4444", fontWeight: 600 }}>
                    {error}
                    <br />
                    <button className="btn btn-primary mt-4" onClick={fetchUsers}>Retry</button>
                </div>
            )}

            {/* Table */}
            {!error && (
                <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                    {loading ? (
                        <div className="loading-center"><Loader2 size={24} style={{ animation: "spin 1s linear infinite" }} /></div>
                    ) : (
                        <div className="table-wrap">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Name</th><th>Email</th><th>Role</th><th>Plan</th><th>Status</th><th>Joined</th><th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((u) => (
                                        <tr key={u._id}>
                                            <td style={{ fontWeight: 600 }}>{u.name}</td>
                                            <td style={{ fontSize: 12, color: "#6b7280" }}>{u.email}</td>
                                            <td><span className={`badge ${u.role === "ADMIN" ? "badge-admin" : "badge-normal"}`}>{u.role}</span></td>
                                            <td><span className="badge badge-normal">{u.plan || "FREE"}</span></td>
                                            <td><span className={`badge ${(u.status || "ACTIVE") === "ACTIVE" ? "badge-active" : "badge-suspended"}`}>{u.status || "ACTIVE"}</span></td>
                                            <td style={{ fontSize: 12, color: "#9ca3af" }}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}</td>
                                            <td>
                                                <div style={{ display: "flex", gap: 4 }}>
                                                    <button
                                                        className={`btn btn-sm ${u.role === "ADMIN" ? "btn-warning" : "btn-success"}`}
                                                        onClick={() => toggleRole(u._id, u.role)}
                                                        disabled={acting === u._id}
                                                        title={u.role === "ADMIN" ? "Demote to Normal" : "Promote to Admin"}
                                                    >
                                                        {u.role === "ADMIN" ? <ShieldOff size={12} /> : <Shield size={12} />}
                                                    </button>
                                                    <button
                                                        className={`btn btn-sm ${(u.status || "ACTIVE") === "ACTIVE" ? "btn-warning" : "btn-success"}`}
                                                        onClick={() => toggleStatus(u._id, u.status || "ACTIVE")}
                                                        disabled={acting === u._id}
                                                        title={(u.status || "ACTIVE") === "ACTIVE" ? "Suspend" : "Activate"}
                                                    >
                                                        {(u.status || "ACTIVE") === "ACTIVE" ? <Ban size={12} /> : <CheckCircle size={12} />}
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-danger"
                                                        onClick={() => deleteUser(u._id, u.name)}
                                                        disabled={acting === u._id}
                                                        title="Delete user"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {users.length === 0 && (
                                        <tr><td colSpan={7} style={{ textAlign: "center", color: "#9ca3af", padding: 32 }}>No users found</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Pagination */}
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
