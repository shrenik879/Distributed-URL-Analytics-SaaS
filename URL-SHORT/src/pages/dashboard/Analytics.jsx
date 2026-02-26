import { useState } from "react";
import { getAnalytics } from "../../api/analytics.api";
import { useToast } from "../../components/ui/Toast";
import { BarChart3, MousePointerClick, Calendar, Clock, Link2, Search, Loader2, Download, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Analytics() {
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const { addToast } = useToast();

    const handleFetch = async () => {
        if (!input.trim()) return addToast("Enter a short URL or ID", "error");
        setLoading(true);
        try {
            const shortId = input.trim().split("/").pop();
            const res = await getAnalytics(shortId);
            setData(res.data);
        } catch { addToast("Analytics not found", "error"); }
        finally { setLoading(false); }
    };

    const chartData = data?.clicksPerDay
        ? Object.entries(data.clicksPerDay).map(([date, count]) => ({
            date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            clicks: count,
        }))
        : [];

    const exportCSV = () => {
        if (!chartData.length) return;
        const csv = "Date,Clicks\n" + chartData.map((d) => `${d.date},${d.clicks}`).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = `analytics-${data?.shortId}.csv`; a.click();
        window.URL.revokeObjectURL(url);
        addToast("CSV exported!");
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload?.length) {
            return (
                <div className="bg-white border border-border rounded-lg px-3 py-2 shadow-lg">
                    <p className="text-xs text-warm-gray">{label}</p>
                    <p className="text-sm font-bold text-orange">{payload[0].value} clicks</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="max-w-3xl mx-auto animate-fade-in">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-navy mb-1">Analytics</h1>
                    <p className="text-sm text-warm-gray">Track your link performance.</p>
                </div>
                {data && (
                    <Link to="/dashboard/links" className="flex items-center gap-2 text-sm text-warm-gray hover:text-navy transition">
                        <ArrowLeft size={14} /> Back to links
                    </Link>
                )}
            </div>

            <div className="card p-5 mb-6">
                <label className="block text-sm font-semibold text-navy mb-3">Enter short URL or ID</label>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-warm-gray-light pointer-events-none" />
                        <input value={input} onChange={(e) => setInput(e.target.value)} className="input-field w-full" style={{ paddingLeft: '2.5rem' }} placeholder="Paste short URL or enter shortId" onKeyDown={(e) => e.key === "Enter" && handleFetch()} />
                    </div>
                    <button onClick={handleFetch} disabled={loading} className="btn-primary shrink-0">
                        {loading ? <Loader2 size={14} className="animate-spin" /> : <BarChart3 size={14} />}
                        {loading ? "Loading..." : "View"}
                    </button>
                </div>
            </div>

            {data && (
                <div className="space-y-4 animate-slide-in">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                            { label: "Total Clicks", value: data.totalClicks, icon: MousePointerClick, color: "text-orange", bg: "bg-orange-light" },
                            { label: "Short ID", value: data.shortId, icon: Link2, color: "text-blue-600", bg: "bg-blue-50" },
                            { label: "First Click", value: data.firstClicked ? new Date(data.firstClicked).toLocaleDateString() : "—", icon: Calendar, color: "text-emerald-600", bg: "bg-emerald-50" },
                            { label: "Last Click", value: data.lastClicked ? new Date(data.lastClicked).toLocaleDateString() : "—", icon: Clock, color: "text-purple-600", bg: "bg-purple-50" },
                        ].map((s, i) => (
                            <div key={i} className="card p-4">
                                <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center mb-2`}>
                                    <s.icon size={16} className={s.color} />
                                </div>
                                <p className="text-[11px] text-warm-gray font-medium">{s.label}</p>
                                <p className="text-sm font-bold text-navy mt-0.5 truncate">{s.value}</p>
                            </div>
                        ))}
                    </div>

                    <div className="card p-4">
                        <p className="text-xs text-warm-gray mb-1">Redirect URL</p>
                        <p className="text-sm font-medium text-navy break-all">{data.redirectURL}</p>
                    </div>

                    {chartData.length > 0 && (
                        <div className="card p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold text-navy">Clicks Over Time</h3>
                                <button onClick={exportCSV} className="btn-secondary text-xs px-3 py-1.5">
                                    <Download size={12} /> Export CSV
                                </button>
                            </div>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#EE6123" stopOpacity={0.15} />
                                                <stop offset="95%" stopColor="#EE6123" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={{ stroke: "#E5E7EB" }} tickLine={false} />
                                        <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={{ stroke: "#E5E7EB" }} tickLine={false} allowDecimals={false} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area type="monotone" dataKey="clicks" stroke="#EE6123" strokeWidth={2} fillOpacity={1} fill="url(#colorClicks)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {chartData.length > 0 && (
                        <div className="card p-5">
                            <h3 className="text-sm font-bold text-navy mb-3">Daily Breakdown</h3>
                            <div className="space-y-1.5 max-h-64 overflow-y-auto">
                                {Object.entries(data.clicksPerDay).map(([date, count]) => (
                                    <div key={date} className="flex items-center justify-between px-3 py-2 rounded-lg bg-cream hover:bg-cream-dark transition text-sm">
                                        <span className="text-warm-gray">{date}</span>
                                        <span className="font-bold text-orange">{count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
