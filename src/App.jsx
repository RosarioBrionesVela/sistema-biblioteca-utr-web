import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Registro from "./pages/Registro";
import Catalogo from "./pages/Catalogo";
import SolicitudPrestamo from "./pages/SolicitudPrestamo";
import MisPrestamos from "./pages/MisPrestamos";
import Admin from "./pages/Admin";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />

          {/* Pantallas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />

          {/* Pantallas para usuarios con sesión */}
          <Route
            path="/catalogo"
            element={
              <ProtectedRoute>
                <Catalogo />
              </ProtectedRoute>
            }
          />

          <Route
            path="/solicitar/:id"
            element={
              <ProtectedRoute>
                <SolicitudPrestamo />
              </ProtectedRoute>
            }
          />

          <Route
            path="/mis-prestamos"
            element={
              <ProtectedRoute>
                <MisPrestamos />
              </ProtectedRoute>
            }
          />

          {/* Pantalla exclusiva del administrador */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute rol="ADMIN">
                <Admin />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;