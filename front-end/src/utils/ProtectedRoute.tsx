import { Navigate, Outlet } from "react-router";
import { getToken } from "./authUtils";

// ─── Protected Route ───────────────────────────────────────────────────────────
const ProtectedRoute = () => {
  const token = getToken();
  
  // 1. Agar token siry se hai hi nahi
  if (!token) {
    return <Navigate to="/signin" replace />;
  }
  
  // 2. Token hai, toh andar jaane do. Agar expire ho gaya hoga toh server 401 
  // return karega aur axios response interceptor automatically logout kar dega.
  return <Outlet />;
};

export default ProtectedRoute;