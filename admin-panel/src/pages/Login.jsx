import { useState } from "react";
import api from "../api";
import { LogIn } from "lucide-react";

export default function Login({ onLogin }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const loginRes = await api.post("/user/login", { email, password });
            const { token, user } = loginRes.data;

            if (!user || user.role !== "ADMIN") {
                setError("Access denied. Admin only.");
                setLoading(false);
                return;
            }

            // Store token for future requests
            if (token) {
                localStorage.setItem("admin_token", token);
            }

            onLogin(user);
        } catch (err) {
            setError(err.response?.data?.error || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-card">
                <div style={{ textAlign: "center", marginBottom: 28 }}>
                    <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0B1736" }}>
                        Cli<span style={{ color: "#EE6123" }}>q</span>
                    </h1>
                    <p style={{ fontSize: 12, fontWeight: 700, color: "#EE6123", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 4 }}>
                        Admin Panel
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#0B1736", marginBottom: 4 }}>Email</label>
                    <input
                        type="email"
                        className="input-field"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@example.com"
                        required
                        style={{ marginBottom: 14 }}
                    />

                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#0B1736", marginBottom: 4 }}>Password</label>
                    <input
                        type="password"
                        className="input-field"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        style={{ marginBottom: 20 }}
                    />

                    {error && (
                        <p style={{ color: "#ef4444", fontSize: 13, fontWeight: 600, marginBottom: 14, textAlign: "center" }}>{error}</p>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        style={{ width: "100%", justifyContent: "center", padding: "12px", fontSize: 14 }}
                    >
                        <LogIn size={16} /> {loading ? "Signing in..." : "Sign in"}
                    </button>
                </form>
            </div>
        </div>
    );
}
