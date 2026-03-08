import { Navigate } from "react-router-dom";
import { getToken } from "../../shared/utils/storage";

export default function ProtectedRoute({ children }) {
  const token = getToken();

  if (!token) {
    return <Navigate to="/login" />;
  }

  return children;
}
