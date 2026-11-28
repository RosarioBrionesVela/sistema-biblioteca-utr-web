import { useState, useEffect, useContext, useMemo } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { obtenerPrestamos } from "../services/loanService";
import { AuthContext } from "../context/AuthContext";
import utrLogo from "../assets/utr-logo.png";
import fondoCatalogo from "../assets/fondo-prestamos.png";
import "./MisPrestamos.css";

// Convierte "2026-11-18" o ISO sin desfase de zona horaria a "18/11/2026"
const formatearFecha = (fechaStr) => {
  if (!fechaStr) return "—";
  const soloFecha = String(fechaStr).split("T")[0];
  const partes = soloFecha.split("-");
  if (partes.length === 3) {
    const [anio, mes, dia] = partes;
    return `${dia}/${mes}/${anio}`;
  }
  return fechaStr;
};

const normalizarTexto = (texto = "") =>
  texto
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

function getOpenLibraryCover(isbn) {
  const isbnLimpio = (isbn || "").replace(/[^0-9Xx]/g, "");
  if (!isbnLimpio) return null;
  return `https://covers.openlibrary.org/b/isbn/${isbnLimpio}-M.jpg?default=false`;
}

function PrestamoPortada({ titulo, portadaUrl }) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [portadaUrl]);

  if (portadaUrl && !imgError) {
    return (
      <img
        src={portadaUrl}
        alt={`Portada de ${titulo}`}
        className="prestamo-book-thumb"
        loading="lazy"
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div className="prestamo-book-thumb-fallback">
      <span>{titulo}</span>
    </div>
  );
}

function MisPrestamos() {
  const [prestamos, setPrestamos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [tabActiva, setTabActiva] = useState("activos");
  const [busqueda, setBusqueda] = useState("");

  const auth = useContext(AuthContext) || {};
  const usuario = auth.usuario || auth.user || null;
  const navigate = useNavigate();

  useEffect(() => {
    cargarPrestamos();
  }, []);

  const cargarPrestamos = async () => {
    try {
      setCargando(true);
      setError("");
      const respuesta = await obtenerPrestamos();
      setPrestamos(Array.isArray(respuesta) ? respuesta : respuesta?.loans || []);
    } catch (err) {
      setError(err.message || "Error al cargar tus préstamos.");
    } finally {
      setCargando(false);
    }
  };

  const handleLogout = () => {
    if (typeof auth.cerrarSesion === "function") {
      auth.cerrarSesion();
    } else if (typeof auth.logout === "function") {
      auth.logout();
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    navigate("/login");
  };

  const prestamosActivosCount = useMemo(
    () =>
      prestamos.filter(
        (p) => (p.estatus || "").toUpperCase() !== "DEVUELTO"
      ).length,
    [prestamos]
  );

  const prestamosFiltrados = useMemo(() => {
    const q = normalizarTexto(busqueda);

    return prestamos.filter((p) => {
      const estatus = (p.estatus || "").toUpperCase();
      const esDevuelto = estatus === "DEVUELTO";

      const coincideTab =
        tabActiva === "activos" ? !esDevuelto : esDevuelto;

      const coincideBusqueda =
        !q ||
        normalizarTexto(p.libro).includes(q) ||
        normalizarTexto(p.autor).includes(q) ||
        normalizarTexto(p.isbn).includes(q);

      return coincideTab && coincideBusqueda;
    });
  }, [prestamos, tabActiva, busqueda]);

  const nombreUsuario = usuario?.nombre || "Estudiante UTR";
  const rolUsuario =
    usuario?.rol === "ADMIN" ? "Administrador" : "Usuario";
  const iniciales = nombreUsuario
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  return (
    <div
      className="prestamos-layout"
      style={{ "--prestamos-bg": `url(${fondoCatalogo})` }}
    >
      <div className="prestamos-bg-decor" aria-hidden="true" />

      {/* Sidebar izquierdo */}
      <aside className="prestamos-sidebar">
        <div className="sidebar-top">
          <div className="sidebar-logo-wrap">
            <img
              src={utrLogo}
              alt="Escudo Universidad Tecnológica El Retoño"
              className="sidebar-logo"
            />
          </div>

          <nav className="sidebar-nav" aria-label="Navegación principal">
            <NavLink
              to="/catalogo"
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "sidebar-link-active" : ""}`
              }
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                <path d="M3 10.5L12 3l9 7.5" />
                <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" />
              </svg>
              <span>Inicio</span>
            </NavLink>

            <NavLink
              to="/mis-prestamos"
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "sidebar-link-active" : ""}`
              }
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                <rect x="5" y="4" width="14" height="17" rx="2" />
                <path d="M9 4V2.8A.8.8 0 0 1 9.8 2h4.4a.8.8 0 0 1 .8.8V4" />
                <line x1="9" y1="10" x2="15" y2="10" />
                <line x1="9" y1="14" x2="15" y2="14" />
              </svg>
              <span>Préstamos</span>
            </NavLink>

            {usuario?.rol === "ADMIN" && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? "sidebar-link-active" : ""}`
                }
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3h.1a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8v.1a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z" />
                </svg>
                <span>Panel Admin</span>
              </NavLink>
            )}
          </nav>
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar" aria-hidden="true">
              {iniciales || "U"}
            </div>
            <div className="sidebar-user-info">
              <strong className="sidebar-user-name">{nombreUsuario}</strong>
              <span className="sidebar-user-role">{rolUsuario}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="sidebar-logout-btn"
          >
            Salir
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="prestamos-main">
        <header className="prestamos-header">
          <div className="prestamos-title-row">
            <span className="prestamos-title-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                <path d="M2 5.5A2.5 2.5 0 0 1 4.5 3H12v17H4.5A2.5 2.5 0 0 0 2 22V5.5z" />
                <path d="M22 5.5A2.5 2.5 0 0 0 19.5 3H12v17h7.5a2.5 2.5 0 0 1 2.5 2V5.5z" />
                <line x1="6" y1="8" x2="9" y2="8" />
                <line x1="6" y1="12" x2="9" y2="12" />
                <line x1="15" y1="8" x2="18" y2="8" />
                <line x1="15" y1="12" x2="18" y2="12" />
              </svg>
            </span>
            <div>
              <h1 className="prestamos-title">Mis Préstamos</h1>
              <p className="prestamos-subtitle">
                Consulta tus préstamos y fechas de devolución.
              </p>
            </div>
          </div>
        </header>

        {/* Controles: Tabs Activos / Historial + Buscador */}
        <div className="prestamos-toolbar">
          <div className="prestamos-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={tabActiva === "activos"}
              onClick={() => setTabActiva("activos")}
              className={`prestamos-tab-btn ${
                tabActiva === "activos" ? "prestamos-tab-active" : ""
              }`}
            >
              <span>Activos</span>
              <span className="prestamos-tab-badge">{prestamosActivosCount}</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={tabActiva === "historial"}
              onClick={() => setTabActiva("historial")}
              className={`prestamos-tab-btn ${
                tabActiva === "historial" ? "prestamos-tab-active" : ""
              }`}
            >
              <span>Historial</span>
            </button>
          </div>

          <div className="prestamos-search-box">
            <span className="prestamos-search-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <line x1="16.65" y1="16.65" x2="21" y2="21" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Buscar..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="prestamos-search-input"
            />
            {busqueda && (
              <button
                type="button"
                className="prestamos-clear-search"
                onClick={() => setBusqueda("")}
                aria-label="Limpiar búsqueda"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Estados de carga y error */}
        {cargando && (
          <div className="prestamos-state-box">
            <div className="prestamos-spinner" aria-hidden="true" />
            <p>Cargando préstamos...</p>
          </div>
        )}

        {error && !cargando && (
          <div className="prestamos-state-box prestamos-state-error" role="alert">
            <p>{error}</p>
            <button
              type="button"
              onClick={cargarPrestamos}
              className="prestamos-action-btn"
            >
              Reintentar
            </button>
          </div>
        )}

        {!cargando && !error && prestamos.length === 0 && (
          <div className="prestamos-state-box">
            <p>No tienes préstamos registrados aún.</p>
            <button
              type="button"
              onClick={() => navigate("/catalogo")}
              className="prestamos-action-btn"
            >
              Explorar catálogo
            </button>
          </div>
        )}

        {!cargando &&
          !error &&
          prestamos.length > 0 &&
          prestamosFiltrados.length === 0 && (
            <div key={`empty-${tabActiva}`} className="prestamos-state-box">
              <p>
                {tabActiva === "activos"
                  ? "No tienes préstamos activos en este momento."
                  : "No hay préstamos devueltos en tu historial."}
              </p>
              {tabActiva === "activos" && !busqueda && (
                <button
                  type="button"
                  onClick={() => setTabActiva("historial")}
                  className="prestamos-action-btn"
                >
                  Ver historial
                </button>
              )}
            </div>
          )}

        {/* Listado de tarjetas de préstamos */}
        {!cargando && !error && prestamosFiltrados.length > 0 && (
          <div key={tabActiva} className="prestamos-list">
            {prestamosFiltrados.map((prestamo) => {
              const estatusUpper = (
                prestamo.estatus || "PRESTADO"
              ).toUpperCase();
              const esDevuelto = estatusUpper === "DEVUELTO";
              const portadaUrl =
                prestamo.portadaUrl ||
                prestamo.imagenUrl ||
                prestamo.portada ||
                prestamo.imagen ||
                getOpenLibraryCover(prestamo.isbn);

              return (
                <article
                  key={prestamo.loanId || prestamo.id}
                  className="prestamo-row-card"
                >
                  {/* Portada + Título/Autor */}
                  <div className="prestamo-book-col">
                    <PrestamoPortada
                      titulo={prestamo.libro}
                      portadaUrl={portadaUrl}
                    />

                    <div className="prestamo-book-text">
                      <h2 className="prestamo-book-title">{prestamo.libro}</h2>
                      <p className="prestamo-book-author">
                        {prestamo.autor || "Autor no especificado"}
                      </p>
                      {prestamo.isbn && (
                        <span className="prestamo-book-isbn">
                          ISBN: {prestamo.isbn}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Fecha del préstamo */}
                  <div className="prestamo-date-col">
                    <span className="prestamo-date-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                        <rect x="3" y="4" width="18" height="17" rx="2.5" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    </span>
                    <div>
                      <strong className="prestamo-date-value">
                        {formatearFecha(prestamo.fechaPrestamo)}
                      </strong>
                      <span className="prestamo-date-label">(Préstamo)</span>
                    </div>
                  </div>

                  {/* Fecha límite / devolución */}
                  <div className="prestamo-date-col">
                    <span className="prestamo-date-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                        <path d="M6 2h12" />
                        <path d="M6 22h12" />
                        <path d="M7 2v5.5a5 5 0 0 0 2.2 4.15L12 13.5l2.8-1.85A5 5 0 0 0 17 7.5V2" />
                        <path d="M7 22v-5.5a5 5 0 0 1 2.2-4.15L12 10.5l2.8 1.85A5 5 0 0 1 17 16.5V22" />
                      </svg>
                    </span>
                    <div>
                      <strong className="prestamo-date-value">
                        {formatearFecha(prestamo.fechaDevolucionEstimada)}
                      </strong>
                      <span className="prestamo-date-label">(Límite)</span>
                    </div>
                  </div>

                  {/* Estatus */}
                  <div className="prestamo-status-col">
                    {prestamo.vencido && !esDevuelto && (
                      <span className="prestamo-badge prestamo-badge-overdue">
                        VENCIDO
                      </span>
                    )}
                    <span
                      className={`prestamo-badge ${
                        esDevuelto
                          ? "prestamo-badge-returned"
                          : "prestamo-badge-active"
                      }`}
                    >
                      {estatusUpper}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default MisPrestamos;