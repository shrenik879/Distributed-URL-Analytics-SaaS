import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useToast } from "../../components/ui/Toast";
import { Plus, Trash2, ExternalLink, Loader2, ArrowRight, LayoutTemplate, GripVertical, Crown } from "lucide-react";

const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;

const TEMPLATE_CATEGORIES = [
    { id: "all", label: "All templates" },
    { id: "link-in-bio", label: "Link-in-bio" },
    { id: "products", label: "Products and services" },
    { id: "business-card", label: "Digital business card" },
    { id: "promotions", label: "Promotions" },
];

const TEMPLATES = [
    {
        id: 1, name: "The Brew Coffee", category: "products",
        desc: "Artisan coffee & community",
        bg: "linear-gradient(135deg, #D97706 0%, #B45309 100%)",
        textColor: "#fff", linkBg: "#fff", linkText: "#B45309",
        links: [
            { label: "Locations", url: "https://example.com/locations" },
            { label: "What's new", url: "https://example.com/new" },
            { label: "Shop merch", url: "https://example.com/shop" },
        ],
    },
    {
        id: 2, name: "The Grand Hotel", category: "products",
        desc: "Your new escape awaits",
        bg: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
        textColor: "#fff", linkBg: "#fff", linkText: "#1a1a2e",
        links: [
            { label: "Website", url: "https://example.com" },
            { label: "Book your stay", url: "https://example.com/book" },
            { label: "Restaurant", url: "https://example.com/dine" },
        ],
    },
    {
        id: 3, name: "Hearth & Home", category: "products",
        desc: "Create a space you love",
        bg: "linear-gradient(135deg, #0d9488 0%, #0f766e 100%)",
        textColor: "#fff", linkBg: "#fff", linkText: "#0f766e",
        links: [
            { label: "Shop our website", url: "https://example.com/shop" },
            { label: "Find a store", url: "https://example.com/stores" },
            { label: "Our New Arrivals", url: "https://example.com/new" },
        ],
    },
    {
        id: 4, name: "Natural Beauty", category: "products",
        desc: "Naturally beautiful",
        bg: "linear-gradient(135deg, #d4c5a9 0%, #c4b08e 100%)",
        textColor: "#2d2d2d", linkBg: "#fff", linkText: "#6b5a3e",
        links: [
            { label: "Natural hand wash", url: "https://example.com/hand-wash" },
            { label: "Natural body wash", url: "https://example.com/body-wash" },
            { label: "Full collection", url: "https://example.com/all" },
        ],
    },
    {
        id: 5, name: "Creative Portfolio", category: "link-in-bio",
        desc: "Showcase your best work",
        bg: "linear-gradient(135deg, #EE6123 0%, #d4510f 100%)",
        textColor: "#fff", linkBg: "#fff", linkText: "#EE6123",
        links: [
            { label: "Portfolio", url: "https://example.com/portfolio" },
            { label: "LinkedIn", url: "https://linkedin.com" },
            { label: "Contact me", url: "https://example.com/contact" },
        ],
    },
    {
        id: 6, name: "Fitness Coach", category: "link-in-bio",
        desc: "Transform your body & mind",
        bg: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
        textColor: "#fff", linkBg: "#fff", linkText: "#7c3aed",
        links: [
            { label: "Book a session", url: "https://example.com/book" },
            { label: "YouTube Channel", url: "https://youtube.com" },
            { label: "Free workouts", url: "https://example.com/free" },
        ],
    },
    {
        id: 7, name: "Tech Startup", category: "business-card",
        desc: "Building the future",
        bg: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
        textColor: "#fff", linkBg: "#fff", linkText: "#2563eb",
        links: [
            { label: "Our Product", url: "https://example.com" },
            { label: "Careers", url: "https://example.com/careers" },
            { label: "Blog", url: "https://example.com/blog" },
        ],
    },
    {
        id: 8, name: "Summer Sale", category: "promotions",
        desc: "Up to 50% off everything",
        bg: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
        textColor: "#fff", linkBg: "#fff", linkText: "#dc2626",
        links: [
            { label: "Shop the sale", url: "https://example.com/sale" },
            { label: "New arrivals", url: "https://example.com/new" },
            { label: "Gift cards", url: "https://example.com/gifts" },
        ],
    },
];

/* ── Phone-shaped template preview card ── */
function TemplateCard({ template, onClick, isCreating }) {
    return (
        <button
            onClick={() => onClick(template)}
            disabled={isCreating}
            className="group text-left transition-all duration-300 hover:-translate-y-2 disabled:opacity-50"
        >
            <div
                className="rounded-2xl overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-300 w-full sm:w-[180px] max-w-[180px]"
            >
                {/* Header with gradient */}
                <div
                    className="pt-6 pb-4 px-4 text-center"
                    style={{ background: template.bg, color: template.textColor }}
                >
                    {/* Initials circle */}
                    <div
                        className="w-11 h-11 rounded-full mx-auto mb-2.5 flex items-center justify-center text-sm font-bold"
                        style={{
                            background: "rgba(255,255,255,0.2)",
                            backdropFilter: "blur(4px)",
                            color: template.textColor,
                            border: `2px solid ${template.textColor}30`,
                        }}
                    >
                        {template.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <p className="text-xs font-bold leading-tight">{template.name}</p>
                    <p className="text-[9px] opacity-70 mt-0.5">{template.desc}</p>
                </div>

                {/* Links preview */}
                <div className="bg-white px-3 py-3 space-y-1.5">
                    {template.links.map((link, i) => (
                        <div
                            key={i}
                            className="text-[10px] font-semibold text-center py-2 rounded-lg transition-all"
                            style={{
                                background: template.linkBg,
                                color: template.linkText,
                                border: `1px solid ${template.linkText}20`,
                            }}
                        >
                            {link.label}
                        </div>
                    ))}
                </div>
            </div>
        </button>
    );
}

/* ── PageCard: self-contained expandable page management card ── */
function PageCard({ page: initialPage, onManage, onDelete, onLinkAdded, onLinkDeleted, addToast }) {
    const [page, setPage] = useState(initialPage);
    const [expanded, setExpanded] = useState(false);
    const [label, setLabel] = useState("");
    const [url, setUrl] = useState("");
    const [adding, setAdding] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    // Keep in sync if parent updates
    useEffect(() => setPage(initialPage), [initialPage]);

    const addLink = async () => {
        if (!label.trim() || !url.trim()) return addToast("Both label and URL are required", "error");
        setAdding(true);
        try {
            const res = await api.post("/page/link", { label: label.trim(), url: url.trim(), pageId: page._id });
            setPage(res.data);
            setLabel(""); setUrl("");
            onLinkAdded?.(res.data);
            addToast("Link added!");
        } catch (err) {
            addToast(err.response?.data?.error || "Failed to add link", "error");
        } finally { setAdding(false); }
    };

    const deleteLink = async (linkId) => {
        setDeletingId(linkId);
        try {
            const res = await api.delete(`/page/link/${linkId}`);
            setPage(res.data);
            onLinkDeleted?.(res.data);
            addToast("Link removed");
        } catch (err) {
            addToast(err.response?.data?.error || "Failed to delete link", "error");
        } finally { setDeletingId(null); }
    };

    return (
        <div className="card overflow-hidden">
            {/* Card header */}
            <div
                className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition"
                onClick={() => setExpanded((e) => !e)}
            >
                <div className="min-w-0">
                    <p className="font-bold text-navy truncate">{page.title}</p>
                    <p className="text-[11px] text-warm-gray-light truncate mt-0.5">
                        {page.links?.length || 0} links · {FRONTEND_URL}/u/{page._id}
                    </p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3" onClick={(e) => e.stopPropagation()}>
                    <span className="text-xs font-semibold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">Live</span>
                    <a
                        href={`${FRONTEND_URL}/u/${page._id}`}
                        target="_blank" rel="noopener noreferrer"
                        className="p-1.5 rounded-lg text-warm-gray hover:text-navy hover:bg-gray-100 transition"
                        title="Open page"
                    >
                        <ExternalLink size={14} />
                    </a>
                    <button
                        onClick={onDelete}
                        className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition"
                        title="Delete page"
                    >
                        <Trash2 size={14} />
                    </button>
                    <span className={`text-warm-gray-light transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}>
                        ▾
                    </span>
                </div>
            </div>

            {/* Expandable details */}
            {expanded && (
                <div className="border-t border-gray-100 px-5 py-4 space-y-4 bg-gray-50/50">
                    {/* Links list */}
                    {page.links?.length > 0 ? (
                        <div className="space-y-2">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-warm-gray-light">Links ({page.links.length})</p>
                            {page.links.map((link) => (
                                <div key={link._id} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-gray-100 group">
                                    <GripVertical size={13} className="text-gray-300 shrink-0" />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-navy truncate">{link.label}</p>
                                        <p className="text-xs text-warm-gray truncate">{link.url}</p>
                                    </div>
                                    <button
                                        onClick={() => deleteLink(link._id)}
                                        disabled={deletingId === link._id}
                                        className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition shrink-0 opacity-0 group-hover:opacity-100"
                                    >
                                        {deletingId === link._id
                                            ? <Loader2 size={13} className="animate-spin text-red-400" />
                                            : <Trash2 size={13} />}
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-warm-gray-light text-center py-2">No links yet. Add one below.</p>
                    )}

                    {/* Add Link form */}
                    <div className="bg-white rounded-xl border border-gray-100 p-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-warm-gray-light mb-3">Add Link</p>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <input
                                value={label}
                                onChange={(e) => setLabel(e.target.value)}
                                className="input-field flex-1 text-sm bg-gray-50"
                                placeholder="Label (e.g. YouTube)"
                            />
                            <input
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && addLink()}
                                className="input-field flex-1 text-sm bg-gray-50"
                                placeholder="https://..."
                            />
                            <button
                                onClick={addLink}
                                disabled={adding}
                                className="btn-primary text-sm shrink-0 w-full sm:w-auto"
                            >
                                {adding ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                                {adding ? "Adding..." : "Add"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ── Main Pages Component ── */
export default function Pages() {
    const navigate = useNavigate();
    const [view, setView] = useState("loading"); // "loading" | "templates" | "no-quota" | "create" | "manage" | "list"
    const [pageData, setPageData] = useState(null);    // currently managed page
    const [allPages, setAllPages] = useState([]);      // all user pages
    const [planMeta, setPlanMeta] = useState({ limit: 1, used: 0, canCreate: false });
    const [pageTitle, setPageTitle] = useState("");
    const [linkLabel, setLinkLabel] = useState("");
    const [linkUrl, setLinkUrl] = useState("");
    const [creating, setCreating] = useState(false);
    const [addingLink, setAddingLink] = useState(false);
    const [deletingLink, setDeletingLink] = useState(null);
    const [deletingPage, setDeletingPage] = useState(false);
    const [activeCategory, setActiveCategory] = useState("all");
    const { addToast } = useToast();

    // Fetch all pages + plan meta on mount
    useEffect(() => {
        api
            .get("/page/me")
            .then((res) => {
                const { pages, limit, used, canCreate } = res.data;
                setPlanMeta({ limit, used, canCreate });
                setAllPages(pages);
                if (pages.length === 0) {
                    // No pages — show create if allowed, upgrade if not
                    setView(canCreate ? "templates" : "no-quota");
                } else if (pages.length === 1) {
                    setPageData(pages[0]);
                    setView("manage");
                } else {
                    setView("list");
                }
            })
            .catch(() => {
                setAllPages([]);
                setView("templates");
            });
    }, []);

    const refreshPages = async () => {
        try {
            const res = await api.get("/page/me");
            const { pages, limit, used, canCreate } = res.data;
            setPlanMeta({ limit, used, canCreate });
            setAllPages(pages);
            return { pages, canCreate };
        } catch {
            return { pages: [], canCreate: false };
        }
    };

    const filteredTemplates =
        activeCategory === "all"
            ? TEMPLATES
            : TEMPLATES.filter((t) => t.category === activeCategory);

    // ── Create page (from scratch or template)
    const createPage = async (title, templateLinks = [], theme = null) => {
        if (!title?.trim()) return addToast("Page title is required", "error");
        setCreating(true);
        try {
            const body = { title: title.trim() };
            if (theme) body.theme = theme;

            const res = await api.post("/page/create", body);
            const newPage = res.data; // save the newly created page

            // Add template links — MUST pass pageId to target the new page specifically
            for (const link of templateLinks) {
                try {
                    await api.post("/page/link", { label: link.label, url: link.url, pageId: newPage._id });
                } catch (linkErr) {
                    console.error("Failed to add link:", link.label, linkErr);
                }
            }

            const { pages, canCreate } = await refreshPages();
            // Reload the page data fresh (with links)
            const freshPage = pages.find((p) => p._id === newPage._id) || pages[0];
            setPageData(freshPage);
            setPageTitle("");
            setView(pages.length > 1 ? "list" : "manage");
            addToast("Page created successfully!");
        } catch (err) {
            const msg = err.response?.data?.error || "Failed to create page";
            if (err.response?.data?.limitReached) {
                addToast(msg, "error");
                navigate("/dashboard/pricing");
            } else {
                addToast(msg, "error");
            }
        } finally {
            setCreating(false);
        }
    };

    // ── Add a link (targets explicit page if set, else most recent)
    const addLink = async () => {
        if (!linkLabel.trim() || !linkUrl.trim())
            return addToast("Both label and URL are required", "error");

        setAddingLink(true);
        try {
            const res = await api.post("/page/link", {
                label: linkLabel.trim(),
                url: linkUrl.trim(),
                pageId: pageData?._id,
            });
            setPageData(res.data);
            setLinkLabel("");
            setLinkUrl("");
            addToast("Link added!");
        } catch (err) {
            addToast(err.response?.data?.error || "Failed to add link", "error");
        } finally {
            setAddingLink(false);
        }
    };

    // ── Delete a single link
    const deleteLink = async (linkId) => {
        setDeletingLink(linkId);
        try {
            const res = await api.delete(`/page/link/${linkId}`);
            setPageData(res.data);
            addToast("Link removed");
        } catch (err) {
            addToast(err.response?.data?.error || "Failed to delete link", "error");
        } finally {
            setDeletingLink(null);
        }
    };

    // ── Delete entire page
    const deletePage = async () => {
        if (!window.confirm("Are you sure? This will delete your page and all its links."))
            return;
        setDeletingPage(true);
        try {
            await api.delete(`/page/delete/${pageData._id}`);
            const { pages, canCreate } = await refreshPages();
            if (pages.length === 0) {
                setPageData(null);
                // FREE users who've used quota → show upgrade; others → show create
                setView(canCreate ? "templates" : "no-quota");
            } else {
                setPageData(pages[0]);
                setView(pages.length === 1 ? "manage" : "list");
            }
            addToast("Page deleted");
        } catch (err) {
            addToast(err.response?.data?.error || "Failed to delete page", "error");
        } finally {
            setDeletingPage(false);
        }
    };

    // ── Loading state
    if (view === "loading") {
        return (
            <div className="max-w-5xl mx-auto">
                <h1 className="text-2xl font-bold text-navy mb-6">Pages</h1>
                <div className="card p-12 flex justify-center">
                    <Loader2 size={24} className="animate-spin text-warm-gray-light" />
                </div>
            </div>
        );
    }

    // ── No-quota view (FREE user who already used 1 page lifetime)
    if (view === "no-quota") {
        return (
            <div className="max-w-lg mx-auto animate-fade-in text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 mx-auto mb-5 flex items-center justify-center">
                    <Crown size={28} className="text-blue-600" />
                </div>
                <h1 className="text-2xl font-bold text-navy mb-2">Upgrade to create more pages</h1>
                <p className="text-sm text-warm-gray mb-6 max-w-sm mx-auto">
                    The Free plan allows 1 landing page (lifetime). You've already used yours.
                    Upgrade to Core or higher to create more.
                </p>
                <div className="flex items-center justify-center gap-3">
                    <button
                        onClick={() => navigate("/dashboard/pricing")}
                        className="btn-primary text-sm"
                    >
                        Upgrade Plan <ArrowRight size={14} />
                    </button>
                </div>
                <div className="mt-6 text-xs text-warm-gray-light">
                    Core: 5 pages · Growth: 10 pages · Premium: 20 pages
                </div>
            </div>
        );
    }

    // ── List all pages (with inline per-page link management)
    if (view === "list") {
        const canCreateMore = planMeta.canCreate;
        return (
            <div className="max-w-3xl mx-auto animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-navy">Your Pages</h1>
                        <p className="text-xs text-warm-gray mt-0.5">{planMeta.used}/{planMeta.limit} pages used</p>
                    </div>
                    {canCreateMore ? (
                        <button onClick={() => setView("templates")} className="btn-primary text-sm">
                            <Plus size={14} /> Create page
                        </button>
                    ) : (
                        <button onClick={() => navigate("/dashboard/pricing")} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-orange hover:text-white hover:border-orange transition-all">
                            <Crown size={14} /> Upgrade for more
                        </button>
                    )}
                </div>

                {/* Page cards with inline management */}
                <div className="space-y-4">
                    {allPages.map((p) => (
                        <PageCard
                            key={p._id}
                            page={p}
                            onManage={() => { setPageData(p); setView("manage"); }}
                            onDelete={async () => {
                                if (!window.confirm("Delete this page and all its links?")) return;
                                try {
                                    await api.delete(`/page/delete/${p._id}`);
                                    const { pages, canCreate } = await refreshPages();
                                    if (pages.length === 0) { setView(canCreate ? "templates" : "no-quota"); }
                                    else if (pages.length === 1) { setPageData(pages[0]); setView("manage"); }
                                    else { setView("list"); }
                                    addToast("Page deleted");
                                } catch (err) {
                                    addToast(err.response?.data?.error || "Failed to delete page", "error");
                                }
                            }}
                            onLinkAdded={(updatedPage) => {
                                setAllPages((prev) => prev.map((pg) => pg._id === updatedPage._id ? updatedPage : pg));
                            }}
                            onLinkDeleted={(updatedPage) => {
                                setAllPages((prev) => prev.map((pg) => pg._id === updatedPage._id ? updatedPage : pg));
                            }}
                            addToast={addToast}
                        />
                    ))}
                </div>
            </div>
        );
    }

    // ── Template gallery view
    if (view === "templates") {
        return (
            <div className="max-w-5xl mx-auto animate-fade-in">
                {/* Hero */}
                <div className="mb-8">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-navy mb-3">
                        Pages that turn visits into engagements
                    </h1>
                    <p className="text-sm text-warm-gray mb-5 leading-relaxed max-w-lg">
                        Create a customized landing page that makes it easy for your audience
                        to engage. Pick a template or start from scratch.
                    </p>
                    <button
                        onClick={() => setView("create")}
                        className="btn-primary text-sm"
                    >
                        Create your first page <ArrowRight size={14} />
                    </button>
                </div>

                {/* Get inspired heading */}
                <div className="mb-4">
                    <h2 className="text-lg font-bold text-navy mb-1">
                        Get inspired
                    </h2>
                    <p className="text-xs text-warm-gray">
                        Select a template. You can change the content, colors, and layout
                        later.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-6">
                    {/* Category sidebar */}
                    <div className="w-full sm:w-44 shrink-0">
                        <button
                            onClick={() => setView("create")}
                            className="flex items-center justify-center gap-2 w-full px-3 py-2.5 text-sm rounded-lg border border-border text-navy font-semibold hover:bg-gray-50 hover:border-navy transition mb-4"
                        >
                            <Plus size={14} /> Start from scratch
                        </button>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-warm-gray-light mb-2 px-3">
                            By use case
                        </p>
                        <div className="flex overflow-x-auto sm:block gap-2 sm:gap-0 pb-2 sm:pb-0 mb-4 sm:mb-0" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
                            {TEMPLATE_CATEGORIES.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={`shrink-0 text-left px-4 py-2 text-sm rounded-lg transition-all duration-200 sm:mb-0.5 sm:w-full ${activeCategory === cat.id
                                        ? "text-blue-700 bg-blue-50 font-semibold"
                                        : "text-warm-gray hover:bg-gray-50 hover:text-navy"
                                        }`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Template grid */}
                    <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 justify-items-center sm:justify-items-start">
                        {filteredTemplates.map((t) => (
                            <TemplateCard
                                key={t.id}
                                template={t}
                                onClick={(tmpl) => createPage(tmpl.name, tmpl.links, {
                                    headerBg: tmpl.bg,
                                    textColor: tmpl.textColor,
                                    linkBg: tmpl.linkBg,
                                    linkText: tmpl.linkText,
                                    avatarBg: "rgba(255,255,255,0.2)",
                                })}
                                isCreating={creating}
                            />
                        ))}
                    </div>
                </div>

                {creating && (
                    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-3">
                            <Loader2 size={28} className="animate-spin text-orange" />
                            <p className="text-sm font-semibold text-navy">Creating your page...</p>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // ── Create from scratch view
    if (view === "create") {
        return (
            <div className="max-w-lg mx-auto animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-navy">Create your page</h1>
                    <button
                        onClick={() => setView("templates")}
                        className="text-sm text-orange font-semibold hover:underline flex items-center gap-1.5"
                    >
                        <LayoutTemplate size={14} /> Browse templates
                    </button>
                </div>

                <div className="card p-6">
                    <div className="text-center py-4 mb-4">
                        <div className="w-16 h-16 rounded-2xl bg-cream mx-auto mb-3 flex items-center justify-center">
                            <span className="text-2xl">📄</span>
                        </div>
                        <p className="text-warm-gray text-sm">
                            Start fresh with your own custom page.
                        </p>
                    </div>

                    <label className="block text-sm font-semibold text-navy mb-1.5">
                        Page Title
                    </label>
                    <input
                        value={pageTitle}
                        onChange={(e) => setPageTitle(e.target.value)}
                        className="input-field mb-4"
                        placeholder="e.g. My Links, John's Portfolio"
                        onKeyDown={(e) => e.key === "Enter" && createPage(pageTitle)}
                    />
                    <button
                        onClick={() => createPage(pageTitle)}
                        disabled={creating}
                        className="btn-primary w-full"
                    >
                        {creating ? (
                            <>
                                <Loader2 size={14} className="animate-spin" /> Creating...
                            </>
                        ) : (
                            "Create Page"
                        )}
                    </button>
                </div>
            </div>
        );
    }

    // ── Manage existing page view
    const canCreateMore = planMeta.used < planMeta.limit;
    return (
        <div className="max-w-xl mx-auto animate-fade-in space-y-5">
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                    {allPages.length > 1 && (
                        <button onClick={() => setView("list")} className="text-sm text-warm-gray hover:text-navy font-semibold flex items-center gap-1">
                            ← Pages
                        </button>
                    )}
                    <h1 className="text-2xl font-bold text-navy">{pageData?.title || "Your Page"}</h1>
                    <span className="text-xs font-semibold bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full">Live</span>
                </div>
                {canCreateMore ? (
                    <button onClick={() => setView("templates")} className="btn-primary text-xs">
                        <Plus size={12} /> Create another
                    </button>
                ) : (
                    <button onClick={() => navigate("/dashboard/pricing")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 text-gray-500 hover:bg-orange hover:text-white hover:border-orange transition-all">
                        <Crown size={12} /> Upgrade for more pages
                    </button>
                )}
            </div>

            {/* Public URL card */}
            <div className="card p-5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-warm-gray-light mb-2">
                    Public URL
                </p>
                <div className="flex items-center justify-between gap-3">
                    <a
                        href={`${FRONTEND_URL}/u/${pageData?._id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-blue-600 hover:text-blue-700 break-all transition"
                    >
                        {FRONTEND_URL}/u/{pageData?._id}
                    </a>
                    <a
                        href={`${FRONTEND_URL}/u/${pageData?._id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg hover:bg-gray-50 transition text-warm-gray hover:text-navy shrink-0"
                    >
                        <ExternalLink size={16} />
                    </a>
                </div>
            </div>

            {/* Page title display */}
            <div className="card p-5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-warm-gray-light mb-1">
                    Page Title
                </p>
                <p className="text-base font-bold text-navy">{pageData?.title}</p>
            </div>

            {/* Add Link form */}
            <div className="card p-5">
                <h3 className="text-sm font-bold text-navy mb-3">Add a Link</h3>
                <div className="space-y-3">
                    <div>
                        <label className="block text-xs font-semibold text-navy mb-1">
                            Label
                        </label>
                        <input
                            value={linkLabel}
                            onChange={(e) => setLinkLabel(e.target.value)}
                            className="input-field"
                            placeholder="e.g. Portfolio, YouTube, Shop"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-navy mb-1">
                            URL
                        </label>
                        <input
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                            className="input-field"
                            placeholder="https://example.com"
                            onKeyDown={(e) => e.key === "Enter" && addLink()}
                        />
                    </div>
                    <button
                        onClick={addLink}
                        disabled={addingLink}
                        className="btn-primary text-sm w-full sm:w-auto"
                    >
                        {addingLink ? (
                            <>
                                <Loader2 size={14} className="animate-spin" /> Adding...
                            </>
                        ) : (
                            <>
                                <Plus size={14} /> Add Link
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Link list */}
            {pageData?.links?.length > 0 && (
                <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-warm-gray-light mb-2">
                        Your Links ({pageData.links.length})
                    </p>
                    <div className="space-y-2">
                        {pageData.links.map((link) => (
                            <div
                                key={link._id}
                                className="card px-4 py-3.5 flex items-center gap-3 group hover:shadow-md transition-all duration-200"
                            >
                                <GripVertical
                                    size={14}
                                    className="text-gray-300 shrink-0"
                                />
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-navy truncate">
                                        {link.label}
                                    </p>
                                    <p className="text-xs text-warm-gray truncate">{link.url}</p>
                                </div>
                                <button
                                    onClick={() => deleteLink(link._id)}
                                    disabled={deletingLink === link._id}
                                    className="p-2 rounded-lg hover:bg-red-50 transition text-gray-300 hover:text-red-500 shrink-0 opacity-0 group-hover:opacity-100"
                                >
                                    {deletingLink === link._id ? (
                                        <Loader2 size={14} className="animate-spin text-red-400" />
                                    ) : (
                                        <Trash2 size={14} />
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {pageData?.links?.length === 0 && (
                <div className="card p-8 text-center">
                    <p className="text-sm text-warm-gray">
                        No links yet. Add your first link above!
                    </p>
                </div>
            )}

            {/* Danger zone */}
            <div className="border border-red-100 rounded-2xl p-5">
                <h3 className="text-xs font-bold text-red-500 uppercase tracking-wider mb-2">
                    Danger Zone
                </h3>
                <p className="text-xs text-warm-gray mb-3">
                    Delete your page and all links permanently. This cannot be undone.
                </p>
                <button
                    onClick={deletePage}
                    disabled={deletingPage}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 text-red-500 text-sm font-semibold hover:bg-red-50 transition"
                >
                    {deletingPage ? (
                        <Loader2 size={14} className="animate-spin" />
                    ) : (
                        <Trash2 size={14} />
                    )}
                    {deletingPage ? "Deleting..." : "Delete Page"}
                </button>
            </div>
        </div>
    );
}
