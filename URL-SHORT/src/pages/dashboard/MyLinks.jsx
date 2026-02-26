import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getUserUrls, deleteUrl } from "../../api/url.api";
import { useToast } from "../../components/ui/Toast";
import { TableSkeleton } from "../../components/ui/Skeleton";
import {
    Copy, Check, BarChart3, Search, Link2, ExternalLink,
    ChevronLeft, ChevronRight, ArrowUpDown, Trash2, Loader2,
} from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const ITEMS_PER_PAGE = 8;

export default function MyLinks() {
    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [copiedId, setCopiedId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const { addToast } = useToast();

    const [sortBy, setSortBy] = useState("newest");

    useEffect(() => {
        getUserUrls()
            .then((res) => {
                // Filter out QR-only items — they belong in the QR section
                const regularLinks = (res.data.urls || []).filter(u => !u.isQRCode);
                setLinks(regularLinks.map((u) => {
                    const hasDomain = u.customDomain && u.customDomain.domain;
                    return {
                        id: u._id, shortId: u.shortId, original: u.redirectURL,
                        short: hasDomain
                            ? `https://${u.customDomain.domain}/${u.shortId}`
                            : `${BACKEND_URL}/url/${u.shortId}`,
                        localUrl: `${BACKEND_URL}/url/${u.shortId}`,
                        customDomain: hasDomain ? u.customDomain.domain : null,
                        clicks: u.visitHistory.length, createdAt: u.createdAt,
                    };
                }));
            })
            .catch(() => addToast("Failed to load links", "error"))
            .finally(() => setLoading(false));
    }, []);

    const copyToClipboard = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        addToast("Copied!");
        setTimeout(() => setCopiedId(null), 1500);
    };

    const handleDelete = async (link) => {
        if (!window.confirm("Delete this short link? This cannot be undone.")) return;
        setDeletingId(link.id);
        try {
            await deleteUrl(link.id);
            setLinks(prev => prev.filter(l => l.id !== link.id));
            addToast("Link deleted");
        } catch {
            addToast("Failed to delete link", "error");
        } finally {
            setDeletingId(null);
        }
    };

    const filtered = links
        .filter((l) =>
            l.original.toLowerCase().includes(search.toLowerCase()) ||
            l.shortId.toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) => {
            if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
            if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
            if (sortBy === "most-clicks") return b.clicks - a.clicks;
            if (sortBy === "least-clicks") return a.clicks - b.clicks;
            return 0;
        });

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    if (loading) return (
        <div className="animate-fade-in">
            <h1 className="text-2xl font-bold text-navy mb-6">My Links</h1>
            <TableSkeleton rows={5} />
        </div>
    );

    return (
        <div className="animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-navy mb-1">My Links</h1>
                    <p className="text-sm text-warm-gray">{links.length} link{links.length !== 1 ? "s" : ""} created</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-52">
                        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-warm-gray-light pointer-events-none" />
                        <input
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            className="input-field w-full"
                            style={{ paddingLeft: '2.5rem' }}
                            placeholder="Search links..."
                        />
                    </div>
                    <div className="relative">
                        <select
                            value={sortBy}
                            onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                            className="input-field appearance-none pr-8 text-sm cursor-pointer"
                            style={{ minWidth: '140px' }}
                        >
                            <option value="newest">Newest first</option>
                            <option value="oldest">Oldest first</option>
                            <option value="most-clicks">Most clicks</option>
                            <option value="least-clicks">Least clicks</option>
                        </select>
                        <ArrowUpDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-gray-light pointer-events-none" />
                    </div>
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="card p-12 text-center">
                    <Link2 size={36} className="text-gray-200 mx-auto mb-3" />
                    <p className="text-warm-gray text-sm">{search ? "No links match your search" : "No links created yet."}</p>
                    {!search && <Link to="/dashboard/shorten" className="btn-primary mt-4 text-sm inline-flex">Create your first link</Link>}
                </div>
            ) : (
                <div className="space-y-4">
                    {paginated.map((l) => (
                        <div key={l.id} className="card px-4 py-4 flex flex-col sm:flex-row sm:items-center gap-4 group transition-shadow hover:shadow-md">
                            <div className="flex-1 w-full min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="text-sm font-semibold text-navy truncate">{l.short}</p>
                                    {l.customDomain && (
                                        <span className="inline-flex items-center text-[9px] font-bold uppercase tracking-wider text-orange bg-orange-50 px-1.5 py-0.5 rounded-full shrink-0">
                                            {l.customDomain}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-warm-gray truncate">{l.original}</p>
                                <div className="flex sm:hidden items-center gap-4 text-xs text-warm-gray mt-3">
                                    <span className="bg-gray-50 px-2 py-1 rounded-lg font-medium">{l.clicks} click{l.clicks !== 1 ? "s" : ""}</span>
                                    {l.createdAt && <span>{new Date(l.createdAt).toLocaleDateString()}</span>}
                                </div>
                            </div>

                            <div className="hidden sm:flex items-center gap-4 text-xs text-warm-gray shrink-0 mr-4">
                                <span className="bg-gray-50 px-2 py-1 rounded-lg font-medium">{l.clicks} click{l.clicks !== 1 ? "s" : ""}</span>
                                {l.createdAt && <span>{new Date(l.createdAt).toLocaleDateString()}</span>}
                            </div>

                            <div className="flex items-center gap-1 shrink-0 w-full sm:w-auto justify-between sm:justify-end mt-2 sm:mt-0 pt-3 sm:pt-0 border-t border-border/50 sm:border-0">
                                <button onClick={() => copyToClipboard(l.short, l.id)}
                                    className="p-2.5 sm:p-2 flex-1 sm:flex-none flex items-center justify-center rounded-lg hover:bg-gray-50 transition text-warm-gray hover:text-navy" title="Copy">
                                    {copiedId === l.id ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                                </button>
                                <a href={l.localUrl || l.short} target="_blank" rel="noopener noreferrer"
                                    className="p-2.5 sm:p-2 flex-1 sm:flex-none flex items-center justify-center rounded-lg hover:bg-gray-50 transition text-warm-gray hover:text-navy" title="Open">
                                    <ExternalLink size={16} />
                                </a>
                                <Link to="/dashboard/analytics"
                                    className="p-2.5 sm:p-2 flex-1 sm:flex-none flex items-center justify-center rounded-lg hover:bg-gray-50 transition text-warm-gray hover:text-navy" title="Analytics">
                                    <BarChart3 size={16} />
                                </Link>
                                {/* Delete button */}
                                <button
                                    onClick={() => handleDelete(l)}
                                    disabled={deletingId === l.id}
                                    className="p-2.5 sm:p-2 flex-1 sm:flex-none flex items-center justify-center rounded-lg hover:bg-red-50 transition text-warm-gray hover:text-red-500"
                                    title="Delete link"
                                >
                                    {deletingId === l.id
                                        ? <Loader2 size={16} className="animate-spin" />
                                        : <Trash2 size={16} />
                                    }
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                    <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                        className="p-2 rounded-lg hover:bg-gray-50 transition text-warm-gray disabled:opacity-30">
                        <ChevronLeft size={16} />
                    </button>
                    <span className="text-sm text-warm-gray px-2">Page {page} of {totalPages}</span>
                    <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                        className="p-2 rounded-lg hover:bg-gray-50 transition text-warm-gray disabled:opacity-30">
                        <ChevronRight size={16} />
                    </button>
                </div>
            )}
        </div>
    );
}
