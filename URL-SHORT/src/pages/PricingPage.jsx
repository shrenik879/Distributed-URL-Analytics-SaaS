import { useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/ui/Toast";
import api from "../api/axios";
import { Check, ArrowRight, Loader2, Globe, ChevronDown, Crown, Zap, Star } from "lucide-react";

const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;

const PLAN_ORDER = ["FREE", "CORE", "GROWTH", "PREMIUM"];

const PLANS = [
    {
        id: "FREE", name: "Free", badge: "With ads", price: "₹0", priceNum: 0, period: "/month",
        desc: "Try it out for free",
        features: ["2 QR Codes/month", "5 links/month", "2 custom pages", "Basic analytics", "QR customizations"],
        cta: "Get Started", style: "btn-secondary", highlighted: false,
    },
    {
        id: "CORE", name: "Core", price: "₹849", priceNum: 849, period: "/month", annual: "₹10,188/year",
        desc: "Unlock powerful data", sub: "Everything in Free, plus:",
        features: ["5 QR Codes/month", "100 links/month", "5 custom pages", "30 days click data", "Advanced QR"],
        cta: "Get Started", style: "btn-secondary", highlighted: false,
    },
    {
        id: "GROWTH", name: "Growth", badge: "Recommended", price: "₹2,399", priceNum: 2399, period: "/month", annual: "₹28,788/year",
        desc: "Brand experiences", sub: "Everything in Core, plus:",
        features: ["10 QR Codes/month", "500 links/month", "10 custom pages", "4 months data", "Branded links"],
        cta: "Get Started", style: "btn-primary", highlighted: true,
    },
    {
        id: "PREMIUM", name: "Premium", price: "₹16,499", priceNum: 16499, period: "/month", annual: "₹1,97,988/year",
        desc: "Scale your connections", sub: "Everything in Growth, plus:",
        features: ["200 QR Codes/month", "3,000 links/month", "20 custom pages", "1 year data", "Custom campaigns"],
        cta: "Get Started", style: "btn-secondary", highlighted: false,
    },
];

export default function PricingPage() {
    const { user, setUser } = useAuth();
    const { addToast } = useToast();
    const location = useLocation();
    const [loadingPlan, setLoadingPlan] = useState(null);
    const userPlan = user?.plan || "FREE";

    // If user is already logged in and navigates to the public /pricing page,
    // redirect them to the dashboard pricing page for a seamless experience
    if (user && !location.pathname.startsWith("/dashboard")) {
        return <Navigate to="/dashboard/pricing" replace />;
    }

    const handleUpgrade = async (planId) => {
        if (!user) return (window.location.href = "/login?redirect=/dashboard/pricing");
        if (planId === "FREE") return (window.location.href = "/dashboard");
        if (PLAN_ORDER.indexOf(planId) <= PLAN_ORDER.indexOf(userPlan)) {
            return addToast("You already have this plan or a higher one", "error");
        }
        setLoadingPlan(planId);
        try {
            const res = await api.post("/payment/create-order", { plan: planId });
            const { orderId, amount, currency } = res.data;

            if (res.data.demo) {
                try {
                    await api.post("/payment/verify", { razorpay_order_id: orderId, razorpay_payment_id: `demo_pay_${Date.now()}`, razorpay_signature: "demo", plan: planId });
                    addToast(`Successfully upgraded to ${planId}! 🎉`);
                    const meRes = await api.get("/user/me");
                    setUser(meRes.data.user);
                } catch { addToast("Upgrade failed", "error"); }
                setLoadingPlan(null);
                return;
            }

            const options = {
                key: RAZORPAY_KEY, amount, currency, name: "Cliq", description: `Upgrade to ${planId} Plan`, order_id: orderId,
                handler: async (response) => {
                    try {
                        await api.post("/payment/verify", { ...response, plan: planId });
                        addToast(`Successfully upgraded to ${planId}! 🎉`);
                        const meRes = await api.get("/user/me");
                        setUser(meRes.data.user);
                    } catch { addToast("Payment verification failed", "error"); }
                    setLoadingPlan(null);
                },
                modal: { ondismiss: () => setLoadingPlan(null) },
                prefill: { email: user?.email || "" },
                theme: { color: "#EE6123" },
            };
            new window.Razorpay(options).open();
        } catch {
            addToast("Failed to initiate payment", "error");
            setLoadingPlan(null);
        }
    };

    return (
        <div className="min-h-screen bg-cream">
            {/* ═══ NAVBAR ═══ */}
            <nav className="bg-navy sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
                    <Link to="/" className="text-white text-xl font-extrabold tracking-tight">Cliq</Link>
                    <div className="flex items-center gap-3">
                        <Link to="/" className="text-white/70 hover:text-white text-sm font-medium transition">Home</Link>
                        {user ? (
                            <Link to="/dashboard" className="nav-cta-primary inline-flex whitespace-nowrap">Dashboard</Link>
                        ) : (
                            <>
                                <Link to="/login" className="text-white/70 hover:text-white text-sm font-medium transition hidden sm:inline-flex whitespace-nowrap">Log in</Link>
                                <Link to="/signup" className="nav-cta-signup inline-flex whitespace-nowrap">Sign up Free</Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* ═══ HEADER ═══ */}
            <div className="bg-navy text-white text-center py-14 sm:py-20">
                <div className="max-w-3xl mx-auto px-4">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
                        Pick the plan that's right for you
                    </h1>
                    <p className="text-white/60 text-sm sm:text-base max-w-xl mx-auto">
                        Connect to your audience with branded links, QR Codes, and landing pages.
                    </p>
                    {user && userPlan !== "FREE" && (
                        <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20">
                            <Crown size={14} className="text-orange" />
                            <span className="text-sm font-semibold">{userPlan} plan active</span>
                        </div>
                    )}
                </div>
            </div>

            {/* ═══ PLAN CARDS ═══ */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-8 sm:-mt-12 pb-16">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    {PLANS.map((p) => {
                        const isCurrent = user && p.id === userPlan;
                        const isLower = user && PLAN_ORDER.indexOf(p.id) < PLAN_ORDER.indexOf(userPlan);
                        const isLoading = loadingPlan === p.id;

                        return (
                            <div key={p.id} className={`card card-hover-lift p-4 sm:p-5 text-left relative ${p.highlighted && !isCurrent ? "border-2 border-orange ring-2 ring-orange/10" : ""} ${isCurrent ? "border-2 border-navy ring-2 ring-navy/10" : ""}`}>
                                {/* Badge */}
                                {isCurrent ? (
                                    <span className="absolute -top-3 left-4 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-navy text-white">Current Plan</span>
                                ) : p.badge && (
                                    <span className={`absolute -top-3 left-4 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${p.highlighted ? "bg-orange text-white" : "bg-gray-200 text-navy"}`}>{p.badge}</span>
                                )}

                                <h3 className="text-base sm:text-lg font-bold text-navy">{p.name}</h3>
                                <div className="flex items-baseline gap-1 my-2">
                                    <span className="text-2xl sm:text-3xl font-extrabold text-navy">{p.price}</span>
                                    <span className="text-xs text-warm-gray">{p.period}</span>
                                </div>
                                {p.annual && <p className="text-[10px] text-warm-gray mb-3">({p.annual})</p>}

                                {/* CTA */}
                                {isCurrent ? (
                                    <div className="w-full mb-4 text-xs sm:text-sm py-2.5 rounded-xl text-center font-semibold bg-gray-100 text-warm-gray cursor-default">Current Plan</div>
                                ) : isLower ? (
                                    <div className="w-full mb-4 text-xs sm:text-sm py-2.5 rounded-xl text-center font-semibold bg-gray-50 text-warm-gray/60 cursor-default">Included in your plan</div>
                                ) : (
                                    <button onClick={() => handleUpgrade(p.id)} disabled={isLoading} className={`${p.style} w-full mb-4 text-xs sm:text-sm`}>
                                        {isLoading ? <Loader2 size={14} className="animate-spin" /> : <>{p.cta} <ArrowRight size={14} /></>}
                                    </button>
                                )}

                                <p className="text-xs font-semibold text-navy mb-1">{p.desc}</p>
                                {p.sub && <p className="text-[10px] text-warm-gray italic mb-2">{p.sub}</p>}
                                <ul className="space-y-1.5">
                                    {p.features.map((f, j) => (
                                        <li key={j} className="flex items-center gap-2 text-[11px] sm:text-xs text-warm-gray"><Check size={12} className="text-emerald-500 shrink-0" />{f}</li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })}
                </div>

                {/* All plans include */}
                <div className="mt-10 text-center">
                    <div className="card p-6 inline-block max-w-2xl mx-auto">
                        <div className="flex items-center justify-center gap-2 mb-3">
                            <Star size={16} className="text-orange" />
                            <h3 className="text-sm font-bold text-navy">All plans include</h3>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {["Click tracking", "Link management", "QR generation", "Mobile friendly"].map((f) => (
                                <div key={f} className="flex items-center gap-1.5 text-xs text-warm-gray">
                                    <Check size={12} className="text-emerald-500" />
                                    {f}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══ FOOTER ═══ */}
            <footer className="bg-navy text-white py-8">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
                    <Link to="/" className="text-xl font-extrabold tracking-tight">Cliq</Link>
                    <p className="text-white/40 text-xs mt-2">© 2025 Cliq. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
