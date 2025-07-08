import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";

const ProtectedRoute = () => {
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    if (!token || token === "undefined" || token === "null") {
      sessionStorage.removeItem("token");
      navigate("/login", { replace: true });
    }
  }, [navigate, token]);

  return token ? <Outlet /> : null;
};

export default ProtectedRoute;
