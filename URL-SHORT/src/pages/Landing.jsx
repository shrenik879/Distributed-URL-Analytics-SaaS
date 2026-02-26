import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/ui/Toast";
import { createShortUrl } from "../api/url.api";
import { QRCodeCanvas } from "qrcode.react";
import api from "../api/axios";
import {
    ArrowRight,
    ArrowUp,
    ArrowDown,
    Link2,
    BarChart3,
    QrCode,
    Shield,
    Globe,
    MousePointerClick,
    Check,
    Copy,
    Download,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Menu,
    X,
    FileText,
    ChevronDown,
} from "lucide-react";

const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;

/* ═══════ LANGUAGE DROPDOWN ═══════ */
function LangDropdown({ scrolled }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const langs = [
        { code: "EN", label: "English", gtCode: "en" },
        { code: "DE", label: "German", gtCode: "de" },
        { code: "FR", label: "French", gtCode: "fr" },
        { code: "IT", label: "Italian", gtCode: "it" },
        { code: "PT", label: "Portuguese", gtCode: "pt" },
        { code: "ES", label: "Spanish", gtCode: "es" },
        { code: "ไทย", label: "Thai", gtCode: "th" },
    ];
    const [selected, setSelected] = useState(langs[0]);

    useEffect(() => {
        const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener("mousedown", close);
        return () => document.removeEventListener("mousedown", close);
    }, []);

    const changeLanguage = (lang) => {
        setSelected(lang);
        setOpen(false);

        // Trigger Google Translate
        const tryTranslate = (attempts = 0) => {
            const select = document.querySelector(".goog-te-combo");
            if (select) {
                if (lang.gtCode === "en") {
                    // Reset to English — remove translation
                    const frame = document.querySelector(".goog-te-banner-frame");
                    if (frame) {
                        const btn = frame.contentDocument?.querySelector(".goog-close-link");
                        if (btn) btn.click();
                    }
                    // Also try cookie-based reset
                    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=." + window.location.hostname;
                    select.value = "en";
                    select.dispatchEvent(new Event("change"));
                    // Reload to fully reset if needed
                    setTimeout(() => window.location.reload(), 100);
                } else {
                    select.value = lang.gtCode;
                    select.dispatchEvent(new Event("change"));
                }
            } else if (attempts < 10) {
                // Google Translate may not be loaded yet, retry
                setTimeout(() => tryTranslate(attempts + 1), 300);
            }
        };
        tryTranslate();
    };

    return (
        <div className="lang-dropdown notranslate" ref={ref}>
            <button className={`lang-trigger ${scrolled ? "lang-trigger--scrolled" : ""}`} onClick={() => setOpen(!open)}>
                <Globe size={16} />
                <span>{selected.code}</span>
                <ChevronDown size={12} className={`lang-chevron ${open ? "lang-chevron--open" : ""}`} />
            </button>
            {open && (
                <div className="lang-menu animate-fade-in">
                    {langs.map((l) => (
                        <button
                            key={l.code}
                            className={`lang-option ${l.code === selected.code ? "lang-option--active" : ""}`}
                            onClick={() => changeLanguage(l)}
                        >
                            <span className="lang-code">{l.code}</span>
                            <span>{l.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

/* ═══════ PRODUCT CARD (Bitly-exact style) ═══════ */
function ProductCard({ emoji, title, description, features, image, ctaLink, delay = 0 }) {
    const [expanded, setExpanded] = useState(false);
    const bodyRef = useRef(null);

    return (
        <div className={`pcard ${expanded ? "pcard--open" : ""}`} style={{ animationDelay: `${delay}ms` }}>
            {!expanded && (
                <div className="pcard__img-area" onClick={() => setExpanded(true)}>
                    <img src={image} alt={title} className="pcard__img" />
                </div>
            )}
            <div className="pcard__bottom" onClick={() => setExpanded(!expanded)}>
                <div className="pcard__title-row">
                    <span className="pcard__emoji">{emoji}</span>
                    <h3 className="pcard__title">{title}</h3>
                    <button className="pcard__arrow" aria-label={expanded ? "Collapse" : "Expand"}>
                        {expanded ? <ArrowDown size={18} /> : <ArrowUp size={18} />}
                    </button>
                </div>
                {!expanded && <p className="pcard__teaser">{description}</p>}
            </div>
            <div className="pcard__body" style={{ maxHeight: expanded ? (bodyRef.current?.scrollHeight || 500) + "px" : "0px", opacity: expanded ? 1 : 0 }}>
                <div ref={bodyRef} className="pcard__body-inner">
                    <p className="pcard__full-desc">{description}</p>
                    <p className="pcard__feat-title">Popular {title} Features</p>
                    <ul className="pcard__feat-list">
                        {features.map((f, i) => (
                            <li key={i}><span className="pcard__check-icon"><Check size={14} /></span>{f}</li>
                        ))}
                    </ul>
                    <div className="pcard__actions">
                        <Link to={ctaLink} className="pcard__cta-blue">Get started for free</Link>
                        <Link to={ctaLink} className="pcard__cta-outline">Learn more</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ═══════ BUSINESS CAROUSEL ═══════ */
function BusinessCarousel({ user }) {
    const scrollRef = useRef(null);
    const [canLeft, setCanLeft] = useState(false);
    const [canRight, setCanRight] = useState(true);

    const cases = [
        { tag: "RETAIL", headline: "Attract customers and keep loyal shoppers coming back", desc: "Whether you're a brick-and-mortar shop or a major department store, Cliq makes it easy to manage and track your in-person and online retail customer connections.", image: "/images/biz-retail.png" },
        { tag: "CONSUMER PACKAGED GOODS", headline: "Thriving brands start with raving fans and powerful connections", desc: "Give consumers the power to learn about your products and interact directly with your brand. It's all possible with Cliq, the loved-by-millions solution for CPG brands.", image: "/images/biz-cpg.png" },
        { tag: "HOSPITALITY", headline: "Delight your guests at their every digital touchpoint", desc: "Helping customers feel welcome and making it convenient to discover your services. Create seamless digital experiences — all possible with Cliq.", image: "/images/biz-hospitality.png" },
    ];

    const updateArrows = () => {
        const el = scrollRef.current;
        if (!el) return;
        setCanLeft(el.scrollLeft > 10);
        setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
    };

    const scroll = (dir) => {
        const el = scrollRef.current;
        if (!el) return;
        el.scrollBy({ left: dir * 380, behavior: "smooth" });
        setTimeout(updateArrows, 400);
    };

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        el.addEventListener("scroll", updateArrows);
        updateArrows();
        return () => el.removeEventListener("scroll", updateArrows);
    }, []);

    return (
        <section className="py-16 sm:py-20 bg-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between mb-8 sm:mb-10">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-navy">See how other businesses use Cliq</h2>
                    <div className="flex gap-2">
                        <button onClick={() => scroll(-1)} disabled={!canLeft} className={`biz-arrow ${canLeft ? "" : "biz-arrow--disabled"}`}><ChevronLeft size={18} /></button>
                        <button onClick={() => scroll(1)} disabled={!canRight} className={`biz-arrow ${canRight ? "" : "biz-arrow--disabled"}`}><ChevronRight size={18} /></button>
                    </div>
                </div>
                <div className="biz-scroll" ref={scrollRef}>
                    {cases.map((c, i) => (
                        <div key={i} className="biz-card">
                            <div className="biz-card__top">
                                <span className="biz-card__tag">{c.tag}</span>
                                <h3 className="biz-card__headline">{c.headline}</h3>
                                <p className="biz-card__desc">{c.desc}</p>
                                <Link to={user ? "/dashboard" : "/signup"} className="biz-card__read">Read More <ArrowRight size={14} /></Link>
                            </div>
                            <div className="biz-card__img-wrap"><img src={c.image} alt={c.tag} className="biz-card__img" /></div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ═══════ PLAN LIMITS (mirrors backend) ═══════ */
const PLAN_LIMITS = { FREE: 5, CORE: 100, GROWTH: 500, PREMIUM: 3000 };
const QR_LIMITS = { FREE: 2, CORE: 5, GROWTH: 10, PREMIUM: 200 };

/* ═══════ MAIN LANDING ═══════ */
export default function Landing() {
    const { user } = useAuth();
    const { addToast } = useToast();

    const [activeTab, setActiveTab] = useState("link");
    const [url, setUrl] = useState("");
    const [shortResult, setShortResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [qrInput, setQrInput] = useState("");
    const [stats, setStats] = useState({ totalUrls: 0, totalUsers: 0, totalClicks: 0 });
    const [testimonialIdx, setTestimonialIdx] = useState(0);
    const [slideDir, setSlideDir] = useState("right");
    const [mobileNav, setMobileNav] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    // Plan usage tracking
    const [linkCount, setLinkCount] = useState(0);
    const [qrCount, setQrCount] = useState(0);
    const [limitReached, setLimitReached] = useState(null); // { type: 'link'|'qr', used, limit, plan }

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => { api.get("/stats").then((r) => setStats(r.data)).catch(() => { }); }, []);

    // Fetch current usage if user is logged in
    useEffect(() => {
        if (!user) return;
        api.get("/url")
            .then((res) => {
                const urls = res.data.urls || [];
                setLinkCount(urls.length);
                const withQR = urls.filter((u) => u.qrCode).length;
                setQrCount(withQR);
            })
            .catch(() => { });
    }, [user]);

    useEffect(() => {
        const timer = setInterval(() => { setSlideDir("right"); setTestimonialIdx((i) => (i + 1) % testimonials.length); }, 6000);
        return () => clearInterval(timer);
    }, []);

    const handleShorten = async () => {
        if (!user) {
            sessionStorage.setItem("pendingUrl", url);
            window.location.href = "/login";
            return;
        }
        if (!url.trim()) return addToast("Please enter a URL", "error");

        // Client-side plan limit check (avoids unnecessary server call)
        const plan = user.plan || "FREE";
        const limit = PLAN_LIMITS[plan] ?? PLAN_LIMITS.FREE;
        if (linkCount >= limit) {
            setLimitReached({ type: "link", used: linkCount, limit, plan });
            return;
        }

        setLoading(true);
        setLimitReached(null);
        try {
            const res = await createShortUrl(url);
            setShortResult(res.data.shortUrl);
            setUrl("");
            setLinkCount((c) => c + 1);
            addToast("Short link created!");
        } catch (err) {
            if (err.response?.data?.limitReached) {
                setLimitReached({ type: "link", used: err.response.data.used, limit: err.response.data.limit, plan: err.response.data.currentPlan });
            } else {
                addToast(err.response?.data?.error || "Failed to create short link", "error");
            }
        } finally { setLoading(false); }
    };

    const copyLink = () => { navigator.clipboard.writeText(shortResult); setCopied(true); addToast("Copied!"); setTimeout(() => setCopied(false), 2000); };

    const downloadQR = () => {
        const canvas = document.getElementById("landing-qr");
        if (!canvas) return;
        const a = document.createElement("a");
        a.href = canvas.toDataURL("image/png");
        a.download = "qr-code.png";
        a.click();
        addToast("QR downloaded!");
    };

    const features = [
        { icon: Link2, title: "URL Shortener", desc: "Create short, branded links that are easy to share and track everywhere." },
        { icon: BarChart3, title: "Advanced Analytics", desc: "Track every click with real-time stats, daily breakdowns, and CSV exports." },
        { icon: QrCode, title: "QR Codes", desc: "Generate customizable QR codes for any link — choose colors, download as PNG." },
        { icon: Shield, title: "Secure & Fast", desc: "JWT-authenticated, lightning-fast redirects with role-based access control." },
        { icon: Globe, title: "Bio Link Pages", desc: "Build your link-in-bio page from templates and share everything in one place." },
        { icon: MousePointerClick, title: "Custom Aliases", desc: "Choose your own slug for maximum brand memorability and recognition." },
    ];

    const testimonials = [
        { quote: "When it came to deciding on a platform for generating all of our QR Codes and short links, Cliq was the obvious choice. We didn't even give it a second thought.", name: "Melody Park", role: "Marketing Lead at Smalls" },
        { quote: "Cliq's analytics dashboard gives us instant insight into which campaigns are driving real engagement. It's become completely indispensable for our growth team.", name: "David Chen", role: "Growth Manager at Nexus" },
        { quote: "We switched from three different tools to just Cliq. The bio link pages alone saved us hours every week, and our click-through rates doubled.", name: "Sarah Mitchell", role: "Head of Digital at Bloom" },
    ];

    const products = [
        { emoji: "🔗", title: "URL Shortener", description: "A comprehensive solution to help make every point of connection between your content and your audience more powerful.", features: ["URL shortening at scale", "AI-generated custom domains", "URL redirects", "Advanced analytics & tracking"], image: "/images/url-shortener.png", ctaLink: user ? "/dashboard" : "/signup", delay: 0 },
        { emoji: "📱", title: "QR Codes", description: "QR Code solutions for every customer, business and brand experience. Create, customize, and track.", features: ["Dynamic QR Codes", "Custom colors & branding", "Download as PNG/SVG", "Scan analytics"], image: "/images/qr-codes.png", ctaLink: user ? "/dashboard" : "/signup", delay: 100 },
        { emoji: "📄", title: "Landing Pages", description: "Cliq Pages helps you create engaging, mobile-optimized landing pages in minutes with beautiful templates.", features: ["8+ page templates", "Bio link pages", "Social media links", "Custom branding"], image: "/images/landing-pages.png", ctaLink: user ? "/dashboard" : "/signup", delay: 200 },
    ];

    const plans = [
        { name: "Free", badge: "With ads", price: "₹0", period: "/month", desc: "Try it out for free", features: ["2 QR Codes/month", "5 links/month", "2 custom pages", "Basic analytics", "QR customizations"], cta: "Get Started", style: "btn-secondary", plan: null },
        { name: "Core", price: "₹849", period: "/month", annual: "₹10,188/year", desc: "Unlock powerful data", sub: "Everything in Free, plus:", features: ["5 QR Codes/month", "100 links/month", "5 custom pages", "30 days click data", "Advanced QR"], cta: "Get Started", style: "btn-secondary", plan: "CORE" },
        { name: "Growth", badge: "Recommended", price: "₹2,399", period: "/month", annual: "₹28,788/year", desc: "Brand experiences", sub: "Everything in Core, plus:", features: ["10 QR Codes/month", "500 links/month", "10 custom pages", "4 months data", "Branded links"], cta: "Get Started", style: "btn-primary", plan: "GROWTH", highlighted: true },
        { name: "Premium", price: "₹16,499", period: "/month", annual: "₹1,97,988/year", desc: "Scale your connections", sub: "Everything in Growth, plus:", features: ["200 QR Codes/month", "3,000 links/month", "20 custom pages", "1 year data", "Custom campaigns"], cta: "Get Started", style: "btn-secondary", plan: "PREMIUM" },
    ];

    const handleUpgrade = async (plan) => {
        if (!user) return (window.location.href = "/login?redirect=/dashboard/pricing");
        if (!plan) return (window.location.href = "/dashboard");
        // Prevent re-purchasing current or lower plan
        const PLAN_ORDER = [null, "CORE", "GROWTH", "PREMIUM"];
        const userPlan = user?.plan === "FREE" ? null : user?.plan;
        if (PLAN_ORDER.indexOf(plan) <= PLAN_ORDER.indexOf(userPlan)) return addToast("You already have this plan or a higher one", "error");
        try {
            const res = await api.post("/payment/create-order", { plan });
            const { orderId, amount, currency } = res.data;
            if (res.data.demo) {
                try { await api.post("/payment/verify", { razorpay_order_id: orderId, razorpay_payment_id: `demo_pay_${Date.now()}`, razorpay_signature: "demo", plan }); addToast(`Upgraded to ${plan}!`); window.location.reload(); } catch { addToast("Upgrade failed", "error"); }
                return;
            }
            const options = {
                key: RAZORPAY_KEY, amount, currency, name: "Cliq", description: `Upgrade to ${plan}`, order_id: orderId,
                handler: async (response) => { try { await api.post("/payment/verify", { ...response, plan }); addToast(`Upgraded to ${plan}!`); window.location.reload(); } catch { addToast("Verification failed", "error"); } },
                prefill: { email: user?.email || "" }, theme: { color: "#EE6123" },
            };
            new window.Razorpay(options).open();
        } catch { addToast("Payment failed", "error"); }
    };

    const fmt = (n) => (n >= 1e6 ? (n / 1e6).toFixed(1) + "M" : n >= 1e3 ? (n / 1e3).toFixed(1) + "K" : String(n));
    const prevT = () => { setSlideDir("left"); setTestimonialIdx((i) => (i === 0 ? testimonials.length - 1 : i - 1)); };
    const nextT = () => { setSlideDir("right"); setTestimonialIdx((i) => (i === testimonials.length - 1 ? 0 : i + 1)); };

    return (
        <div className="min-h-screen bg-white">
            {/* ═══ DARK NAVBAR (Bitly-exact with language dropdown) ═══ */}
            <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "landing-navbar-scrolled" : "landing-navbar"}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link to="/" className={`navbar-logo-lg ${scrolled ? "navbar-logo-lg--dark" : ""}`}>Cli<span>q</span></Link>
                        <div className="hidden md:flex items-center gap-1">
                            <a href="#products" className={`inline-flex ${scrolled ? "nav-link-dark" : "nav-link"}`}>Platform <ChevronDown size={13} className="ml-1" /></a>
                            <a href="#business" className={`inline-flex ${scrolled ? "nav-link-dark" : "nav-link"}`}>Solutions <ChevronDown size={13} className="ml-1" /></a>
                            <Link to="/pricing" className={`inline-flex ${scrolled ? "nav-link-dark" : "nav-link"}`}>Pricing</Link>
                            <a href="#features" className={`inline-flex ${scrolled ? "nav-link-dark" : "nav-link"}`}>Resources <ChevronDown size={13} className="ml-1" /></a>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden md:block">
                            <LangDropdown scrolled={scrolled} />
                        </div>
                        {user ? (
                            <Link to="/dashboard" className="nav-cta-primary hidden md:flex whitespace-nowrap">Dashboard</Link>
                        ) : (
                            <>
                                <Link to="/login" className={`${scrolled ? "nav-link-dark-text" : "nav-link-white"} hidden md:flex whitespace-nowrap`}>Log in</Link>
                                <Link to="/signup" className="nav-cta-quote hidden md:flex whitespace-nowrap">Get a Quote</Link>
                                <Link to="/signup" className="nav-cta-signup hidden md:flex whitespace-nowrap">Sign up Free</Link>
                            </>
                        )}
                        <button onClick={() => setMobileNav(!mobileNav)} className={`md:hidden p-2 -mr-2 rounded-lg transition ${scrolled ? "text-navy/70 hover:text-navy hover:bg-navy/10" : "text-white/70 hover:text-white hover:bg-white/10"}`}>
                            {mobileNav ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>
                {/* Mobile Sidebar Overlay */}
                {mobileNav && (
                    <div
                        className="fixed inset-0 bg-navy/60 backdrop-blur-sm z-40 md:hidden animate-fade-in"
                        onClick={() => setMobileNav(false)}
                    />
                )}
                {/* Mobile Sidebar Menu */}
                <div
                    className={`fixed top-0 right-0 h-screen w-[75%] max-w-[320px] bg-navy border-l border-white/10 z-50 transform transition-transform duration-300 ease-in-out md:hidden flex flex-col pt-20 px-6 ${mobileNav ? "translate-x-0" : "translate-x-full"}`}
                >
                    <button
                        onClick={() => setMobileNav(false)}
                        className="absolute top-4 right-4 p-2 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition"
                    >
                        <X size={24} />
                    </button>
                    <div className="flex-1 space-y-2 overflow-y-auto pb-6">
                        <a href="#products" onClick={() => setMobileNav(false)} className="block py-3 text-base font-medium text-white/70 hover:text-white transition">Platform</a>
                        <a href="#business" onClick={() => setMobileNav(false)} className="block py-3 text-base font-medium text-white/70 hover:text-white transition">Solutions</a>
                        <Link to="/pricing" onClick={() => setMobileNav(false)} className="block py-3 text-base font-medium text-white/70 hover:text-white transition">Pricing</Link>
                        <a href="#features" onClick={() => setMobileNav(false)} className="block py-3 text-base font-medium text-white/70 hover:text-white transition">Resources</a>
                        <div className="pt-6 mt-4 border-t border-white/10 flex flex-col gap-3">
                            {user ? (
                                <Link to="/dashboard" onClick={() => setMobileNav(false)} className="block text-center py-3 text-base font-bold bg-white text-navy rounded-xl hover:bg-white/90 transition shadow-lg shadow-white/5">Dashboard</Link>
                            ) : (
                                <>
                                    <Link to="/login" onClick={() => setMobileNav(false)} className="block text-center py-2.5 text-base font-bold text-white border border-white/20 rounded-xl hover:bg-white/10 transition">Log in</Link>
                                    <Link to="/signup" onClick={() => setMobileNav(false)} className="block text-center py-2.5 text-base font-bold bg-white text-navy rounded-xl hover:bg-white/90 transition shadow-lg shadow-white/5">Sign up Free</Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* ═══ HERO ═══ */}
            <section className="bg-navy text-white relative overflow-hidden">
                <div className="absolute top-12 left-16 text-orange/20 text-xl animate-float">✦</div>
                <div className="absolute top-32 right-24 text-blue-400/15 text-sm animate-pulse-soft">✧</div>
                <div className="absolute bottom-24 left-1/3 text-orange/15 text-lg animate-float" style={{ animationDelay: "1s" }}>✦</div>
                <div className="absolute top-20 right-1/3 text-white/5 text-2xl animate-pulse-soft" style={{ animationDelay: "0.5s" }}>✦</div>
                <div className="absolute bottom-12 right-16 text-orange/10 text-sm animate-float" style={{ animationDelay: "2s" }}>✧</div>

                <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-20 pb-8 text-center">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] mb-5">
                        Build stronger digital<br className="hidden sm:block" />connections
                    </h1>
                    <p className="text-sm sm:text-base md:text-lg text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Use our URL shortener, QR Codes, and landing pages to engage your audience and connect them to the right information. Trusted by thousands.
                    </p>

                    {/* Bitly-exact shortener / QR card */}
                    <div className="mx-auto">
                        <div className="hero-card-wrapper">
                            {/* Tabs */}
                            <div className="flex justify-center mb-0">
                                <div className="hero-tabs">
                                    <button onClick={() => setActiveTab("link")} className={`hero-tab ${activeTab === "link" ? "hero-tab--active" : ""}`}>
                                        <span className="hero-tab-icon hero-tab-icon--link">🔗</span> Short Link
                                    </button>
                                    <button onClick={() => setActiveTab("qr")} className={`hero-tab ${activeTab === "qr" ? "hero-tab--active" : ""}`}>
                                        <span className="hero-tab-icon hero-tab-icon--qr">
                                            <QrCode size={16} />
                                        </span> QR Code
                                    </button>
                                </div>
                            </div>

                            {/* Card */}
                            <div className="hero-card">
                                {activeTab === "link" ? (
                                    <>
                                        <h2 className="hero-card__heading">Shorten a long link</h2>
                                        <p className="hero-card__sub">
                                            {user
                                                ? <span>{linkCount} / {PLAN_LIMITS[user.plan || "FREE"]} links used — <strong>{user.plan || "FREE"}</strong> plan</span>
                                                : <><a href="/login" style={{ color: "#EE6123", fontWeight: 700 }}>Log in</a> or <a href="/signup" style={{ color: "#EE6123", fontWeight: 700 }}>Sign up free</a> to generate links.</>
                                            }
                                        </p>

                                        <label className="hero-card__label">Paste your long link here</label>
                                        <div className="flex flex-col sm:flex-row gap-3 md:block">
                                            <input
                                                value={url}
                                                onChange={(e) => setUrl(e.target.value)}
                                                className="hero-card__input w-full md:mb-5"
                                                placeholder="https://example.com/my-long-url"
                                                onKeyDown={(e) => e.key === "Enter" && handleShorten()}
                                            />
                                            <button onClick={handleShorten} disabled={loading} className="hero-card__btn w-full sm:w-auto mt-2 md:mt-0">
                                                {loading ? <><Loader2 size={16} className="animate-spin" /> Shortening...</> : <>Get your link for free <ArrowRight size={16} /></>}
                                            </button>
                                        </div>
                                        {shortResult && (
                                            <div className="mt-5 p-4 bg-cream rounded-xl border border-border flex items-center justify-between gap-3 animate-fade-in">
                                                <p className="text-sm font-semibold text-navy truncate">{shortResult}</p>
                                                <button onClick={copyLink} className="btn-secondary text-xs px-3 py-2 shrink-0">
                                                    {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                                                    {copied ? "Copied" : "Copy"}
                                                </button>
                                            </div>
                                        )}
                                        {/* Upgrade banner when link limit reached */}
                                        {limitReached?.type === "link" && (
                                            <div className="mt-5 rounded-xl border border-orange/30 bg-orange/5 p-4 animate-fade-in">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-orange text-white flex items-center justify-center shrink-0 text-base">👑</div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold text-navy">Link limit reached</p>
                                                        <p className="text-xs text-warm-gray mt-0.5">You've used {limitReached.used}/{limitReached.limit} links on the <strong>{limitReached.plan}</strong> plan.</p>
                                                        <a href="/pricing" className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold text-white bg-orange hover:bg-orange/90 transition px-3 py-2 rounded-lg" style={{ textDecoration: "none" }}>Upgrade plan <ArrowRight size={12} /></a>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="hero-qr-layout">
                                        <div className="hero-qr-form">
                                            <h2 className="hero-card__heading">Create a QR Code</h2>
                                            <p className="hero-card__sub">
                                                {user
                                                    ? <span>{qrCount} / {QR_LIMITS[user.plan || "FREE"]} QR codes used — <strong>{user.plan || "FREE"}</strong> plan</span>
                                                    : <><a href="/login" style={{ color: "#EE6123", fontWeight: 700 }}>Log in</a> or <a href="/signup" style={{ color: "#EE6123", fontWeight: 700 }}>Sign up free</a> to generate QR codes.</>
                                                }
                                            </p>

                                            <label className="hero-card__label">Enter your QR Code destination</label>
                                            <div className="flex flex-col sm:flex-row gap-3 md:block">
                                                <input
                                                    value={qrInput}
                                                    onChange={(e) => setQrInput(e.target.value)}
                                                    className="hero-card__input w-full md:mb-5"
                                                    placeholder="https://example.com/my-long-url"
                                                />
                                                <button
                                                    onClick={() => {
                                                        if (!user) {
                                                            sessionStorage.setItem("pendingQr", qrInput);
                                                            window.location.href = "/login";
                                                            return;
                                                        }
                                                        const plan = user.plan || "FREE";
                                                        const qrLimit = QR_LIMITS[plan] ?? QR_LIMITS.FREE;
                                                        if (qrCount >= qrLimit) {
                                                            setLimitReached({ type: "qr", used: qrCount, limit: qrLimit, plan });
                                                            return;
                                                        }
                                                        if (qrInput) { setLimitReached(null); addToast("QR Code generated!"); setQrCount((c) => c + 1); }
                                                    }}
                                                    className="hero-card__btn w-full sm:w-auto mt-2 md:mt-0"
                                                >
                                                    Get your QR Code for free <ArrowRight size={16} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="hero-qr-preview">
                                            <img src="/images/qr-customize.png" alt="QR Code customization" className="hero-qr-preview-img" />
                                        </div>
                                    </div>
                                )}

                                {/* QR preview — logged-in, within limit */}
                                {activeTab === "qr" && qrInput && user && !limitReached && (
                                    <div className="flex flex-col items-center gap-4 mt-5 animate-fade-in">
                                        <div className="bg-white border border-border rounded-2xl p-5 inline-block">
                                            <QRCodeCanvas id="landing-qr" value={qrInput} size={180} fgColor="#0B1736" bgColor="#ffffff" level="H" />
                                        </div>
                                        <button onClick={downloadQR} className="hero-card__btn text-sm w-auto px-6"><Download size={14} /> Download PNG</button>
                                    </div>
                                )}

                                {/* QR upgrade banner when limit hit */}
                                {activeTab === "qr" && limitReached?.type === "qr" && (
                                    <div className="mt-5 rounded-xl border border-orange/30 bg-orange/5 p-4 animate-fade-in">
                                        <div className="flex items-start gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-orange text-white flex items-center justify-center shrink-0 text-base">👑</div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-navy">QR code limit reached</p>
                                                <p className="text-xs text-warm-gray mt-0.5">You've used {limitReached.used}/{limitReached.limit} QR codes on the <strong>{limitReached.plan}</strong> plan.</p>
                                                <a href="/pricing" className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold text-white bg-orange hover:bg-orange/90 transition px-3 py-2 rounded-lg" style={{ textDecoration: "none" }}>Upgrade plan <ArrowRight size={12} /></a>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Prompt non-logged-in users who typed a QR URL */}
                                {activeTab === "qr" && qrInput && !user && (
                                    <div className="mt-5 p-4 bg-cream rounded-xl border border-border text-center animate-fade-in">
                                        <p className="text-sm font-semibold text-navy mb-2">🔒 Log in to generate &amp; download your QR code</p>
                                        <a href="/login" className="hero-card__btn inline-flex text-sm w-auto px-6" style={{ textDecoration: "none" }}>Log in <ArrowRight size={14} /></a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sign up text with plan features */}
                    <div className="mt-8 text-center">
                        <p className="text-sm sm:text-base font-bold text-white mb-3">Sign up for free. Your free plan includes:</p>
                        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
                            <span className="hero-plan-feature"><Check size={14} className="text-orange" /> 5 short links/month</span>
                            <span className="hero-plan-feature"><Check size={14} className="text-orange" /> 3 custom back-halves/month</span>
                            <span className="hero-plan-feature"><Check size={14} className="text-orange" /> Unlimited link clicks</span>
                        </div>
                    </div>
                </div>
            </section >

            {/* ═══ PRODUCT CARDS ═══ */}
            < section id="products" className="py-16 sm:py-20 bg-cream" >
                <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
                    <p className="text-xs font-bold uppercase tracking-widest text-orange mb-3">The Cliq Platform</p>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-navy mb-4">Everything you need to connect</h2>
                    <p className="text-warm-gray max-w-xl mx-auto mb-12 text-xs sm:text-sm">
                        All the products you need to build brand connections, manage links and QR Codes, and connect with audiences everywhere.
                    </p>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                        {products.map((p, i) => <ProductCard key={i} {...p} />)}
                    </div>
                </div>
            </section >

            {/* ═══ FEATURES GRID ═══ */}
            < section id="features" className="py-16 sm:py-20 bg-white" >
                <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
                    <p className="text-xs font-bold uppercase tracking-widest text-orange mb-3">Why Cliq?</p>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-navy mb-4">Powerful features, simple tools</h2>
                    <p className="text-warm-gray max-w-xl mx-auto mb-12 text-xs sm:text-sm">Every tool you need to manage your digital presence — all built in.</p>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                        {features.map((f, i) => (
                            <div key={i} className="card card-hover-lift p-5 sm:p-6 text-left group cursor-default">
                                <div className="w-11 h-11 rounded-xl bg-orange-light flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                    <f.icon size={20} className="text-orange" />
                                </div>
                                <h3 className="font-bold text-navy mb-1.5 text-sm sm:text-base">{f.title}</h3>
                                <p className="text-xs sm:text-sm text-warm-gray leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section >


            {/* ═══ STATS (Bitly-exact with illustrated icons) ═══ */}
            < section className="py-16 sm:py-20 bg-cream" >
                <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-navy mb-3 leading-tight">
                        Adopted and loved by millions of users<br className="hidden sm:block" /> for over a decade
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 mt-10 sm:mt-12">
                        <div className="stat-card">
                            <img src="/images/stat-customers.png" alt="customers" className="stat-icon" />
                            <p className="stat-value">{fmt(stats.totalUsers)}+</p>
                            <p className="stat-label">Global paying customers</p>
                        </div>
                        <div className="stat-card">
                            <img src="/images/stat-links.png" alt="links" className="stat-icon" />
                            <p className="stat-value">{fmt(stats.totalUrls)}</p>
                            <p className="stat-label">Links & QR Codes created monthly</p>
                        </div>
                        <div className="stat-card">
                            <img src="/images/stat-integrations.png" alt="integrations" className="stat-icon" />
                            <p className="stat-value">800+</p>
                            <p className="stat-label">App integrations</p>
                        </div>
                        <div className="stat-card">
                            <img src="/images/stat-connections.png" alt="connections" className="stat-icon" />
                            <p className="stat-value">{fmt(stats.totalClicks)}</p>
                            <p className="stat-label">Connections (clicks & scans monthly)</p>
                        </div>
                    </div>
                </div>
            </section >

            {/* ═══ BUSINESS CAROUSEL ═══ */}
            < section id="business" >
                <BusinessCarousel user={user} />
            </section >

            {/* ═══ TESTIMONIALS ═══ */}
            < section className="py-14 sm:py-16 bg-orange text-white overflow-hidden" >
                <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold mb-8">What our customers are saying</h2>
                    <div className="relative" style={{ minHeight: 200 }}>
                        <div key={testimonialIdx} className={slideDir === "right" ? "animate-slide-left" : "animate-slide-right"}>
                            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-6 sm:p-8">
                                <p className="text-3xl sm:text-4xl mb-3 opacity-50 font-serif">❝</p>
                                <p className="text-sm sm:text-base md:text-lg leading-relaxed mb-5 -mt-2">{testimonials[testimonialIdx].quote}</p>
                                <p className="font-bold text-sm sm:text-base">{testimonials[testimonialIdx].name}</p>
                                <p className="text-xs sm:text-sm text-white/70">{testimonials[testimonialIdx].role}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-center gap-3 mt-6">
                        <button onClick={prevT} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-white/30 flex items-center justify-center hover:bg-white/20 hover:border-white/60 transition-all duration-200"><ChevronLeft size={16} /></button>
                        <div className="flex gap-1.5">
                            {testimonials.map((_, i) => (
                                <div key={i} className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${i === testimonialIdx ? "bg-white w-6" : "bg-white/30 w-2 hover:bg-white/50"}`} onClick={() => { setSlideDir(i > testimonialIdx ? "right" : "left"); setTestimonialIdx(i); }} />
                            ))}
                        </div>
                        <button onClick={nextT} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-white/30 flex items-center justify-center hover:bg-white/20 hover:border-white/60 transition-all duration-200"><ChevronRight size={16} /></button>
                    </div>
                </div>
            </section >

            {/* ═══ PRICING ═══ */}
            < section id="pricing" className="py-16 sm:py-20 bg-cream" >
                <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-navy mb-3">Pick the plan that's right for you</h2>
                    <p className="text-warm-gray mb-10 sm:mb-12 text-xs sm:text-sm">Connect to your audience with branded links, QR Codes, and landing pages.</p>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        {plans.map((p, i) => {
                            const PLAN_ORDER = [null, "CORE", "GROWTH", "PREMIUM"];
                            const userPlan = user?.plan || "FREE";
                            const isCurrent = (p.plan === null && userPlan === "FREE") || p.plan === userPlan;
                            const isLower = user && PLAN_ORDER.indexOf(p.plan) < PLAN_ORDER.indexOf(userPlan === "FREE" ? null : userPlan);

                            return (
                                <div key={i} className={`card card-hover-lift p-4 sm:p-5 text-left relative ${p.highlighted ? "border-2 border-orange ring-2 ring-orange/10" : ""} ${isCurrent && user ? "border-2 border-navy" : ""}`}>
                                    {/* Current Plan badge — replaces other badges */}
                                    {isCurrent && user ? (
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

                                    {/* CTA button — plan-aware for logged-in users */}
                                    {user && isCurrent ? (
                                        <div className="w-full mb-4 text-xs sm:text-sm py-2.5 rounded-xl text-center font-semibold bg-gray-100 text-warm-gray cursor-default">Current Plan</div>
                                    ) : user && isLower ? (
                                        <div className="w-full mb-4 text-xs sm:text-sm py-2.5 rounded-xl text-center font-semibold bg-gray-50 text-warm-gray/60 cursor-default">Included in your plan</div>
                                    ) : (
                                        <button onClick={() => handleUpgrade(p.plan)} className={`${p.style} w-full mb-4 text-xs sm:text-sm`}>{p.cta} <ArrowRight size={14} /></button>
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
                </div>
            </section >

            {/* ═══ MORE THAN A LINK SHORTENER (with built dashboard mockup) ═══ */}
            < section className="bg-navy text-white relative overflow-hidden" >
                <div className="absolute top-8 left-12 text-white/10 text-xl animate-float">✦</div>
                <div className="absolute top-16 right-20 text-white/5 text-sm animate-pulse-soft">✧</div>
                <div className="absolute bottom-32 right-1/4 text-orange/10 text-lg animate-float" style={{ animationDelay: "1.5s" }}>✦</div>
                <div className="absolute top-6 right-1/3 text-white/5 text-lg animate-pulse-soft" style={{ animationDelay: "0.8s" }}>✧</div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-16 sm:pt-20 text-center">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-5">
                        <span className="text-orange">More than a link shortener</span>
                    </h2>
                    <p className="text-sm sm:text-base md:text-lg text-white/60 max-w-2xl mx-auto mb-8 leading-relaxed">
                        Knowing how your clicks and scans are performing should be as easy as making them. Track, analyze, and optimize all your connections in one place.
                    </p>
                    <Link to={user ? "/dashboard" : "/signup"} className="inline-flex items-center gap-2 border-2 border-white/40 text-white hover:bg-white/10 text-sm sm:text-base px-6 sm:px-8 py-3 rounded-xl font-semibold transition-all duration-300">
                        Get started for free <ArrowRight size={16} />
                    </Link>

                    {/* Built dashboard mockup */}
                    <div className="mt-12 sm:mt-16 max-w-3xl mx-auto">
                        <div className="dash-mockup">
                            {/* Sidebar */}
                            <div className="dash-sidebar">
                                <div className="dash-sidebar-logo">
                                    <span className="dash-logo-circle">Cli<span className="text-white">q</span></span>
                                </div>
                                <div className="dash-sidebar-item dash-sidebar-item--active">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" /></svg>
                                    <span>Home</span>
                                </div>
                                <div className="dash-sidebar-item">
                                    <Link2 size={18} />
                                    <span>Links</span>
                                </div>
                                <div className="dash-sidebar-item">
                                    <QrCode size={18} />
                                    <span>QR Codes</span>
                                </div>
                                <div className="dash-sidebar-item">
                                    <BarChart3 size={18} />
                                    <span>Analytics</span>
                                </div>
                            </div>

                            {/* Main content */}
                            <div className="dash-main">
                                <div className="dash-header">
                                    <h3 className="dash-main-title">Your Connections Platform</h3>
                                    <div className="dash-header-right">
                                        <div className="dash-search-icon">🔍</div>
                                        <div className="dash-avatar">C</div>
                                    </div>
                                </div>

                                {/* 3 product cards */}
                                <div className="dash-products">
                                    <div className="dash-product-card">
                                        <div className="dash-product-icon dash-product-icon--links">
                                            <Link2 size={28} />
                                        </div>
                                        <p className="dash-product-name">Links</p>
                                        <p className="dash-product-desc">Manage your shortened and branded links.</p>
                                        <button className="dash-product-btn">Go to Links</button>
                                    </div>
                                    <div className="dash-product-card">
                                        <div className="dash-product-icon dash-product-icon--qr">
                                            <QrCode size={28} />
                                        </div>
                                        <p className="dash-product-name">QR Codes</p>
                                        <p className="dash-product-desc">Create and track dynamic QR codes.</p>
                                        <button className="dash-product-btn">Go to QR Codes</button>
                                    </div>
                                    <div className="dash-product-card">
                                        <div className="dash-product-icon dash-product-icon--pages">
                                            <FileText size={28} />
                                        </div>
                                        <p className="dash-product-name">Landing Pages</p>
                                        <p className="dash-product-desc">Design and publish mobile-optimized pages.</p>
                                        <button className="dash-product-btn">Go to Landing Pages</button>
                                    </div>
                                </div>

                                {/* Stats row */}
                                <div className="dash-stats-row">
                                    <div className="dash-stat-box">
                                        <p className="dash-stat-label">ENGAGEMENTS</p>
                                        <p className="dash-stat-num">342</p>
                                    </div>
                                    <div className="dash-stat-box">
                                        <p className="dash-stat-label">LINK CLICKS</p>
                                        <p className="dash-stat-num">1,589</p>
                                    </div>
                                    <div className="dash-stat-box">
                                        <p className="dash-stat-label">QR CODE SCANS</p>
                                        <p className="dash-stat-num">745</p>
                                    </div>
                                    <div className="dash-stat-box">
                                        <p className="dash-stat-label">LANDING PAGES CLICKS</p>
                                        <p className="dash-stat-num">239</p>
                                    </div>
                                </div>

                                {/* Floating notification cards */}
                                <div className="dash-float dash-float--right">
                                    <div className="dash-float-icon">📋</div>
                                    <div>
                                        <p className="dash-float-title">Promotional Flyer — 64 engagements</p>
                                        <p className="dash-float-time">2 hours ago</p>
                                    </div>
                                    <span className="dash-float-trend">📈</span>
                                </div>
                                <div className="dash-float dash-float--left">
                                    <div className="dash-float-icon">🔗</div>
                                    <div>
                                        <p className="dash-float-title">Social Media Ads — 82 engagements</p>
                                        <p className="dash-float-time">5 hours ago</p>
                                    </div>
                                    <span className="dash-float-trend">📈</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section >

            {/* ═══ FOOTER ═══ */}
            < footer className="bg-navy-dark text-white/40 py-8 sm:py-10 border-t border-white/5" >
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 mb-8">
                        <div className="col-span-2 sm:col-span-1">
                            <p className="text-2xl font-extrabold mb-3"><span className="text-white">Cli</span><span className="text-orange">q</span></p>
                            <p className="text-xs sm:text-sm leading-relaxed">Build stronger digital connections with short links, QR codes, and analytics.</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-white/60 mb-3">Products</p>
                            <ul className="space-y-2 text-xs sm:text-sm">
                                <li><a href="#features" className="hover:text-white transition-all duration-200">URL Shortener</a></li>
                                <li><a href="#features" className="hover:text-white transition-all duration-200">QR Codes</a></li>
                                <li><a href="#features" className="hover:text-white transition-all duration-200">Analytics</a></li>
                                <li><a href="#features" className="hover:text-white transition-all duration-200">Bio Pages</a></li>
                            </ul>
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-white/60 mb-3">Company</p>
                            <ul className="space-y-2 text-xs sm:text-sm">
                                <li><a href="#" className="hover:text-white transition-all duration-200">About</a></li>
                                <li><a href="#pricing" className="hover:text-white transition-all duration-200">Pricing</a></li>
                            </ul>
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-white/60 mb-3">Legal</p>
                            <ul className="space-y-2 text-xs sm:text-sm">
                                <li><a href="#" className="hover:text-white transition-all duration-200">Privacy Policy</a></li>
                                <li><a href="#" className="hover:text-white transition-all duration-200">Terms of Service</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-white/5 pt-6 text-center text-xs">
                        © {new Date().getFullYear()} Cliq. All rights reserved.
                    </div>
                </div>
            </footer >
        </div >
    );
}
