import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/ui/Toast";
import api from "../../api/axios";
import { Check, Crown, ArrowRight, Loader2, Zap, Star } from "lucide-react";

const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;

const PLANS = [
    {
        id: "FREE",
        name: "Free",
        price: 0,
        period: "/month",
        description: "For individuals just getting started",
        features: [
            "5 short links/month",
            "2 QR codes/month",
            "1 landing page",
            "Basic analytics",
            "Cliq-branded links",
        ],
        cta: "Current Plan",
        color: "#6b7280",
        popular: false,
    },
    {
        id: "CORE",
        name: "Core",
        price: 849,
        period: "/month",
        description: "For creators & small teams",
        features: [
            "100 short links/month",
            "5 QR codes/month",
            "5 landing pages",
            "Full analytics",
            "Custom aliases",
            "Priority support",
        ],
        cta: "Upgrade to Core",
        color: "#3b82f6",
        popular: false,
    },
    {
        id: "GROWTH",
        name: "Growth",
        price: 2399,
        period: "/month",
        description: "For growing businesses",
        features: [
            "500 short links/month",
            "10 QR codes/month",
            "10 landing pages",
            "Full analytics",
            "Custom aliases",
            "Custom domains",
            "Team collaboration",
            "Priority support",
        ],
        cta: "Upgrade to Growth",
        color: "#EE6123",
        popular: true,
    },
    {
        id: "PREMIUM",
        name: "Premium",
        price: 16499,
        period: "/month",
        description: "For enterprises & agencies",
        features: [
            "3,000 short links/month",
            "200 QR codes/month",
            "20 landing pages",
            "Advanced analytics",
            "Custom aliases",
            "Custom domains",
            "Dedicated support",
            "SSO & API access",
            "White-label options",
        ],
        cta: "Upgrade to Premium",
        color: "#8b5cf6",
        popular: false,
    },
];

export default function Pricing() {
    const { user, setUser } = useAuth();
    const { addToast } = useToast();
    const [loadingPlan, setLoadingPlan] = useState(null);
    const currentPlan = user?.plan || "FREE";

    const handleUpgrade = async (planId) => {
        if (planId === currentPlan) return;
        setLoadingPlan(planId);
        try {
            const res = await api.post("/payment/create-order", { plan: planId });
            const { orderId, amount, currency } = res.data;

            // Demo mode — no real Razorpay keys
            if (res.data.demo) {
                try {
                    await api.post("/payment/verify", {
                        razorpay_order_id: orderId,
                        razorpay_payment_id: `demo_pay_${Date.now()}`,
                        razorpay_signature: "demo",
                        plan: planId,
                    });
                    addToast(`Successfully upgraded to ${planId}! 🎉`);
                    const meRes = await api.get("/user/me");
                    setUser(meRes.data.user);
                } catch {
                    addToast("Upgrade failed", "error");
                }
                setLoadingPlan(null);
                return;
            }

            // Real Razorpay payment
            const options = {
                key: RAZORPAY_KEY,
                amount,
                currency,
                name: "Cliq",
                description: `Upgrade to ${planId} Plan`,
                order_id: orderId,
                handler: async (response) => {
                    try {
                        await api.post("/payment/verify", {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            plan: planId,
                        });
                        addToast(`Successfully upgraded to ${planId}! 🎉`);
                        const meRes = await api.get("/user/me");
                        setUser(meRes.data.user);
                    } catch {
                        addToast("Payment verification failed", "error");
                    }
                    setLoadingPlan(null);
                },
                modal: { ondismiss: () => setLoadingPlan(null) },
                prefill: { email: user?.email || "" },
                theme: { color: "#EE6123" },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch {
            addToast("Failed to initiate payment", "error");
            setLoadingPlan(null);
        }
    };

    return (
        <div className="max-w-5xl mx-auto animate-fade-in">
            {/* Header */}
            <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-orange text-xs font-bold mb-4">
                    <Zap size={12} /> PRICING
                </div>
                <h1 className="text-3xl font-extrabold text-navy mb-2">
                    Create more with the Cliq Platform
                </h1>
                <p className="text-sm text-warm-gray max-w-lg mx-auto">
                    Upgrade to unlock more short links, QR codes, landing pages, and advanced analytics.
                </p>
            </div>

            {/* Plan Cards */}
            <div className="grid md:grid-cols-4 gap-4">
                {PLANS.map((plan) => {
                    const isCurrent = plan.id === currentPlan;
                    const isDowngrade = PLANS.findIndex(p => p.id === plan.id) < PLANS.findIndex(p => p.id === currentPlan);
                    const isLoading = loadingPlan === plan.id;

                    return (
                        <div
                            key={plan.id}
                            className={`relative rounded-2xl border-2 bg-white p-6 flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${plan.popular
                                    ? "border-orange shadow-md"
                                    : isCurrent
                                        ? "border-navy"
                                        : "border-border"
                                }`}
                        >
                            {/* Popular badge */}
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <span className="px-3 py-1 rounded-full bg-orange text-white text-[10px] font-bold uppercase tracking-wider">
                                        Recommended
                                    </span>
                                </div>
                            )}

                            {/* Current badge */}
                            {isCurrent && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <span className="px-3 py-1 rounded-full bg-navy text-white text-[10px] font-bold uppercase tracking-wider">
                                        Current Plan
                                    </span>
                                </div>
                            )}

                            {/* Plan name */}
                            <h3 className="text-lg font-bold text-navy mt-2">{plan.name}</h3>

                            {/* Price */}
                            <div className="mt-3 mb-1">
                                {plan.price === 0 ? (
                                    <p className="text-3xl font-extrabold text-navy">Free</p>
                                ) : (
                                    <p className="text-navy">
                                        <span className="text-3xl font-extrabold">₹{plan.price.toLocaleString()}</span>
                                        <span className="text-sm text-warm-gray">{plan.period}</span>
                                    </p>
                                )}
                            </div>
                            <p className="text-xs text-warm-gray mb-5">{plan.description}</p>

                            {/* Features */}
                            <ul className="space-y-2.5 mb-6 flex-1">
                                {plan.features.map((f, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-navy">
                                        <Check size={14} className="shrink-0 mt-0.5" style={{ color: plan.color }} />
                                        <span>{f}</span>
                                    </li>
                                ))}
                            </ul>

                            {/* CTA */}
                            {isCurrent ? (
                                <div className="w-full py-2.5 rounded-xl text-center text-sm font-semibold bg-gray-100 text-warm-gray cursor-default">
                                    Current Plan
                                </div>
                            ) : isDowngrade ? (
                                <div className="w-full py-2.5 rounded-xl text-center text-sm font-semibold bg-gray-50 text-warm-gray-light cursor-default">
                                    Included in your plan
                                </div>
                            ) : (
                                <button
                                    onClick={() => handleUpgrade(plan.id)}
                                    disabled={isLoading}
                                    className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${plan.popular
                                            ? "bg-orange text-white hover:bg-orange-hover shadow-sm hover:shadow-md"
                                            : "border-2 text-navy hover:bg-gray-50"
                                        }`}
                                    style={!plan.popular ? { borderColor: plan.color, color: plan.color } : {}}
                                >
                                    {isLoading ? (
                                        <Loader2 size={14} className="animate-spin" />
                                    ) : (
                                        <>
                                            {plan.cta} <ArrowRight size={14} />
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Feature comparison footer */}
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
    );
}
