import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) return setError("All fields are required");
    if (password.length < 6) return setError("Password must be at least 6 characters");
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/user", { name, email, password });
      if (res.status === 201) navigate("/login");
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = useGoogleLogin({
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
        navigate("/dashboard");
      } catch {
        setError("Google signup failed. Try again.");
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => setError("Google signup failed."),
  });

  return (
    <div className="min-h-screen flex">
      {/* ── LEFT: Form panel ── */}
      <div className="flex flex-col justify-center px-8 sm:px-14 lg:px-20 w-full lg:w-[52%] bg-white">
        {/* Logo */}
        <Link to="/" className="mb-10 inline-block">
          <span className="text-5xl font-black tracking-tight" style={{ color: "#1a2744" }}>Cli</span><span className="text-5xl font-black tracking-tight" style={{ color: "#EE6123" }}>q</span>
        </Link>

        <h1 className="text-4xl font-extrabold text-navy mb-1">Create your account</h1>
        <p className="text-sm text-warm-gray mb-8">
          Already have an account?{" "}
          <Link to="/login" className="text-orange font-semibold hover:underline">Log in</Link>
        </p>

        {error && (
          <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Google */}
        <button
          onClick={() => handleGoogleSignup()}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-navy hover:bg-gray-50 transition-all duration-200 mb-5 shadow-sm"
        >
          {googleLoading ? <Loader2 size={18} className="animate-spin" /> : <GoogleSVG />}
          {googleLoading ? "Signing up…" : "Continue with Google"}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-5">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-xs font-semibold text-warm-gray-light uppercase tracking-widest">or</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        {/* Form */}
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-navy mb-1.5">Full name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              placeholder="John Doe"
              autoComplete="name"
            />
          </div>
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
            <label className="block text-sm font-semibold text-navy mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pr-10"
                placeholder="Min 6 characters"
                autoComplete="new-password"
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
            {loading ? "Creating account…" : "Create free account"}
          </button>
        </form>

        <p className="mt-5 text-xs text-warm-gray-light text-center leading-relaxed">
          By creating an account, you agree to our{" "}
          <Link to="/" className="underline hover:text-navy">Terms of Service</Link>{" "}
          and{" "}
          <Link to="/" className="underline hover:text-navy">Privacy Policy</Link>.
        </p>
      </div>

      {/* ── RIGHT: Illustration panel ── */}
      <div
        className="hidden lg:flex flex-col items-center justify-center flex-1 relative overflow-hidden"
        style={{ background: "linear-gradient(145deg, #fff7f2 0%, #fde8d8 60%, #fbd5bc 100%)" }}
      >
        {/* Decorative blobs */}
        <div className="absolute top-8 right-10 w-20 h-20 rounded-full opacity-20" style={{ background: "#EE6123" }} />
        <div className="absolute bottom-12 left-8 w-14 h-14 rounded-full opacity-15" style={{ background: "#1a2744" }} />
        <div className="absolute top-1/3 left-4 w-3 h-3 rounded-full opacity-30" style={{ background: "#EE6123" }} />
        <div className="absolute bottom-10 right-10 opacity-10 text-4xl font-black" style={{ color: "#1a2744" }}>✦</div>

        {/* Inline SVG illustration – signup/profile creation themed */}
        <svg
          viewBox="0 0 360 300"
          className="w-[340px] max-w-[80%] drop-shadow-xl"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Person silhouette */}
          <circle cx="180" cy="95" r="38" fill="#1a2744" opacity="0.9" />
          <circle cx="180" cy="95" r="28" fill="#EE6123" opacity="0.25" />
          {/* Person icon */}
          <circle cx="180" cy="88" r="14" fill="white" opacity="0.9" />
          <path d="M152,130 Q180,108 208,130" fill="white" opacity="0.85" />
          {/* Card / profile form */}
          <rect x="60" y="145" width="240" height="120" rx="14" fill="white" opacity="0.9" />
          <rect x="60" y="145" width="240" height="120" rx="14" fill="none" stroke="#EE6123" strokeWidth="1.5" opacity="0.3" />
          {/* Form fields */}
          <rect x="82" y="168" width="196" height="11" rx="5.5" fill="#f0f0f0" />
          <rect x="82" y="168" width="70" height="11" rx="5.5" fill="#EE6123" opacity="0.5" />
          <rect x="82" y="191" width="196" height="11" rx="5.5" fill="#f0f0f0" />
          <rect x="82" y="191" width="110" height="11" rx="5.5" fill="#1a2744" opacity="0.2" />
          <rect x="82" y="214" width="196" height="11" rx="5.5" fill="#f0f0f0" />
          <rect x="82" y="214" width="55" height="11" rx="5.5" fill="#EE6123" opacity="0.35" />
          {/* Submit button */}
          <rect x="82" y="237" width="196" height="18" rx="9" fill="#EE6123" opacity="0.95" />
          <rect x="130" y="242" width="100" height="8" rx="4" fill="white" opacity="0.5" />
          {/* Floating sparkle top-right */}
          <g transform="translate(285,55)">
            <polygon points="10,0 12,8 20,10 12,12 10,20 8,12 0,10 8,8" fill="#EE6123" opacity="0.7" />
          </g>
          {/* Floating check badge */}
          <g transform="translate(30,160)">
            <circle cx="14" cy="14" r="14" fill="#EE6123" opacity="0.15" />
            <polyline points="8,14 12,18 20,10" fill="none" stroke="#EE6123" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </g>
          {/* Floating rocket */}
          <g transform="translate(300,220)">
            <circle cx="16" cy="16" r="14" fill="#1a2744" opacity="0.12" />
            <text x="8" y="22" fontSize="16">🚀</text>
          </g>
        </svg>

        <p className="mt-6 text-base font-bold text-center max-w-xs leading-snug" style={{ color: "#1a2744" }}>
          Power your links, QR codes &amp; landing pages
        </p>
        <p className="mt-2 text-sm text-center max-w-xs" style={{ color: "#7a5c4e" }}>
          Join thousands of creators growing their digital presence with Cliq
        </p>

        {/* Feature pills */}
        <div className="flex gap-3 mt-5 flex-wrap justify-center">
          {["🔗 Smart links", "📊 Analytics", "📱 QR Codes", "🚀 Pages"].map((feat) => (
            <span
              key={feat}
              className="px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm"
              style={{ background: "rgba(255,255,255,0.8)", color: "#1a2744" }}
            >
              {feat}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
