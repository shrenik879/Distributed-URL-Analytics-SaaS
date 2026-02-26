import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Eye, EyeOff, Loader2 } from "lucide-react";

const GoogleSVG = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectUrl = new URLSearchParams(location.search).get("redirect") || "/dashboard";

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return setError("All fields are required");
    setError("");
    setLoading(true);
    try {
      await api.post("/user/login", { email, password });
      const res = await api.get("/user/me");
      setUser(res.data.user);
      navigate(redirectUrl);
    } catch {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    flow: "implicit",
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      try {
        const gRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const gUser = await gRes.json();
        await api.post("/user/google-login", { credential: null, googleUser: gUser });
        const res = await api.get("/user/me");
        setUser(res.data.user);
        navigate(redirectUrl);
      } catch {
        setError("Google login failed. Try again.");
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => setError("Google login failed."),
  });

  return (
    <div className="min-h-screen flex">
      {/* ── LEFT: Form panel ── */}
      <div className="flex flex-col justify-center px-8 sm:px-14 lg:px-20 w-full lg:w-[52%] bg-white">
        {/* Logo */}
        <Link to="/" className="mb-10 inline-block">
          <span className="text-5xl font-black tracking-tight" style={{ color: "#1a2744" }}>Cli</span><span className="text-5xl font-black tracking-tight" style={{ color: "#EE6123" }}>q</span>
        </Link>

        <h1 className="text-4xl font-extrabold text-navy mb-1">Log in and start sharing</h1>
        <p className="text-sm text-warm-gray mb-8">
          Don't have an account?{" "}
          <Link to="/signup" className="text-orange font-semibold hover:underline">Sign up free</Link>
        </p>

        {error && (
          <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Google */}
        <button
          onClick={() => handleGoogleLogin()}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-navy hover:bg-gray-50 transition-all duration-200 mb-5 shadow-sm"
        >
          {googleLoading ? <Loader2 size={18} className="animate-spin" /> : <GoogleSVG />}
          {googleLoading ? "Signing in…" : "Continue with Google"}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-5">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-xs font-semibold text-warm-gray-light uppercase tracking-widest">or</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-navy mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-semibold text-navy">Password</label>
            </div>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pr-10"
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-gray-light hover:text-navy transition"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white transition-all duration-200 shadow-sm"
            style={{ background: loading ? "#d4510f" : "#EE6123" }}
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? "Logging in…" : "Log in"}
          </button>
        </form>
      </div>

      {/* ── RIGHT: Illustration panel ── */}
      <div
        className="hidden lg:flex flex-col items-center justify-center flex-1 relative overflow-hidden"
        style={{ background: "linear-gradient(145deg, #0f1c36 0%, #1a2f5e 60%, #1e3a6e 100%)" }}
      >
        {/* Decorative dots */}
        <div className="absolute top-8 right-10 w-3 h-3 rounded-full opacity-40" style={{ background: "#EE6123" }} />
        <div className="absolute top-24 left-12 w-2 h-2 rounded-full bg-white opacity-10" />
        <div className="absolute bottom-20 right-20 w-4 h-4 rounded-full opacity-20" style={{ background: "#EE6123" }} />
        <div className="absolute bottom-10 left-10 opacity-10 text-4xl font-black" style={{ color: "#EE6123" }}>+</div>
        <div className="absolute top-16 right-24 text-white opacity-10 text-5xl font-black">✦</div>
        <div className="absolute top-1/2 left-6 w-1 h-24 rounded-full opacity-10" style={{ background: "linear-gradient(to bottom, #EE6123, transparent)" }} />
        <div className="absolute top-1/3 right-8 w-1 h-16 rounded-full opacity-10" style={{ background: "linear-gradient(to bottom, transparent, #EE6123)" }} />

        {/* Inline SVG illustration – link/analytics themed */}
        <svg
          viewBox="0 0 360 300"
          className="w-[340px] max-w-[80%] drop-shadow-2xl"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Laptop body */}
          <rect x="60" y="80" width="240" height="155" rx="10" fill="#1e3a6e" stroke="#EE6123" strokeWidth="2" />
          <rect x="70" y="90" width="220" height="130" rx="6" fill="#0d1b35" />
          {/* Screen content – bar chart */}
          <rect x="95" y="175" width="18" height="30" rx="3" fill="#EE6123" opacity="0.9" />
          <rect x="123" y="155" width="18" height="50" rx="3" fill="#EE6123" opacity="0.7" />
          <rect x="151" y="140" width="18" height="65" rx="3" fill="#EE6123" opacity="0.9" />
          <rect x="179" y="160" width="18" height="45" rx="3" fill="#EE6123" opacity="0.6" />
          <rect x="207" y="145" width="18" height="60" rx="3" fill="#EE6123" opacity="0.8" />
          <rect x="235" y="130" width="18" height="75" rx="3" fill="#EE6123" opacity="1" />
          {/* Screen – chart axis */}
          <line x1="90" y1="210" x2="265" y2="210" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
          <line x1="90" y1="210" x2="90" y2="115" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
          {/* Screen – small URL pill */}
          <rect x="90" y="100" width="180" height="20" rx="5" fill="#EE6123" opacity="0.15" />
          <rect x="97" y="107" width="60" height="6" rx="3" fill="#EE6123" opacity="0.5" />
          <rect x="165" y="107" width="40" height="6" rx="3" fill="white" opacity="0.2" />
          {/* Laptop base */}
          <rect x="30" y="235" width="300" height="12" rx="6" fill="#1e3a6e" stroke="#EE6123" strokeWidth="1.5" />
          {/* Floating link chain */}
          <g transform="translate(270,60)">
            <rect x="0" y="0" width="42" height="18" rx="9" fill="none" stroke="#EE6123" strokeWidth="2.5" />
            <rect x="24" y="0" width="42" height="18" rx="9" fill="none" stroke="white" strokeWidth="2.5" opacity="0.4" />
          </g>
          {/* Floating QR icon */}
          <g transform="translate(28,48)">
            <rect width="34" height="34" rx="5" fill="#EE6123" opacity="0.15" />
            <rect x="5" y="5" width="10" height="10" rx="1" fill="#EE6123" opacity="0.7" />
            <rect x="19" y="5" width="10" height="10" rx="1" fill="#EE6123" opacity="0.7" />
            <rect x="5" y="19" width="10" height="10" rx="1" fill="#EE6123" opacity="0.7" />
            <rect x="21" y="21" width="4" height="4" rx="1" fill="white" opacity="0.4" />
          </g>
          {/* Floating upward arrow */}
          <g transform="translate(310,170)">
            <circle cx="18" cy="18" r="18" fill="#EE6123" opacity="0.15" />
            <polyline points="18,26 18,12 12,18" fill="none" stroke="#EE6123" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points="18,12 24,18" fill="none" stroke="#EE6123" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </svg>

        <p className="mt-6 text-base font-bold text-white text-center max-w-xs leading-snug">
          Shorten links, generate QR codes &amp; build landing pages
        </p>
        <p className="mt-2 text-sm text-center max-w-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
          Everything you need to power your digital presence
        </p>
      </div>
    </div>
  );
}
