import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/ui/Toast";
import api from "../../api/axios";
import { User, Mail, Shield, Calendar, LogOut, Loader2, CreditCard, Crown, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;

const PLANS = [
    { id: "FREE", name: "Free", price: "₹0", color: "bg-gray-100 text-navy" },
    { id: "CORE", name: "Core", price: "₹849/mo", color: "bg-blue-100 text-blue-700" },
    { id: "GROWTH", name: "Growth", price: "₹2,399/mo", color: "bg-orange-light text-orange" },
    { id: "PREMIUM", name: "Premium", price: "₹16,499/mo", color: "bg-purple-100 text-purple-700" },
];

export default function Settings() {
    const { user, logout, setUser } = useAuth();
    const { addToast } = useToast();

    // Change password
    const [oldPw, setOldPw] = useState("");
    const [newPw, setNewPw] = useState("");
    const [pwLoading, setPwLoading] = useState(false);
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);

    const isGoogleUser = !!user?.googleId;
    const currentPlan = PLANS.find((p) => p.id === (user?.plan || "FREE"));

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (!oldPw || !newPw) return addToast("Both fields are required", "error");
        if (newPw.length < 6) return addToast("New password must be at least 6 characters", "error");
        setPwLoading(true);
        try {
            await api.post("/user/change-password", { oldPassword: oldPw, newPassword: newPw });
            addToast("Password changed successfully!");
            setOldPw("");
            setNewPw("");
        } catch (err) {
            addToast(err.response?.data?.error || "Failed to change password", "error");
        } finally {
            setPwLoading(false);
        }
    };

    const handleUpgrade = async (planId) => {
        try {
            const res = await api.post("/payment/create-order", { plan: planId });
            const { orderId, amount, currency } = res.data;

            // Demo mode — no real Razorpay keys, just verify directly
            if (res.data.demo) {
                try {
                    await api.post("/payment/verify", {
                        razorpay_order_id: orderId,
                        razorpay_payment_id: `demo_pay_${Date.now()}`,
                        razorpay_signature: "demo",
                        plan: planId,
                    });
                    addToast(`Upgraded to ${planId}!`);
                    const meRes = await api.get("/user/me");
                    setUser(meRes.data.user);
                } catch {
                    addToast("Upgrade failed", "error");
                }
                return;
            }

            const options = {
                key: RAZORPAY_KEY,
                amount,
                currency,
                name: "Cliq",
                description: `Upgrade to ${planId}`,
                order_id: orderId,
                handler: async (response) => {
                    try {
                        await api.post("/payment/verify", {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            plan: planId,
                        });
                        addToast(`Upgraded to ${planId}!`);
                        const meRes = await api.get("/user/me");
                        setUser(meRes.data.user);
                    } catch {
                        addToast("Payment verification failed", "error");
                    }
                },
                prefill: { email: user?.email || "" },
                theme: { color: "#EE6123" },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch {
            addToast("Failed to initiate payment", "error");
        }
    };

    return (
        <div className="max-w-2xl mx-auto animate-fade-in">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-navy mb-1">Settings</h1>
                <p className="text-sm text-warm-gray">Manage your account and subscription.</p>
            </div>

            {/* Profile */}
            <div className="card p-6 space-y-5 mb-5">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-navy text-white flex items-center justify-center text-2xl font-bold uppercase">
                        {user?.name?.charAt(0) || "U"}
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-navy">{user?.name}</h2>
                        <p className="text-sm text-warm-gray">{user?.email}</p>
                    </div>
                    {isGoogleUser && (
                        <span className="ml-auto text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                            Google
                        </span>
                    )}
                </div>

                <div className="border-t border-border pt-5 space-y-3">
                    {[
                        { icon: User, label: "Full Name", value: user?.name },
                        { icon: Mail, label: "Email", value: user?.email },
                        { icon: Shield, label: "Role", value: user?.role },
                        { icon: Calendar, label: "Joined", value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—" },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-cream">
                            <item.icon size={16} className="text-warm-gray-light shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-[11px] text-warm-gray font-medium">{item.label}</p>
                                <p className="text-sm font-medium text-navy truncate">{item.value || "—"}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Plan & Billing */}
            <div className="card p-6 mb-5">
                <div className="flex items-center gap-2 mb-4">
                    <Crown size={16} className="text-orange" />
                    <h3 className="text-sm font-bold text-navy">Subscription Plan</h3>
                </div>

                <div className="flex items-center gap-3 mb-4">
                    <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${currentPlan?.color}`}>
                        {currentPlan?.name}
                    </span>
                    <span className="text-sm text-warm-gray">{currentPlan?.price}</span>
                </div>

                {(user?.plan === "FREE" || !user?.plan) ? (
                    <div className="grid grid-cols-3 gap-2">
                        {PLANS.filter((p) => p.id !== "FREE").map((p) => (
                            <button
                                key={p.id}
                                onClick={() => handleUpgrade(p.id)}
                                className="card p-3 text-center hover:shadow-lg transition group"
                            >
                                <p className="text-xs font-bold text-navy">{p.name}</p>
                                <p className="text-[10px] text-warm-gray">{p.price}</p>
                                <p className="text-[10px] text-orange opacity-0 group-hover:opacity-100 transition mt-1">
                                    Upgrade <ArrowRight size={10} className="inline" />
                                </p>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-100">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0">
                            <Crown size={14} />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-navy">{currentPlan?.name} plan active</p>
                            <p className="text-xs text-emerald-600">Your plan is active. Enjoy all {currentPlan?.name} features!</p>
                        </div>
                        <Link to="/dashboard/pricing" className="text-xs font-semibold text-orange hover:underline">
                            Manage
                        </Link>
                    </div>
                )}
            </div>

            {/* Change Password (non-Google users only) */}
            {!isGoogleUser && (
                <div className="card p-6 mb-5">
                    <div className="flex items-center gap-2 mb-4">
                        <Lock size={16} className="text-orange" />
                        <h3 className="text-sm font-bold text-navy">Change Password</h3>
                    </div>

                    <form onSubmit={handleChangePassword} className="space-y-3">
                        <div>
                            <label className="block text-xs font-semibold text-navy mb-1">Current Password</label>
                            <div className="relative">
                                <input
                                    type={showOld ? "text" : "password"}
                                    value={oldPw}
                                    onChange={(e) => setOldPw(e.target.value)}
                                    className="input-field pr-10"
                                    placeholder="••••••••"
                                />
                                <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-gray-light hover:text-navy transition">
                                    {showOld ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-navy mb-1">New Password</label>
                            <div className="relative">
                                <input
                                    type={showNew ? "text" : "password"}
                                    value={newPw}
                                    onChange={(e) => setNewPw(e.target.value)}
                                    className="input-field pr-10"
                                    placeholder="Min 6 characters"
                                />
                                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-gray-light hover:text-navy transition">
                                    {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                            </div>
                        </div>
                        <button type="submit" disabled={pwLoading} className="btn-primary text-sm">
                            {pwLoading && <Loader2 size={14} className="animate-spin" />}
                            {pwLoading ? "Updating..." : "Update Password"}
                        </button>
                    </form>
                </div>
            )}

            {/* Logout / Danger */}
            <div className="card p-6">
                <h3 className="text-sm font-bold text-red-500 mb-3">Account</h3>
                <button
                    onClick={logout}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-red-500 text-sm font-semibold hover:bg-red-50 transition"
                >
                    <LogOut size={14} /> Sign out
                </button>
            </div>
        </div>
    );
}
