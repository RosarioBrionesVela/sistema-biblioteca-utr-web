import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function ProtectedRoute({ children, rol }) {
  const { usuario } = useContext(AuthContext);

  // Si no ha iniciado sesión, lo manda al login
  if (!usuario) {
    return <Navigate to="/login" />;
  }

  // Si necesita un rol ADMIN y no lo tiene
  if (rol && usuario.role !== rol) {
    return <Navigate to="/catalogo" />;
  }

  return children;
}

export default ProtectedRoute;