import { useState, useEffect } from "react";
import { createShortUrl } from "../../api/url.api";
import { getMyDomains } from "../../api/domain.api";
import { useToast } from "../../components/ui/Toast";
import { useAuth } from "../../context/AuthContext";
import {
    Link2, Copy, Check, ExternalLink, BarChart3, Loader2,
    Crown, ArrowRight, Globe, ChevronDown, Lock, Clock,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { getUserUrls } from "../../api/url.api";

export default function ShortenUrl() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const plan = user?.plan || "FREE";
    const canUseAlias = ["CORE", "GROWTH", "PREMIUM"].includes(plan);

    const [url, setUrl] = useState("");
    const [customAlias, setCustomAlias] = useState("");
    const [selectedDomain, setSelectedDomain] = useState(null);
    const [domains, setDomains] = useState([]);
    const [domainDropdown, setDomainDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const [createdLinks, setCreatedLinks] = useState([]); // persisted within session
    const [copiedId, setCopiedId] = useState(null);
    const [limitReached, setLimitReached] = useState(null);
    const [totalLinksCreated, setTotalLinksCreated] = useState(0);
    const { addToast } = useToast();

    const planLimits = { FREE: 5, CORE: 100, GROWTH: 500, PREMIUM: 3000 };
    const maxLinks = planLimits[plan] || 5;

    useEffect(() => {
        getMyDomains()
            .then((res) => {
                const verified = (res.data.domains || []).filter((d) => d.status === "VERIFIED");
                setDomains(verified);
            })
            .catch((err) => { console.error("Failed to load domains:", err); });

        // Fetch total-ever-created for limit display
        getUserUrls()
            .then((res) => {
                setTotalLinksCreated(res.data.totalLinksCreated || res.data.urls?.length || 0);
            })
            .catch(() => { });
    }, []);

    const handleShorten = async () => {
        if (!url.trim()) return addToast("Please enter a URL", "error");
        setLoading(true);
        setLimitReached(null);
        try {
            const domainId = selectedDomain?._id || selectedDomain?.id || null;
            const res = await createShortUrl(url, customAlias, domainId);
            const localUrl = `${import.meta.env.VITE_BACKEND_URL}/url/${res.data.shortId}`;
            const newLink = {
                id: res.data.shortId,
                shortUrl: res.data.shortUrl,
                shortId: res.data.shortId,
                localUrl,
                originalUrl: url.trim(),
                createdAt: new Date(),
            };
            // Prepend so newest appears first
            setCreatedLinks(prev => [newLink, ...prev]);
            setUrl("");
            setCustomAlias("");
            addToast("Short URL created!");
            setTotalLinksCreated(prev => prev + 1); // increment local counter
        } catch (err) {
            if (err.response?.data?.limitReached) {
                setLimitReached(err.response.data);
            } else {
                addToast(err.response?.data?.error || "Failed to create short URL", "error");
            }
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        addToast("Copied!");
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="max-w-2xl mx-auto animate-fade-in">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-navy mb-1">Shorten URL</h1>
                <p className="text-sm text-warm-gray">Create a short, branded link in seconds.</p>
            </div>

            {/* Usage counter */}
            <p className="text-xs text-warm-gray mb-2">{totalLinksCreated}/{maxLinks} links used on the <strong>{plan}</strong> plan</p>

            {totalLinksCreated >= maxLinks ? (
                /* Proactive limit-reached block */
                <div className="card p-10 text-center">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl"
                        style={{ background: "#FFF0E8" }}>👑</div>
                    <p className="text-lg font-bold text-navy mb-2">Link limit reached</p>
                    <p className="text-sm text-warm-gray mb-6">
                        You've used <strong>{totalLinksCreated}</strong> of <strong>{maxLinks}</strong> links on the <strong>{plan}</strong> plan. Upgrade to create more.
                    </p>
                    <Link to="/dashboard/pricing" className="btn-primary text-sm inline-flex items-center gap-2">
                        <Crown size={14} /> Upgrade plan <ArrowRight size={14} />
                    </Link>
                </div>
            ) : (
                <>
                    {/* Form card */}
                    <div className="card p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-navy mb-1.5">Destination URL</label>
                            <div className="relative">
                                <Link2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-warm-gray-light pointer-events-none" />
                                <input
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    className="input-field"
                                    style={{ paddingLeft: '2.5rem' }}
                                    placeholder="https://example.com/your-very-long-url"
                                    onKeyDown={(e) => e.key === "Enter" && handleShorten()}
                                />
                            </div>
                        </div>

                        {/* Domain Selector */}
                        <div>
                            <label className="block text-sm font-semibold text-navy mb-1.5">Domain</label>
                            {domains.length > 0 ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setDomainDropdown(!domainDropdown)}
                                        className="input-field w-full text-left flex items-center justify-between cursor-pointer"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Globe size={14} className="text-warm-gray-light" />
                                            <span className={selectedDomain ? "text-navy" : "text-warm-gray"}>
                                                {selectedDomain ? selectedDomain.domain : "Default (cliq link)"}
                                            </span>
                                        </div>
                                        <ChevronDown size={14} className={`text-warm-gray transition-transform ${domainDropdown ? "rotate-180" : ""}`} />
                                    </button>
                                    {domainDropdown && (
                                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-xl shadow-lg z-20 overflow-hidden animate-fade-in">
                                            <button
                                                onClick={() => { setSelectedDomain(null); setDomainDropdown(false); }}
                                                className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition flex items-center gap-2 ${!selectedDomain ? "bg-orange-light text-orange font-semibold" : "text-navy"}`}
                                            >
                                                <Globe size={14} /> Default (cliq link)
                                            </button>
                                            {domains.map((d) => (
                                                <button
                                                    key={d._id || d.id}
                                                    onClick={() => { setSelectedDomain(d); setDomainDropdown(false); }}
                                                    className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition flex items-center gap-2 border-t border-border ${selectedDomain && (selectedDomain._id || selectedDomain.id) === (d._id || d.id) ? "bg-orange-light text-orange font-semibold" : "text-navy"}`}
                                                >
                                                    <Globe size={14} /> {d.domain}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 bg-cream rounded-xl px-4 py-3 border border-border">
                                    <Globe size={14} className="text-warm-gray shrink-0" />
                                    <p className="text-xs text-warm-gray">Default domain in use. <Link to="/dashboard/domains" className="text-orange font-semibold hover:underline">Add a custom domain →</Link></p>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-navy mb-1.5">
                                Custom slug <span className="text-warm-gray-light font-normal">(optional)</span>
                            </label>
                            {canUseAlias ? (
                                <input
                                    value={customAlias}
                                    onChange={(e) => setCustomAlias(e.target.value)}
                                    className="input-field"
                                    placeholder="my-brand"
                                />
                            ) : (
                                <div
                                    onClick={() => navigate("/dashboard/pricing")}
                                    className="input-field flex items-center gap-2 cursor-pointer bg-gray-50 text-gray-400"
                                >
                                    <Lock size={14} />
                                    <span className="text-xs">Upgrade to Core to use custom slugs</span>
                                </div>
                            )}
                        </div>

                        {/* Preview */}
                        {(customAlias || selectedDomain) && (
                            <div className="bg-cream rounded-xl px-4 py-3 border border-border">
                                <p className="text-[11px] text-warm-gray font-semibold uppercase tracking-wider mb-1">Preview</p>
                                <p className="text-sm font-mono font-semibold text-navy">
                                    {selectedDomain ? `https://${selectedDomain.domain}/` : `${window.location.origin}/url/`}
                                    <span className="text-orange">{customAlias || "[random]"}</span>
                                </p>
                            </div>
                        )}

                        <button onClick={handleShorten} disabled={loading} className="btn-primary w-full">
                            {loading ? <><Loader2 size={16} className="animate-spin" /> Creating...</> : "Shorten URL"}
                        </button>
                    </div>
                </>
            )}

            {/* Session links list — all created links visible within this session */}
            {createdLinks.length > 0 && (
                <div className="mt-6 space-y-3 animate-fade-in">
                    <div className="flex items-center gap-2">
                        <Clock size={13} className="text-warm-gray" />
                        <p className="text-xs font-semibold text-warm-gray uppercase tracking-wider">Created this session</p>
                    </div>
                    {createdLinks.map((link) => (
                        <div key={link.id} className="card p-4 sm:p-5 border-l-4 border-l-orange animate-slide-in flex flex-col gap-3">
                            <div className="flex-1 w-full min-w-0">
                                <p className="text-xs text-warm-gray mb-0.5 font-semibold uppercase tracking-wider">Short link</p>
                                <p className="text-sm sm:text-base font-bold text-navy break-all">{link.shortUrl}</p>
                                {link.shortUrl !== link.localUrl && (
                                    <p className="text-xs text-warm-gray mt-0.5 break-all">
                                        → <a href={link.localUrl} target="_blank" rel="noopener noreferrer" className="text-orange hover:underline">{link.localUrl}</a>
                                    </p>
                                )}
                                <p className="text-[11px] sm:text-xs text-warm-gray-light mt-1 break-all">{link.originalUrl}</p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-1 pt-3 border-t border-border sm:border-0 sm:pt-0">
                                <button onClick={() => copyToClipboard(link.shortUrl, link.id)} className="btn-secondary text-xs sm:text-sm flex-1 sm:flex-none justify-center">
                                    {copiedId === link.id ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                                    {copiedId === link.id ? "Copied!" : "Copy"}
                                </button>
                                <a href={link.localUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs sm:text-sm flex-1 sm:flex-none justify-center">
                                    <ExternalLink size={14} /> Open
                                </a>
                                <Link to="/dashboard/analytics" className="btn-secondary text-xs sm:text-sm flex-1 sm:flex-none justify-center">
                                    <BarChart3 size={14} /> Analytics
                                </Link>
                            </div>
                        </div>
                    ))}
                    <p className="text-xs text-center text-warm-gray-light mt-2">
                        All links are permanently saved — view them in{" "}
                        <Link to="/dashboard/links" className="text-orange font-semibold hover:underline">My Links</Link>.
                    </p>
                </div>
            )}

            {/* Limit Reached Prompt */}
            {limitReached && (
                <div className="card mt-5 overflow-hidden animate-slide-in">
                    <div className="bg-orange-50 border-b border-orange-100 px-6 py-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange text-white flex items-center justify-center">
                            <Crown size={18} />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-navy">Link limit reached</h3>
                            <p className="text-xs text-warm-gray">
                                You've used {limitReached.used}/{limitReached.limit} links on the {limitReached.currentPlan} plan
                            </p>
                        </div>
                    </div>
                    <div className="px-6 py-4">
                        <p className="text-sm text-warm-gray mb-4">
                            Upgrade your plan to create more short links, unlock custom aliases, and access advanced analytics.
                        </p>
                        <Link to="/dashboard/pricing" className="btn-primary text-sm inline-flex items-center gap-2">
                            <Crown size={14} /> View Plans <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
