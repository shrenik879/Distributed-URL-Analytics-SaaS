import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUserUrls, createShortUrl } from "../../api/url.api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/ui/Toast";
import { CardSkeleton } from "../../components/ui/Skeleton";
import {
    Link2,
    MousePointerClick,
    TrendingUp,
    ArrowRight,
    QrCode,
    BarChart3,
    FileText,
    Check,
    Copy,
    Loader2,
    Crown,
} from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function Overview() {
    const { user } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalLinksCreated, setTotalLinksCreated] = useState(0);

    // Quick create
    const [activeTab, setActiveTab] = useState("link");
    const [url, setUrl] = useState("");
    const [shortResult, setShortResult] = useState(null);
    const [shortening, setShortening] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        getUserUrls()
            .then((res) => {
                setLinks(
                    res.data.urls.map((u) => ({
                        id: u._id,
                        shortId: u.shortId,
                        original: u.redirectURL,
                        short: `${BACKEND_URL}/url/${u.shortId}`,
                        clicks: u.visitHistory.length,
                    }))
                );
                setTotalLinksCreated(res.data.totalLinksCreated || res.data.urls.length);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const totalClicks = links.reduce((sum, l) => sum + l.clicks, 0);

    const handleShorten = async () => {
        if (!url.trim()) return addToast("Please enter a URL", "error");
        setShortening(true);
        try {
            const res = await createShortUrl(url);
            setShortResult(res.data.shortUrl);
            setUrl("");
            addToast("Short link created!");
        } catch (err) {
            addToast(err.response?.data?.error || "Failed to shorten", "error");
        } finally {
            setShortening(false);
        }
    };

    const copyLink = () => {
        navigator.clipboard.writeText(shortResult);
        setCopied(true);
        addToast("Copied!");
        setTimeout(() => setCopied(false), 2000);
    };

    const planLimits = {
        FREE: 5,
        CORE: 100,
        GROWTH: 500,
        PREMIUM: 3000,
    };
    const maxLinks = planLimits[user?.plan || "FREE"] || 5;

    if (loading) {
        return (
            <div className="space-y-6 animate-fade-in">
                <div className="grid sm:grid-cols-3 gap-4">
                    <CardSkeleton /><CardSkeleton /><CardSkeleton />
                </div>
            </div>
        );
    }

    const stats = [
        {
            label: "Total Links",
            value: links.length,
            icon: <Link2 size={18} />,
            bg: "bg-[#FFF3ED]",
            text: "text-orange",
        },
        {
            label: "Total Clicks",
            value: totalClicks,
            icon: <MousePointerClick size={18} />,
            bg: "bg-[#EFF1F8]",
            text: "text-navy",
        },
        {
            label: "Avg. Clicks",
            value: links.length ? (totalClicks / links.length).toFixed(1) : "0",
            icon: <TrendingUp size={18} />,
            bg: "bg-[#FFF3ED]",
            text: "text-orange",
        },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-xl font-bold text-navy mb-0.5">Your Connections Platform</h1>
            </div>

            {/* Quick Create + Pages promo */}
            <div className="grid lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 card p-5 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-bold text-navy">Quick create</h2>
                            <div className="flex sm:gap-1 bg-gray-50/50 p-1 rounded-lg border border-border">
                                <button onClick={() => { setActiveTab("link"); setShortResult(null); }}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${activeTab === "link" ? "bg-blue-50 text-blue-700" : "text-warm-gray hover:bg-gray-50"}`}>
                                    <Link2 size={14} /> Short link
                                </button>
                                <button onClick={() => setActiveTab("qr")}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${activeTab === "qr" ? "bg-blue-50 text-blue-700" : "text-warm-gray hover:bg-gray-50"}`}>
                                    <QrCode size={14} /> QR Code
                                </button>
                            </div>
                        </div>
                        <p className="text-[11px] text-warm-gray mb-4">You can create {Math.max(0, maxLinks - totalLinksCreated)} more short links this month.</p>

                        {totalLinksCreated >= maxLinks ? (
                            <div className="py-6 text-center">
                                <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange flex items-center justify-center mx-auto mb-3">
                                    <Crown size={24} />
                                </div>
                                <h3 className="text-sm font-bold text-navy mb-1">Link limit reached</h3>
                                <p className="text-xs text-warm-gray mb-3">You've used all {maxLinks} links on the {user?.plan || "FREE"} plan.</p>
                                <Link to="/dashboard/pricing" className="btn-primary text-sm">Upgrade your plan</Link>
                            </div>
                        ) : activeTab === "link" ? (
                            <>
                                <label className="block text-xs font-semibold text-navy mb-1">Enter your destination URL</label>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <input value={url} onChange={(e) => setUrl(e.target.value)} className="input-field flex-1"
                                        placeholder="https://example.com/my-long-url" onKeyDown={(e) => e.key === "Enter" && handleShorten()} />
                                    <button onClick={handleShorten} disabled={shortening} className="btn-primary text-sm w-full sm:w-auto shrink-0">
                                        {shortening ? <Loader2 size={14} className="animate-spin" /> : null}
                                        {shortening ? "Creating..." : "Create your Cliq link"}
                                    </button>
                                </div>
                                {shortResult && (
                                    <div className="mt-3 p-3 bg-cream rounded-xl border border-border flex items-center justify-between gap-3 animate-fade-in">
                                        <p className="text-sm font-semibold text-navy truncate">{shortResult}</p>
                                        <button onClick={copyLink} className="btn-secondary text-xs px-3 py-1.5">
                                            {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                                            {copied ? "Copied" : "Copy"}
                                        </button>
                                    </div>
                                )}
                                {(!user?.plan || user.plan === "FREE") ? (
                                    <div className="mt-3 text-center bg-[#FFF3ED] border border-[#FDDCCA] rounded-lg px-3 py-2">
                                        <p className="text-xs text-orange">
                                            <Crown size={12} className="inline -mt-0.5 mr-1" />
                                            Get custom links and more. <Link to="/dashboard/pricing" className="font-semibold underline">Upgrade now</Link>
                                        </p>
                                    </div>
                                ) : (
                                    <div className="mt-3 text-center bg-[#FFF3ED] border border-[#FDDCCA] rounded-lg px-3 py-2">
                                        <p className="text-xs text-orange">
                                            <Crown size={12} className="inline -mt-0.5 mr-1" />
                                            <span className="font-semibold">{user.plan}</span> plan active — {Math.max(0, maxLinks - totalLinksCreated)} links remaining
                                        </p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-8">
                                <QrCode size={32} className="text-gray-200 mx-auto mb-2" />
                                <p className="text-sm text-warm-gray mb-3">Go to the QR Code generator</p>
                                <Link to="/dashboard/qr" className="btn-primary text-sm w-full sm:w-auto">Open QR Generator</Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Pages promo */}
                <div className="card p-5 flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                        <FileText size={18} className="text-orange" />
                        <h3 className="text-sm font-bold text-navy">Pages that inspire action</h3>
                    </div>
                    <p className="text-xs text-warm-gray mb-4 flex-1">
                        Customize your page with ease, track user engagement, and turn visits into conversions.
                    </p>
                    <Link to="/dashboard/pages" className="btn-secondary text-sm w-full">
                        Get started <ArrowRight size={14} />
                    </Link>
                </div>
            </div>

            {/* Stats — Minimalist Cards */}
            <div className="grid sm:grid-cols-3 gap-4">
                {stats.map((s, i) => (
                    <div key={i} className="card p-5 flex items-start gap-4">
                        <div className={`${s.bg} ${s.text} w-10 h-10 rounded-xl flex items-center justify-center shrink-0`}>
                            {s.icon}
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold text-warm-gray uppercase tracking-wider mb-1">{s.label}</p>
                            <p className="text-3xl font-extrabold text-navy leading-none tracking-tight">{s.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Links */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-warm-gray-light">Recent Links</h2>
                    {links.length > 0 && (
                        <Link to="/dashboard/links" className="text-xs text-orange font-semibold hover:underline flex items-center gap-1">
                            View all <ArrowRight size={12} />
                        </Link>
                    )}
                </div>
                {links.length === 0 ? (
                    <div className="card p-10 text-center">
                        <Link2 size={32} className="text-gray-200 mx-auto mb-3" />
                        <p className="text-warm-gray text-sm mb-3">No links created yet</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {links.slice(0, 5).map((l) => (
                            <div key={l.id} className="card px-4 py-3 flex items-center justify-between">
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-navy truncate">{l.short}</p>
                                    <p className="text-xs text-warm-gray truncate">{l.original}</p>
                                </div>
                                <span className="text-xs text-warm-gray ml-3 shrink-0 bg-gray-50 px-2 py-1 rounded-lg">
                                    {l.clicks} click{l.clicks !== 1 ? "s" : ""}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
