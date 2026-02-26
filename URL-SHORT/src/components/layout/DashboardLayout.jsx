import { useState, useRef, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
    Home,
    Link2,
    QrCode,
    FileText,
    BarChart3,
    Settings,
    Shield,
    Globe,
    ChevronLeft,
    ChevronRight,
    Plus,
    LogOut,
    Menu,
    X,
    Crown,
    HelpCircle,
    ChevronDown,
} from "lucide-react";

export default function DashboardLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const navItems = [
        { to: "/dashboard", icon: Home, label: "Home", end: true },
        { to: "/dashboard/links", icon: Link2, label: "Links" },
        { to: "/dashboard/qr", icon: QrCode, label: "QR Codes", badge: "Try it" },
        { to: "/dashboard/pages", icon: FileText, label: "Pages", badge: "Try it" },
        { to: "/dashboard/analytics", icon: BarChart3, label: "Analytics", badge: "Try it" },
        { to: "/dashboard/domains", icon: Globe, label: "Custom domains" },
    ];

    if (user?.role === "ADMIN") {
        navItems.push({ to: "/dashboard/admin", icon: Shield, label: "Admin" });
    }

    // Always show settings at end
    navItems.push({ to: "/dashboard/settings", icon: Settings, label: "Settings" });

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const SidebarContent = ({ mobile = false }) => (
        <div className="flex flex-col h-full">
            {/* Brand + Collapse toggle */}
            <div className="px-4 py-5 flex items-center justify-between">
                {!collapsed ? (
                    <>
                        <span className="text-3xl font-extrabold tracking-tight"><span className="text-navy">Cli</span><span className="text-orange">q</span></span>
                        {!mobile && (
                            <button
                                onClick={() => setCollapsed(true)}
                                className="w-8 h-8 rounded-lg border border-gray-300 text-gray-500 flex items-center justify-center hover:bg-gray-100 hover:text-gray-700 hover:border-gray-400 transition-all"
                                title="Collapse sidebar"
                            >
                                <ChevronLeft size={16} strokeWidth={2} />
                            </button>
                        )}
                    </>
                ) : (
                    <button
                        onClick={() => setCollapsed(false)}
                        className="w-10 h-10 rounded-lg border border-gray-300 text-gray-500 flex items-center justify-center hover:bg-gray-100 hover:text-gray-700 hover:border-gray-400 transition-all mx-auto"
                        title="Expand sidebar"
                    >
                        <ChevronRight size={16} strokeWidth={2} />
                    </button>
                )}
                {mobile && (
                    <button onClick={() => setMobileOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 border border-gray-200 hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-all">
                        <X size={16} className="text-navy" />
                    </button>
                )}
            </div>

            {/* Create New */}
            <div className="px-3 mb-3">
                <button
                    onClick={() => { navigate("/dashboard/shorten"); setMobileOpen(false); }}
                    className={`btn-primary w-full text-sm ${collapsed ? "!px-0 justify-center" : ""}`}
                    title={collapsed ? "Create new" : ""}
                >
                    <Plus size={collapsed ? 20 : 16} />
                    {!collapsed && "Create new"}
                </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-2 py-1 space-y-0.5 overflow-y-auto">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        onClick={() => setMobileOpen(false)}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                ? "bg-blue-50 text-blue-700 border-l-3 border-blue-700"
                                : "text-warm-gray hover:bg-gray-50 hover:text-navy"
                            } ${collapsed ? "justify-center" : ""}`
                        }
                    >
                        <item.icon size={18} className="shrink-0" />
                        {!collapsed && (
                            <span className="flex-1">{item.label}</span>
                        )}
                        {!collapsed && item.badge && (
                            <span className="text-[9px] font-medium text-warm-gray-light">{item.badge}</span>
                        )}
                    </NavLink>
                ))}
            </nav>
        </div>
    );

    const planLabel = {
        FREE: "Free account",
        CORE: "Core plan",
        GROWTH: "Growth plan",
        PREMIUM: "Premium plan",
    };

    return (
        <div className="flex h-screen bg-cream overflow-hidden">
            {/* Desktop Sidebar */}
            <aside className={`hidden lg:flex flex-col bg-white border-r border-border transition-all duration-300 ${collapsed ? "w-16" : "w-56"} flex-shrink-0 relative z-40 h-full overflow-y-auto`}>
                <SidebarContent />
            </aside>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
                    <aside className="relative w-64 h-full bg-white shadow-xl animate-slide-in">
                        <SidebarContent mobile />
                    </aside>
                </div>
            )}

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
                {/* Top bar */}
                <header className="bg-white border-b border-border h-14 flex items-center px-4 gap-3 z-30 flex-shrink-0">
                    <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 -ml-2 hover:bg-gray-50 rounded-lg transition">
                        <Menu size={18} className="text-warm-gray" />
                    </button>

                    <div className="flex-1" />

                    {/* Upgrade button — always visible */}
                    <button
                        onClick={() => navigate("/dashboard/pricing")}
                        className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange text-white text-xs font-semibold hover:bg-orange-hover transition-all duration-200 hover:shadow-md"
                    >
                        <Crown size={12} /> Upgrade
                    </button>

                    {/* Help icon */}
                    <button className="p-2 rounded-lg hover:bg-gray-50 transition text-warm-gray-light">
                        <HelpCircle size={18} />
                    </button>

                    {/* Avatar dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-gray-50 transition-all duration-200"
                        >
                            <div className="w-8 h-8 rounded-full bg-navy text-white flex items-center justify-center text-sm font-bold uppercase">
                                {user?.name?.charAt(0) || "U"}
                            </div>
                            <span className="hidden sm:block text-sm font-medium text-navy max-w-[120px] truncate">
                                {user?.name}
                            </span>
                            <ChevronDown size={14} className={`text-warm-gray-light transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
                        </button>

                        {/* Dropdown menu */}
                        {dropdownOpen && (
                            <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-border rounded-xl shadow-xl py-2 dropdown-enter z-50">
                                {/* User info */}
                                <div className="px-4 py-3 border-b border-border">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-navy text-white flex items-center justify-center text-lg font-bold uppercase">
                                            {user?.name?.charAt(0) || "U"}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-bold text-navy truncate">{user?.name}</p>
                                            <p className="text-xs text-warm-gray truncate">{user?.email}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Plan */}
                                <div className="px-4 py-2 border-b border-border">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] text-warm-gray uppercase tracking-wider font-medium">Cliq account</p>
                                            <p className="text-xs font-semibold text-navy">{planLabel[user?.plan || "FREE"]}</p>
                                        </div>
                                        {(!user?.plan || user.plan === "FREE") ? (
                                            <button
                                                onClick={() => { navigate("/dashboard/pricing"); setDropdownOpen(false); }}
                                                className="text-[10px] font-bold uppercase tracking-wider bg-orange text-white px-2 py-0.5 rounded-full hover:bg-orange-hover transition"
                                            >
                                                Upgrade
                                            </button>
                                        ) : (
                                            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                                                Active ✓
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Links */}
                                <div className="py-1">
                                    <button onClick={() => { navigate("/dashboard/settings"); setDropdownOpen(false); }}
                                        className="w-full text-left px-4 py-2 text-sm text-warm-gray hover:bg-gray-50 hover:text-navy transition">
                                        Settings
                                    </button>
                                </div>

                                <div className="border-t border-border pt-1">
                                    <button
                                        onClick={() => { handleLogout(); setDropdownOpen(false); }}
                                        className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition"
                                    >
                                        Sign out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </header>

                <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
