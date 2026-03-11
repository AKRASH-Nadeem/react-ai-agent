// components/ProtectedRoute.tsx
// Wraps any route that requires authentication.
// Supports optional role-based access control via the requiredRole prop.
//
// Usage in router:
//
//   <Routes>
//     <Route path="/login" element={<LoginPage />} />
//
//     {/* Any authenticated user */}
//     <Route element={<ProtectedRoute />}>
//       <Route path="/dashboard" element={<DashboardPage />} />
//       <Route path="/settings"  element={<SettingsPage />} />
//     </Route>
//
//     {/* Admin only */}
//     <Route element={<ProtectedRoute requiredRole="admin" />}>
//       <Route path="/admin" element={<AdminPage />} />
//     </Route>
//   </Routes>

import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store";
import { FullPageSpinner } from "@/components/FullPageSpinner";

type Role = "admin" | "member" | "viewer";

type ProtectedRouteProps = {
  /** If provided, the user must have exactly this role — otherwise redirected to /403 */
  requiredRole?: Role;
};

export function ProtectedRoute({ requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const location = useLocation();

  // isLoading is true while the app is checking the session on mount.
  // Render nothing — a spinner — to avoid a flash-of-redirect.
  if (isLoading) {
    return <FullPageSpinner />;
  }

  // Not authenticated — redirect to login and remember where they were going.
  // After login, the user will be redirected back here via location.state.from.
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Role check — show a 403 page rather than redirecting to login.
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
}
