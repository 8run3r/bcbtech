import { useAuth } from "@/contexts/AuthContext";

/**
 * Route guard — shows a spinner while auth state loads, then defers to the
 * Admin component, which renders login / "no access" / the panel itself.
 * (A silent redirect for logged-in non-admins made a missing user_roles
 * row look like the admin was broken — never fail silently here.)
 */
const RequireAdmin = ({ children }: { children: React.ReactNode }) => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a0a" }}>
        <div className="w-6 h-6 border-2 border-[#00FF94]/30 border-t-[#00FF94] rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
};

export default RequireAdmin;
