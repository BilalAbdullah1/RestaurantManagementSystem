import { Navigate, Outlet } from "react-router";
import { getToken, getUserRoleName } from "./authUtils";

interface RoleProtectedRouteProps {
  allowedRoles: string[];
}

const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ allowedRoles }) => {
  const token = getToken();
  
  if (!token) {
    return <Navigate to="/signin" replace />;
  }

  const roleName = getUserRoleName() || localStorage.getItem("roleName");

  if (!roleName || !allowedRoles.includes(roleName)) {
    // If user's role is not in the allowed roles, redirect to unauthorized/404
    return <Navigate to="/error-404" replace />;
  }
  
  return <Outlet />;
};

export default RoleProtectedRoute;
