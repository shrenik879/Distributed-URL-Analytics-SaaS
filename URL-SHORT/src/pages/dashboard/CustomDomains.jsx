import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { addDomain, verifyDomain, getMyDomains, deleteDomain } from "../../api/domain.api";
import api from "../../api/axios";
import { useToast } from "../../components/ui/Toast";
import { useAuth } from "../../context/AuthContext";
import {
    Globe, Sparkles, Search, Check, Loader2, ExternalLink,
    Plus, Trash2, RefreshCw, Copy, AlertCircle, CheckCircle2, Clock, X, Crown
} from "lucide-react";

const DOMAIN_LIMITS = {
    FREE: 0,
    CORE: 0,
    GROWTH: 3,
    PREMIUM: 10,
};

export default function CustomDomains() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const plan = user?.plan || "FREE";
    const domainLimit = DOMAIN_LIMITS[plan] ?? 0;
    const [activeTab, setActiveTab] = useState("search");
    const [searchQuery, setSearchQuery] = useState("");
    const [aiPrompt, setAiPrompt] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [domains, setDomains] = useState([]);
    const [domainsLoading, setDomainsLoading] = useState(true);
    const [newDomain, setNewDomain] = useState("");
    const [adding, setAdding] = useState(false);
    const [verifying, setVerifying] = useState(null);
    const [copied, setCopied] = useState(null);
    const { addToast } = useToast();

    // Load user's domains on mount
    useEffect(() => {
        fetchDomains();
    }, []);

    const fetchDomains = async () => {
        try {
            const res = await getMyDomains();
            setDomains(res.data.domains || []);
        } catch {
            // silent
        } finally {
            setDomainsLoading(false);
        }
    };

    const handleAddDomain = async () => {
        if (!newDomain.trim()) return addToast("Enter a domain", "error");
        setAdding(true);
        try {
            const res = await addDomain(newDomain);
            setDomains((prev) => [res.data, ...prev.map(d => ({ ...d, _id: d._id || d.id }))]);
            setNewDomain("");
            addToast("Domain added! Now verify it by adding the TXT record.");
        } catch (err) {
            addToast(err.response?.data?.error || "Failed to add domain", "error");
        } finally {
            setAdding(false);
        }
    };

    const handleVerify = async (id) => {
        setVerifying(id);
        try {
            const res = await verifyDomain(id);
            if (res.data.status === "VERIFIED") {
                addToast("Domain verified! 🎉");
            } else if (res.data.status === "PENDING_APPROVAL") {
                addToast("Submitted for admin approval! ⏳");
            } else {
                addToast(res.data.message || "Verification failed", "error");
            }
            fetchDomains();
        } catch (err) {
            addToast(err.response?.data?.error || "Verification failed", "error");
        } finally {
            setVerifying(null);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Remove this domain?")) return;
        try {
            await deleteDomain(id);
            setDomains((prev) => prev.filter((d) => (d._id || d.id) !== id));
            addToast("Domain removed");
        } catch (err) {
            addToast(err.response?.data?.error || "Failed to remove", "error");
        }
    };

    const handleAddFromSuggestion = async (domain) => {
        setAdding(true);
        try {
            const res = await addDomain(domain);
            setDomains((prev) => [res.data, ...prev.map(d => ({ ...d, _id: d._id || d.id }))]);
            addToast(`${domain} added! Now verify it.`);
        } catch (err) {
            addToast(err.response?.data?.error || "Failed to add domain", "error");
        } finally {
            setAdding(false);
        }
    };

    const copyTxt = (token) => {
        navigator.clipboard.writeText(`cliq-verify=${token}`);
        setCopied(token);
        addToast("TXT record copied!");
        setTimeout(() => setCopied(null), 2000);
    };

    const handleAiSearch = async () => {
        if (!aiPrompt.trim()) return addToast("Describe your idea", "error");
        setLoading(true);
        try {
            const res = await api.post("/domain/suggest", { description: aiPrompt });
            setSuggestions(res.data.suggestions || []);
        } catch {
            addToast("Failed to get suggestions", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleManualSearch = () => {
        if (!searchQuery.trim()) return addToast("Enter a domain", "error");
        const domain = searchQuery.includes(".") ? searchQuery : `${searchQuery}.com`;
        setSuggestions([domain, domain.replace(".com", ".io"), domain.replace(".com", ".link"), domain.replace(".com", ".co"), domain.replace(".com", ".me")]);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "VERIFIED":
                return (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                        <CheckCircle2 size={10} /> Verified
                    </span>
                );
            case "PENDING_APPROVAL":
                return (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-orange bg-orange-light px-2.5 py-1 rounded-full">
                        <Clock size={10} /> Awaiting Approval
                    </span>
                );
            case "REJECTED":
                return (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
                        <X size={10} /> Rejected
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                        <Clock size={10} /> Pending
                    </span>
                );
        }
    };

    const getId = (d) => d._id || d.id;

    return (
        <div className="max-w-3xl mx-auto animate-fade-in">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-navy mb-2">Custom Domains</h1>
                <p className="text-sm text-warm-gray">Add your own domain for branded short links.</p>
            </div>

            {/* ── Add New Domain ── */}
            <div className="card p-5 mb-6">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-bold text-navy">Add your domain</h2>
                    <span className="text-[10px] text-warm-gray-light">{domains.length}/{domainLimit} domains</span>
                </div>
                {domainLimit === 0 ? (
                    <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                        <Crown size={18} className="text-blue-600 shrink-0" />
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-blue-900">Custom domains require a paid plan</p>
                            <p className="text-xs text-blue-600 mt-0.5">Upgrade to Growth or higher to add branded domains.</p>
                        </div>
                        <button onClick={() => navigate("/dashboard/pricing")} className="btn-primary text-xs shrink-0">
                            Upgrade
                        </button>
                    </div>
                ) : domains.length >= domainLimit ? (
                    <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl">
                        <AlertCircle size={18} className="text-amber-600 shrink-0" />
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-amber-900">Domain limit reached</p>
                            <p className="text-xs text-amber-600 mt-0.5">Your {plan} plan allows {domainLimit} domain{domainLimit !== 1 ? "s" : ""}. Upgrade for more.</p>
                        </div>
                        <button onClick={() => navigate("/dashboard/pricing")} className="btn-primary text-xs shrink-0">
                            Upgrade
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Globe size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-warm-gray-light pointer-events-none" />
                                <input
                                    value={newDomain}
                                    onChange={(e) => setNewDomain(e.target.value)}
                                    className="input-field w-full"
                                    style={{ paddingLeft: '2.5rem' }}
                                    placeholder="yourbrand.com"
                                    onKeyDown={(e) => e.key === "Enter" && handleAddDomain()}
                                />
                            </div>
                            <button onClick={handleAddDomain} disabled={adding} className="btn-primary text-sm shrink-0">
                                {adding ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                                {adding ? "Adding..." : "Add domain"}
                            </button>
                        </div>
                        <p className="text-[11px] text-warm-gray mt-2">
                            Enter a domain you own. You'll need to submit it for admin approval.
                        </p>
                    </>
                )}
            </div>

            {/* ── My Domains ── */}
            {domainsLoading ? (
                <div className="card p-8 text-center mb-6">
                    <Loader2 size={20} className="animate-spin text-warm-gray mx-auto" />
                </div>
            ) : domains.length > 0 ? (
                <div className="space-y-3 mb-6">
                    <p className="text-xs font-bold uppercase tracking-wider text-warm-gray-light">My Domains</p>
                    {domains.map((d) => (
                        <div key={getId(d)} className="card p-5">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-[#FFF3ED] flex items-center justify-center">
                                        <Globe size={16} className="text-orange" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-navy">{d.domain}</p>
                                        <p className="text-[11px] text-warm-gray">
                                            Added {new Date(d.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {getStatusBadge(d.status)}
                                    <button
                                        onClick={() => handleDelete(getId(d))}
                                        className="p-2 rounded-lg hover:bg-red-50 text-warm-gray hover:text-red-500 transition"
                                        title="Remove"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* PENDING — Show submit for approval button */}
                            {d.status === "PENDING" && (
                                <div className="bg-cream rounded-xl p-4 space-y-3">
                                    <p className="text-xs font-semibold text-navy">
                                        Click below to submit this domain for admin approval
                                    </p>
                                    <button
                                        onClick={() => handleVerify(getId(d))}
                                        disabled={verifying === getId(d)}
                                        className="btn-primary text-sm"
                                    >
                                        {verifying === getId(d) ? (
                                            <><Loader2 size={14} className="animate-spin" /> Submitting...</>
                                        ) : (
                                            <><RefreshCw size={14} /> Submit for Approval</>
                                        )}
                                    </button>
                                </div>
                            )}

                            {/* PENDING_APPROVAL — Waiting for admin */}
                            {d.status === "PENDING_APPROVAL" && (
                                <div className="bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 flex items-center gap-2">
                                    <Clock size={14} className="text-orange shrink-0" />
                                    <p className="text-xs text-orange-700">
                                        Domain submitted for admin approval. You'll be notified once the admin reviews it.
                                    </p>
                                </div>
                            )}

                            {/* REJECTED — Show rejection message with re-submit */}
                            {d.status === "REJECTED" && (
                                <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <AlertCircle size={14} className="text-red-500 shrink-0" />
                                        <p className="text-xs text-red-700">
                                            Domain was rejected by the admin. You can re-submit or remove it.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleVerify(getId(d))}
                                        disabled={verifying === getId(d)}
                                        className="btn-primary text-sm"
                                    >
                                        {verifying === getId(d) ? (
                                            <><Loader2 size={14} className="animate-spin" /> Submitting...</>
                                        ) : (
                                            <><RefreshCw size={14} /> Re-submit for Approval</>
                                        )}
                                    </button>
                                </div>
                            )}

                            {/* VERIFIED — Success message */}
                            {d.status === "VERIFIED" && (
                                <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 flex items-center gap-2">
                                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                                    <p className="text-xs text-emerald-700">
                                        Domain verified! You can now use <span className="font-bold">{d.domain}</span> when creating short links.
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card p-8 text-center mb-6">
                    <Globe size={32} className="text-gray-200 mx-auto mb-3" />
                    <p className="text-sm text-warm-gray mb-1">No custom domains yet</p>
                    <p className="text-xs text-warm-gray-light">Add a domain above to get started with branded links.</p>
                </div>
            )}

            {/* ── Domain Discovery (existing) ── */}
            <div className="card overflow-hidden">
                <div className="px-5 pt-4 pb-0">
                    <p className="text-xs font-bold uppercase tracking-wider text-warm-gray-light mb-3">Discover domains</p>
                </div>
                <div className="flex border-b border-border">
                    <button
                        onClick={() => setActiveTab("search")}
                        className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold transition-all duration-200 border-b-2 ${activeTab === "search"
                            ? "border-navy text-navy"
                            : "border-transparent text-warm-gray hover:text-navy hover:bg-gray-50"
                            }`}
                    >
                        <Search size={15} /> Search for a domain
                    </button>
                    <button
                        onClick={() => setActiveTab("ai")}
                        className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold transition-all duration-200 border-b-2 ${activeTab === "ai"
                            ? "border-navy text-navy"
                            : "border-transparent text-warm-gray hover:text-navy hover:bg-gray-50"
                            }`}
                    >
                        <Sparkles size={15} /> Find with AI
                    </button>
                </div>

                <div className="p-6">
                    {activeTab === "search" ? (
                        <div>
                            <label className="block text-sm font-semibold text-navy mb-3">Domain name</label>
                            <div className="flex gap-2">
                                <input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="input-field flex-1"
                                    placeholder="mybrand.com"
                                    onKeyDown={(e) => e.key === "Enter" && handleManualSearch()}
                                />
                                <button onClick={handleManualSearch} className="btn-primary text-sm shrink-0">
                                    Search
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <label className="block text-sm font-semibold text-navy mb-3">Describe your idea, product or service</label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <input
                                        value={aiPrompt}
                                        onChange={(e) => setAiPrompt(e.target.value.slice(0, 200))}
                                        className="input-field pr-16"
                                        placeholder="e.g. A daily newspaper covering global news"
                                        onKeyDown={(e) => e.key === "Enter" && handleAiSearch()}
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-warm-gray-light">
                                        {aiPrompt.length}/200
                                    </span>
                                </div>
                                <button onClick={handleAiSearch} disabled={loading} className="btn-primary text-sm shrink-0">
                                    {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                                    {loading ? "Generating..." : "Generate"}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Suggestions — plan-aware */}
                    {suggestions.length > 0 && (
                        <div className="mt-6 animate-fade-in">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-xs font-bold uppercase tracking-wider text-warm-gray-light">
                                    {domains.length >= domainLimit ? "Available domains" : "Available domains — click to add"}
                                </p>
                                <span className="text-[10px] text-warm-gray-light">
                                    {domains.length}/{domainLimit} domains used
                                </span>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {suggestions.map((domain, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition-all duration-200"
                                    >
                                        <span className="font-semibold text-navy text-sm">{domain}</span>
                                        {domains.length >= domainLimit ? (
                                            <button
                                                onClick={() => navigate("/dashboard/pricing")}
                                                className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-navy hover:text-white hover:border-navy transition-all duration-200"
                                            >
                                                Upgrade to claim
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleAddFromSuggestion(domain)}
                                                disabled={adding}
                                                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-orange text-white text-sm font-semibold hover:bg-orange-hover transition-all duration-200"
                                            >
                                                <Plus size={14} /> Add
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {domains.length >= domainLimit && (
                                <div className="mt-4 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-3">
                                    <Crown size={16} className="text-blue-600 shrink-0" />
                                    <div>
                                        <p className="text-xs font-semibold text-blue-900">
                                            Upgrade your plan to add custom domains
                                        </p>
                                        <p className="text-[11px] text-blue-600 mt-0.5">
                                            Growth: 3 domains · Premium: 10 domains
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
