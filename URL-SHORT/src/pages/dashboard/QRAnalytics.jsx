import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "../../components/ui/Toast";
import { useAuth } from "../../context/AuthContext";
import { getQRAnalytics } from "../../api/url.api";
import { QRCodeCanvas } from "qrcode.react";
import {
    ArrowLeft, ScanLine, CalendarDays, Globe, BarChart3, Download, Loader2,
} from "lucide-react";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

export default function QRAnalytics() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { addToast } = useToast();
    const plan = user?.plan || "FREE";

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (plan === "FREE") {
            setLoading(false);
            return;
        }
        getQRAnalytics(id)
            .then(res => setData(res.data))
            .catch(() => { addToast("Failed to load QR analytics", "error"); navigate("/dashboard/qr"); })
            .finally(() => setLoading(false));
    }, [id]);

    const chartData = data?.clicksPerDay
        ? Object.entries(data.clicksPerDay).map(([date, count]) => ({
            date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            scans: count,
        }))
        : [];

    const exportCSV = () => {
        if (!chartData.length) return;
        const csv = "Date,Scans\n" + chartData.map(d => `${d.date},${d.scans}`).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url;
        a.download = `qr-analytics-${data?.shortId || id}.csv`; a.click();
        window.URL.revokeObjectURL(url);
        addToast("CSV exported!");
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload?.length) {
            return (
                <div className="bg-white border border-border rounded-lg px-3 py-2 shadow-lg">
                    <p className="text-xs text-warm-gray">{label}</p>
                    <p className="text-sm font-bold text-orange">{payload[0].value} scans</p>
                </div>
            );
        }
        return null;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <Loader2 size={32} className="animate-spin text-orange" />
            </div>
        );
    }

    if (!data) return null;

    const dateStr = data.createdAt
        ? new Date(data.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
        : "";

    return (
        <div className="animate-fade-in max-w-4xl mx-auto">
            {/* Back */}
            <button onClick={() => navigate("/dashboard/qr")}
                className="flex items-center gap-1.5 text-xs text-warm-gray hover:text-navy transition mb-6">
                <ArrowLeft size={14} /> Back to QR Codes
            </button>

            {/* Header card */}
            <div className="card p-6 mb-6">
                <div className="flex items-start gap-5">
                    {/* QR thumbnail */}
                    <div className="shrink-0 bg-white border border-border rounded-xl p-3 shadow-sm">
                        {data.qrCode
                            ? <img src={data.qrCode} alt="QR" width={88} height={88} className="rounded-lg" />
                            : <QRCodeCanvas value={data.redirectURL || " "} size={88} fgColor={data.qrColor || "#0B1736"} bgColor="#ffffff" level="H" />
                        }
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl font-extrabold text-navy leading-tight mb-1">
                            {data.title || `QR — ${data.shortId}`}
                        </h1>
                        <div className="flex items-center gap-1 text-xs text-warm-gray mb-1">
                            <Globe size={10} />
                            <span className="truncate">{data.redirectURL}</span>
                        </div>
                        {dateStr && (
                            <div className="flex items-center gap-1 text-xs text-warm-gray">
                                <CalendarDays size={10} /> {dateStr}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                {[
                    { label: "Total Scans", value: data.totalScans ?? 0, icon: ScanLine, color: "text-orange", bg: "bg-orange-light" },
                    { label: "Short ID", value: data.shortId, icon: BarChart3, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Unique Days", value: Object.keys(data.clicksPerDay || {}).length, icon: CalendarDays, color: "text-emerald-600", bg: "bg-emerald-50" },
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

            {/* Chart */}
            {chartData.length > 0 ? (
                <>
                    <div className="card p-5 mb-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-bold text-navy">Scans over time</h2>
                            <button onClick={exportCSV} className="btn-secondary text-xs px-3 py-1.5">
                                <Download size={12} /> Export CSV
                            </button>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="scanGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#EE6123" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#EE6123" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={{ stroke: "#E5E7EB" }} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={{ stroke: "#E5E7EB" }} tickLine={false} allowDecimals={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey="scans" stroke="#EE6123" strokeWidth={2} fillOpacity={1} fill="url(#scanGrad)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Daily breakdown */}
                    <div className="card p-5">
                        <h2 className="text-sm font-bold text-navy mb-3">Daily Breakdown</h2>
                        <div className="space-y-1.5 max-h-64 overflow-y-auto">
                            {Object.entries(data.clicksPerDay).map(([date, count]) => (
                                <div key={date} className="flex items-center justify-between px-3 py-2 rounded-lg bg-cream hover:bg-cream-dark transition text-sm">
                                    <span className="text-warm-gray">{date}</span>
                                    <span className="font-bold text-orange">{count} scans</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            ) : (
                <div className="card p-10 text-center">
                    <ScanLine size={36} className="mx-auto mb-3 text-gray-200" />
                    <p className="text-sm font-semibold text-navy mb-1">No scans yet</p>
                    <p className="text-xs text-warm-gray">Scan data will appear here once people start scanning your QR code.</p>
                </div>
            )}
        </div>
    );
}
