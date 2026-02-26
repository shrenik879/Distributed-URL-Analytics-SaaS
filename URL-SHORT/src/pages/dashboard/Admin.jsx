import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useToast } from "../../components/ui/Toast";
import { CardSkeleton } from "../../components/ui/Skeleton";
import { Shield, Link2, MousePointerClick, BarChart3 } from "lucide-react";

export default function Admin() {
    const [urls, setUrls] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();

    useEffect(() => {
        api.get("/url")
            .then((res) => setUrls(res.data.urls || []))
            .catch(() => addToast("Failed to load admin data", "error"))
            .finally(() => setLoading(false));
    }, []);

    const totalClicks = urls.reduce((sum, u) => sum + (u.visitHistory?.length || 0), 0);

    if (loading) return (
        <div className="space-y-6 animate-fade-in">
            <h1 className="text-2xl font-bold text-navy">Admin Panel</h1>
            <div className="grid sm:grid-cols-3 gap-4"><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>
        </div>
    );

    const stats = [
        { label: "Total URLs", value: urls.length, icon: Link2, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Total Clicks", value: totalClicks, icon: MousePointerClick, color: "text-orange", bg: "bg-orange-light" },
        { label: "Active Links", value: urls.filter((u) => (u.visitHistory?.length || 0) > 0).length, icon: BarChart3, color: "text-emerald-600", bg: "bg-emerald-50" },
    ];

    return (
        <div className="animate-fade-in">
            <div className="mb-8 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-light flex items-center justify-center">
                    <Shield size={20} className="text-orange" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-navy">Admin Panel</h1>
                    <p className="text-sm text-warm-gray">System overview and metrics.</p>
                </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 mb-8">
                {stats.map((s, i) => (
                    <div key={i} className="card p-5 flex items-center gap-4">
                        <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center`}>
                            <s.icon size={20} className={s.color} />
                        </div>
                        <div>
                            <p className="text-xs text-warm-gray font-medium">{s.label}</p>
                            <p className="text-2xl font-bold text-navy">{s.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-warm-gray-light mb-3">All URLs</h2>
                {urls.length === 0 ? (
                    <div className="card p-10 text-center"><p className="text-warm-gray text-sm">No URLs in the system yet.</p></div>
                ) : (
                    <div className="space-y-2">
                        {urls.map((u) => (
                            <div key={u._id} className="card px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-2">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-navy truncate">/url/{u.shortId}</p>
                                    <p className="text-xs text-warm-gray truncate">{u.redirectURL}</p>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-warm-gray shrink-0">
                                    <span className="bg-gray-50 px-2 py-1 rounded-lg">{u.visitHistory?.length || 0} clicks</span>
                                    {u.createdAt && <span>{new Date(u.createdAt).toLocaleDateString()}</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
