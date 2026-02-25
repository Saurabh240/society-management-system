
/*import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  useEffect(() => {
    if (role === "PLATFORM_ADMIN") {
      navigate("tenants", { replace: true });
    } else if (role === "TENANT_ADMIN") {
      navigate("units", { replace: true });
    }
  }, [role, navigate]);

  return null;
}*/


import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

 
  useEffect(() => {
  if (role === "PLATFORM_ADMIN") {
    console.log("Redirecting to tenants...");
    navigate("/dashboard/tenants", { replace: true }); 
  } else if (role === "TENANT_ADMIN") {
    console.log("Redirecting to units...");
    navigate("/dashboard/units", { replace: true }); 
  }
}, [role, navigate]);

  return null;
}
