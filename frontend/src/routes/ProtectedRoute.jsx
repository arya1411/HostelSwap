import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loading } from "../components/ui/Loading.jsx";
import { ErrorBox } from "../components/ui/ErrorBox.jsx";
import { Session } from "../context/SessionContext.js";

export function ProtectedRoute({ children, admin }) {
  const { user, ready } = useContext(Session),
    location = useLocation();
  if (!ready) return <Loading />;
  if (!user)
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (admin && user.role !== "admin")
    return (
      <div className="container page">
        <ErrorBox message="Administrator access required." />
      </div>
    );
  return children;
}
