import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Route guard — redirects unauthenticated / non-admin users to 404.
 * Renders nothing while auth state is loading to prevent flash.
 */
const RequireAdmin = ({ children }: { children: React.ReactNode }) => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a0a" }}>
        <div className="w-6 h-6 border-2 border-[#00FF94]/30 border-t-[#00FF94] rounded-full animate-spin" />
      </div>
    );
  }

  // Not logged in → show login page (Admin component handles this)
  if (!user) return <>{children}</>;

  // Logged in but not admin → redirect to 404 (don't reveal admin exists)
  if (!isAdmin) return <Navigate to="/" replace />;

  return <>{children}</>;
};

export default RequireAdmin;
