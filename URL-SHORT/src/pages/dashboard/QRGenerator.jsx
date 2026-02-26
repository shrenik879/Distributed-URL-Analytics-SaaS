import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getUserUrls, createShortUrl, deleteUrl } from "../../api/url.api";
import { useToast } from "../../components/ui/Toast";
import { useAuth } from "../../context/AuthContext";
import { QRCodeCanvas } from "qrcode.react";
import {
    Download, QrCode, Crown, Lock, Plus, Globe,
    MoreHorizontal, BarChart3, ArrowRight, Palette,
    CalendarDays, Loader2, ChevronLeft, Trash2,
} from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const QR_LIMITS = { FREE: 2, CORE: 5, GROWTH: 10, PREMIUM: 200 };
const colorPresets = ["#0B1736", "#EE6123", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

/* ─────────────────────────────────────────────
   QR card (list view)
───────────────────────────────────────────── */
function QrCard({ item, plan, onDownload, onDelete, onAnalytics }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const close = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
        document.addEventListener("mousedown", close);
        return () => document.removeEventListener("mousedown", close);
    }, []);

    const rawUrl = item.url || "";
    const dateStr = item.date
        ? new Date(item.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
        : "";

    const handleDelete = async () => {
        if (!window.confirm("Delete this QR code? This cannot be undone.")) return;
        setDeleting(true);
        await onDelete(item);
        setDeleting(false);
    };

    const isPaid = plan !== "FREE";

    return (
        <div className="card px-4 py-4 sm:px-5 flex flex-col sm:flex-row sm:items-center gap-4 group hover:shadow-md transition-shadow">
            {/* QR thumbnail */}
            <div className="shrink-0 bg-white border border-border rounded-xl p-2 shadow-sm self-start sm:self-auto" style={{ minWidth: 84 }}>
                {item.qrCode
                    ? <img src={item.qrCode} alt="QR" width={68} height={68} className="rounded-lg" />
                    : <QRCodeCanvas value={rawUrl || " "} size={68} fgColor={item.qrColor || "#0B1736"} bgColor="#ffffff" level="H" />
                }
            </div>

            {/* Info — no short link shown */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-warm-gray bg-gray-100 px-1.5 py-0.5 rounded-full">
                        <Globe size={10} /> Website
                    </span>
                </div>
                <p className="text-sm font-bold text-navy truncate">{item.title || ("Untitled " + dateStr)}</p>
                <p className="text-xs text-warm-gray truncate mt-0.5">
                    <span className="text-warm-gray-light">↳</span> {rawUrl}
                </p>
                <div className="flex items-center gap-3 mt-1.5 text-[11px] text-warm-gray">
                    {item.clicks !== undefined && (
                        <span className="flex items-center gap-1"><Lock size={9} /> {item.clicks} scans</span>
                    )}
                    {dateStr && (
                        <span className="flex items-center gap-1"><CalendarDays size={9} /> {dateStr}</span>
                    )}
                </div>
            </div>

            {/* Actions — always visible */}
            <div className="flex items-center gap-1 shrink-0 self-start sm:self-auto mt-2 sm:mt-0 w-full sm:w-auto justify-end">
                <button onClick={() => onDownload(item)}
                    className="p-2 rounded-lg hover:bg-gray-100 text-warm-gray hover:text-navy transition" title="Download QR">
                    <Download size={15} />
                </button>

                {/* Analytics — show for all plans, lock icon for free */}
                {item.id && (
                    <button onClick={() => onAnalytics(item, !isPaid)}
                        className={`p-2 rounded-lg hover:bg-gray-100 transition flex items-center gap-0.5 ${isPaid ? 'text-warm-gray hover:text-navy' : 'text-warm-gray-light'}`}
                        title={isPaid ? 'QR Analytics' : 'Upgrade to view analytics'}>
                        <BarChart3 size={15} />
                        {!isPaid && <Lock size={9} />}
                    </button>
                )}

                {/* Delete */}
                <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="p-2 rounded-lg hover:bg-red-50 text-warm-gray hover:text-red-500 transition"
                    title="Delete QR"
                >
                    {deleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                </button>

                {/* More menu */}
                <div className="relative" ref={menuRef}>
                    <button onClick={() => setMenuOpen(o => !o)}
                        className="p-2 rounded-lg hover:bg-gray-100 text-warm-gray hover:text-navy transition" title="More">
                        <MoreHorizontal size={15} />
                    </button>
                    {menuOpen && (
                        <div className="absolute right-0 top-full mt-1 bg-white border border-border rounded-xl shadow-lg z-20 w-44 overflow-hidden animate-fade-in">
                            <button onClick={() => { navigator.clipboard.writeText(rawUrl); setMenuOpen(false); }}
                                className="w-full text-left px-3 py-2.5 text-xs text-navy hover:bg-gray-50 transition">
                                Copy destination URL
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────
   QR Templates — preset colour combinations
───────────────────────────────────────────── */
const qrTemplates = [
    { name: "Classic", fg: "#0B1736", bg: "#ffffff" },
    { name: "Ocean", fg: "#1e3a5f", bg: "#e0f0ff" },
    { name: "Sunset", fg: "#b83200", bg: "#fff3e8" },
    { name: "Forest", fg: "#1a5c2a", bg: "#e8f5e9" },
    { name: "Royal Purple", fg: "#4a148c", bg: "#f3e5f5" },
    { name: "Midnight", fg: "#ffffff", bg: "#1a1a2e" },
    { name: "Rose Gold", fg: "#8b3a62", bg: "#fce4ec" },
    { name: "Slate", fg: "#334155", bg: "#f1f5f9" },
];

/* ─────────────────────────────────────────────
   Inline Create view
───────────────────────────────────────────── */
function CreateView({ usedCount, qrLimit, plan, onCreated, onCancel }) {
    const { addToast } = useToast();
    const [input, setInput] = useState("");
    const [title, setTitle] = useState("");
    const [color, setColor] = useState("#0B1736");
    const [bgColor, setBgColor] = useState("#ffffff");
    const [saving, setSaving] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(0); // index into qrTemplates
    const atLimit = usedCount >= qrLimit;

    const applyTemplate = (idx) => {
        setSelectedTemplate(idx);
        setColor(qrTemplates[idx].fg);
        setBgColor(qrTemplates[idx].bg);
    };

    const handleCreate = async () => {
        if (!input.trim()) return addToast("Enter a destination URL first", "error");
        setSaving(true);
        try {
            const res = await createShortUrl(input.trim(), undefined, undefined, {
                withQR: true,
                title: title.trim() || undefined,
                qrColor: color,
            });
            const { shortId, shortUrl, qrCode, title: savedTitle } = res.data;

            if (qrCode) {
                const a = document.createElement("a");
                a.href = qrCode;
                a.download = `${(savedTitle || shortId || "qr-code").replace(/\s+/g, "-")}.png`;
                a.click();
            }

            addToast("QR Code created & downloaded!");
            onCreated({
                shortId,
                title: savedTitle || title.trim() || null,
                url: input.trim(),
                short: shortUrl,
                qrCode,
                qrColor: color,
                clicks: 0,
                date: new Date().toISOString(),
            });
        } catch (err) {
            const msg = err.response?.data;
            if (msg?.qrLimitReached || msg?.limitReached) {
                addToast(msg.error || "QR code limit reached. Upgrade to create more.", "error");
            } else {
                addToast(msg?.error || "Failed to create QR code. Please try again.", "error");
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="animate-fade-in">
            {/* Page header */}
            <div className="mb-8">
                <button onClick={onCancel}
                    className="flex items-center gap-1.5 text-xs text-warm-gray hover:text-navy transition mb-3">
                    <ChevronLeft size={14} /> Back to QR Codes
                </button>
                <h1 className="text-2xl font-extrabold text-navy leading-tight">
                    Create a new QR Code
                </h1>
                <p className="text-sm text-warm-gray mt-1">
                    {atLimit
                        ? <span style={{ color: "#EE6123", fontWeight: 600 }}>You've reached your {plan} plan limit.</span>
                        : <>You can create <strong>{qrLimit - usedCount}</strong> more QR code{(qrLimit - usedCount) !== 1 ? "s" : ""} this month.{" "}
                            <Link to="/dashboard/pricing" style={{ color: "#EE6123", fontWeight: 600 }}>Upgrade for more.</Link></>
                    }
                </p>
            </div>

            {atLimit ? (
                <div className="card p-10 text-center max-w-md mx-auto">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl"
                        style={{ background: "#FFF0E8" }}>👑</div>
                    <p className="text-lg font-bold text-navy mb-2">QR Code limit reached</p>
                    <p className="text-sm text-warm-gray mb-6">
                        You've used <strong>{usedCount}</strong> of <strong>{qrLimit}</strong> QR codes on the <strong>{plan}</strong> plan.
                    </p>
                    <Link to="/dashboard/pricing" className="btn-primary text-sm inline-flex items-center gap-2">
                        <Crown size={14} /> Upgrade plan <ArrowRight size={14} />
                    </Link>
                </div>
            ) : (
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    {/* ── Left: form ── */}
                    <div className="flex-1 w-full min-w-0">
                        {/* Code details card */}
                        <div className="card p-6 mb-4">
                            <h2 className="text-sm font-bold text-navy mb-1">Code details</h2>
                            <p className="text-xs text-warm-gray mb-5">
                                You can create <strong>{qrLimit - usedCount}</strong> more code{(qrLimit - usedCount) !== 1 ? "s" : ""} this month.{" "}
                                <Link to="/dashboard/pricing" style={{ color: "#EE6123", fontWeight: 600 }}>Upgrade for more.</Link>
                            </p>
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-navy mb-2">
                                        Destination URL <span style={{ color: "#EE6123" }}>*</span>
                                    </label>
                                    <input
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === "Enter" && !saving) handleCreate(); }}
                                        className="input-field"
                                        placeholder="https://example.com/my-long-url"
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-navy mb-2">
                                        Title <span className="text-warm-gray font-normal">(optional)</span>
                                    </label>
                                    <input
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="input-field"
                                        placeholder="My QR Code"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* QR Templates card */}
                        <div className="card p-6 mb-4">
                            <label className="flex items-center gap-1.5 text-sm font-bold text-navy mb-1">
                                <QrCode size={15} style={{ color: "#EE6123" }} /> QR Templates
                            </label>
                            <p className="text-xs text-warm-gray mb-4">Choose a style for your QR code</p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {qrTemplates.map((t, i) => (
                                    <button key={t.name} onClick={() => applyTemplate(i)}
                                        className="flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all hover:shadow-md"
                                        style={{
                                            borderColor: selectedTemplate === i ? "#EE6123" : "#E5E7EB",
                                            background: selectedTemplate === i ? "#FFF8F4" : "#fff",
                                            transform: selectedTemplate === i ? "scale(1.03)" : "scale(1)",
                                        }}>
                                        <div className="rounded-lg p-1.5 shadow-sm border border-border"
                                            style={{ background: t.bg }}>
                                            <QRCodeCanvas value={input || "https://cliq.ly"} size={48}
                                                fgColor={t.fg} bgColor={t.bg} level="M" />
                                        </div>
                                        <span className="text-[10px] font-semibold text-navy leading-tight text-center">{t.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Custom Colour card */}
                        <div className="card p-6">
                            <label className="flex items-center gap-1.5 text-sm font-bold text-navy mb-4">
                                <Palette size={15} style={{ color: "#EE6123" }} /> Custom Colour
                            </label>
                            <div className="flex items-center gap-3 flex-wrap">
                                {colorPresets.map((c) => (
                                    <button key={c} onClick={() => { setColor(c); setSelectedTemplate(-1); }} title={c}
                                        style={{
                                            backgroundColor: c, width: 34, height: 34, borderRadius: 10,
                                            border: color === c && selectedTemplate === -1 ? "3px solid #EE6123" : "2px solid transparent",
                                            outline: color === c && selectedTemplate === -1 ? "2px solid rgba(238,97,35,0.25)" : "none",
                                            outlineOffset: "2px",
                                            transform: color === c && selectedTemplate === -1 ? "scale(1.15)" : "scale(1)",
                                            transition: "all 0.15s ease", cursor: "pointer",
                                        }} />
                                ))}
                                <label title="Pick custom colour"
                                    style={{ width: 34, height: 34, borderRadius: 10, border: "1.5px dashed #C8CCD2", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#9CA3AF" }}>
                                    +
                                    <input type="color" value={color} onChange={(e) => { setColor(e.target.value); setSelectedTemplate(-1); }}
                                        style={{ position: "absolute", opacity: 0, width: 0, height: 0 }} />
                                </label>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row items-center gap-3 mt-5">
                            <button onClick={handleCreate} disabled={!input.trim() || saving} className="btn-primary w-full sm:w-auto">
                                {saving
                                    ? <><Loader2 size={15} className="animate-spin" /> Creating...</>
                                    : <><Download size={15} /> Create & Download QR</>
                                }
                            </button>
                            <button onClick={onCancel} className="btn-secondary" disabled={saving}>
                                Cancel
                            </button>
                        </div>
                        <p className="text-xs text-warm-gray mt-3">
                            {usedCount}/{qrLimit} QR codes used on the <strong>{plan}</strong> plan
                        </p>
                    </div>

                    {/* ── Right: live preview ── */}
                    <div className="shrink-0 w-full lg:w-64 lg:sticky top-6">
                        <p className="text-xs font-bold uppercase tracking-widest text-warm-gray mb-3 text-center">Preview</p>
                        <div className="card p-6 flex flex-col items-center gap-4" style={{ background: "#F9F6F1" }}>
                            <div className="rounded-2xl p-5 shadow-sm border border-border"
                                style={{ background: bgColor }}>
                                <QRCodeCanvas
                                    value={input || " "}
                                    size={160}
                                    fgColor={color}
                                    bgColor={bgColor}
                                    level="H"
                                />
                            </div>
                            {input
                                ? <p className="text-[11px] text-warm-gray text-center break-all leading-relaxed max-w-full">
                                    {input.length > 45 ? input.slice(0, 45) + "…" : input}
                                </p>
                                : <p className="text-xs text-center" style={{ color: "#C8CCD2" }}>Enter a URL to see your QR code</p>
                            }
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ─────────────────────────────────────────────
   MAIN QRGenerator page
───────────────────────────────────────────── */
export default function QRGenerator() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const plan = user?.plan || "FREE";
    const qrLimit = QR_LIMITS[plan] ?? 2;

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [totalQRCreated, setTotalQRCreated] = useState(0); // total ever created (never decremented)

    // Fetch only QR-tagged URLs from DB
    useEffect(() => {
        getUserUrls()
            .then((res) => {
                const urls = (res.data.urls || []).filter(u => u.isQRCode || u.qrCode);
                setItems(urls.map((u) => ({
                    id: u._id, shortId: u.shortId,
                    title: u.title || null,
                    url: u.redirectURL,
                    short: `${BACKEND_URL}/url/${u.shortId}`,
                    qrCode: u.qrCode,
                    qrColor: u.qrColor || "#0B1736",
                    clicks: u.visitHistory?.length ?? 0,
                    date: u.createdAt,
                })));
                // Use total-ever-created from backend (never decremented on delete)
                setTotalQRCreated(res.data.totalQRCodesCreated || urls.length);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const usedCount = totalQRCreated; // based on total-ever-created, not current items
    const canCreate = usedCount < qrLimit;

    const downloadQR = (item) => {
        if (item.qrCode) {
            const a = document.createElement("a");
            a.href = item.qrCode;
            a.download = `${(item.shortId || item.title || "qr")}.png`;
            a.click();
            addToast("QR downloaded!");
            return;
        }
        addToast("QR not available", "error");
    };

    const handleDelete = async (item) => {
        try {
            await deleteUrl(item.id);
            setItems(prev => prev.filter(i => i.id !== item.id));
            addToast("QR code deleted");
        } catch {
            addToast("Failed to delete QR code", "error");
        }
    };

    const handleAnalytics = (item, needsUpgrade) => {
        if (needsUpgrade) {
            navigate("/dashboard/pricing");
        } else {
            navigate(`/dashboard/qr-analytics/${item.id}`);
        }
    };

    const handleCreated = (newItem) => {
        setItems((prev) => [{ id: newItem.shortId, ...newItem }, ...prev]);
        setTotalQRCreated(prev => prev + 1); // increment total-ever-created
        setCreating(false);
    };

    /* ── Create view ── */
    if (creating) {
        return (
            <CreateView
                usedCount={usedCount}
                qrLimit={qrLimit}
                plan={plan}
                onCreated={handleCreated}
                onCancel={() => setCreating(false)}
            />
        );
    }

    /* ── List view ── */
    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-navy mb-1">QR Codes</h1>
                    <p className="text-sm text-warm-gray">Generate and manage QR codes for your links.</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right hidden sm:block">
                        <p className="text-xs text-warm-gray">{usedCount}/{qrLimit} used</p>
                        {!canCreate && (
                            <button onClick={() => navigate("/dashboard/pricing")}
                                className="text-[11px] font-semibold hover:underline flex items-center gap-1 mt-0.5 ml-auto"
                                style={{ color: "#EE6123" }}>
                                <Crown size={10} /> Upgrade
                            </button>
                        )}
                    </div>
                    {/* Create button: active only when under limit */}
                    {canCreate ? (
                        <button onClick={() => setCreating(true)} className="btn-primary text-sm">
                            <Plus size={14} /> Create QR Code
                        </button>
                    ) : (
                        <button
                            onClick={() => navigate("/dashboard/pricing")}
                            className="btn-primary text-sm opacity-80 cursor-pointer"
                            style={{ background: "#6b7280" }}
                        >
                            <Lock size={14} /> Limit reached — Upgrade
                        </button>
                    )}
                </div>
            </div>

            {/* Usage bar */}
            <div className="card p-4 mb-6 flex items-center gap-4">
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-1.5">
                        <p className="text-xs font-semibold text-navy">QR Codes used</p>
                        <p className="text-xs text-warm-gray">{usedCount} / {qrLimit}</p>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-500 ${usedCount >= qrLimit ? "bg-orange" : "bg-emerald-500"}`}
                            style={{ width: `${Math.min(100, (usedCount / qrLimit) * 100)}%` }} />
                    </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0"
                    style={{ background: "#FFF0E8", color: "#EE6123" }}>{plan}</span>
            </div>

            {/* QR list */}
            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="card px-5 py-4 flex items-center gap-4 animate-pulse">
                            <div className="w-20 h-20 bg-gray-100 rounded-xl shrink-0" />
                            <div className="flex-1 space-y-2">
                                <div className="h-3 bg-gray-100 rounded w-1/3" />
                                <div className="h-4 bg-gray-100 rounded w-1/2" />
                                <div className="h-3 bg-gray-100 rounded w-2/3" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : items.length === 0 ? (
                <div className="card p-14 text-center">
                    <QrCode size={40} className="mx-auto mb-3" style={{ color: "#E5E7EB" }} />
                    <p className="text-sm font-semibold text-navy mb-1">No QR codes yet</p>
                    <p className="text-xs text-warm-gray mb-4">
                        Create your first QR code — it's saved to your account and available after every refresh.
                    </p>
                    {canCreate && (
                        <button onClick={() => setCreating(true)} className="btn-primary text-sm inline-flex">
                            <Plus size={14} /> Create QR Code
                        </button>
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    {items.map((item) => (
                        <QrCard
                            key={item.id}
                            item={item}
                            plan={plan}
                            onDownload={downloadQR}
                            onDelete={handleDelete}
                            onAnalytics={handleAnalytics}
                        />
                    ))}
                    <div className="flex items-center gap-3 py-5 text-xs text-warm-gray justify-center">
                        <div className="h-px bg-gray-200 flex-1 max-w-24" />
                        You've reached the end of your QR codes
                        <div className="h-px bg-gray-200 flex-1 max-w-24" />
                    </div>
                </div>
            )}
        </div>
    );
}
