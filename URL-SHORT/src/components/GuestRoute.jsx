import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * GuestRoute – only renders children when the user is NOT logged in.
 * If authenticated, redirects to /dashboard.
 * Shows a spinner while auth state is being determined.
 */
export default function GuestRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-orange border-t-transparent rounded-full animate-spin" />
                    <p className="text-warm-gray text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}
