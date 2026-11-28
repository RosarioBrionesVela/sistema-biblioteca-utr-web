import { useState, useEffect, useContext, useMemo, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { obtenerLibros } from "../services/bookService";
import { AuthContext } from "../context/AuthContext";
import CarruselLibros from "../components/CarruselLibros";
import utrLogo from "../assets/utr-logo.png";
import fondoCatalogo from "../assets/fondo-catalogo.png";
import ModalSolicitudPrestamo from "../components/ModalSolicitudPrestamo";
import "./Catalogo.css";

const CATEGORIAS_PRINCIPALES = [
  "Todas",
  "Tecnología",
  "Ingeniería",
  "Ciencias",
  "Matemáticas",
  "Literatura",
  "Historia",
  "Administración",
  "Idiomas",
  "Arte",
  "Salud",
];

// Alias para que coincidan singulares, plurales y subtemas relacionados
const ALIAS_CATEGORIAS = {
  tecnologia: ["tecnologia", "informatica", "sistemas", "computacion", "programacion"],
  ingenieria: ["ingenieria", "ingenierias", "mecatronica", "industrial", "electronica"],
  ciencias: ["ciencias", "ciencia", "fisica", "quimica", "biologia"],
  matematicas: ["matematicas", "matematica", "calculo", "algebra", "estadistica"],
  literatura: ["literatura", "novela", "ficcion", "cuentos", "poesia"],
  historia: ["historia", "geografia", "cultura", "filosofia"],
  administracion: ["administracion", "negocios", "economia", "contabilidad", "finanzas", "derecho"],
  idiomas: ["idiomas", "idioma", "ingles", "frances", "lenguas"],
  arte: ["arte", "artes", "diseno", "musica", "fotografia"],
  salud: ["salud", "medicina", "enfermeria", "nutricion", "psicologia"],
};

// Normaliza texto para que acentos o mayúsculas no afecten las búsquedas
const normalizarTexto = (texto = "") =>
  texto
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

const coincideConCategoria = (categoriaLibro, categoriaSeleccionada) => {
  const catLibro = normalizarTexto(categoriaLibro);
  const catSel = normalizarTexto(categoriaSeleccionada);

  if (catSel === "todas") return true;

  const aliases = ALIAS_CATEGORIAS[catSel] || [catSel];
  return aliases.includes(catLibro);
};

function Catalogo() {
  const [libros, setLibros] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("Todas");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [soloDisponibles, setSoloDisponibles] = useState(false);
  const [orden, setOrden] = useState("relevancia");

  const auth = useContext(AuthContext) || {};
  const usuario = auth.usuario || auth.user || null;
  const navigate = useNavigate();
  const [libroSeleccionado, setLibroSeleccionado] = useState(null);
  const filtrosRef = useRef(null);

  useEffect(() => {
    cargarLibros();
  }, []);

  // Cierra el popover de filtros al hacer clic fuera o presionar Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filtrosRef.current && !filtrosRef.current.contains(e.target)) {
        setMostrarFiltros(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setMostrarFiltros(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const cargarLibros = async () => {
    try {
      setCargando(true);
      setError("");
      const respuesta = await obtenerLibros();
      setLibros(Array.isArray(respuesta) ? respuesta : respuesta?.books || []);
    } catch (err) {
      setError(err.message || "Error al cargar el catálogo de libros.");
    } finally {
      setCargando(false);
    }
  };

  const handleSelect = (libro) => {
    if (Number(libro.stockDisponible) <= 0) return;
    setLibroSeleccionado(libro);
  };

  const limpiarFiltros = () => {
    setBusqueda("");
    setCategoria("Todas");
    setSoloDisponibles(false);
    setOrden("relevancia");
    setMostrarFiltros(false);
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

  const librosFiltrados = useMemo(() => {
    const q = normalizarTexto(busqueda);

    const filtrados = libros.filter((libro) => {
      const tituloNorm = normalizarTexto(libro.titulo);
      const autorNorm = normalizarTexto(libro.autor);
      const isbnNorm = normalizarTexto(libro.isbn);

      const coincideBusqueda =
        !q ||
        tituloNorm.includes(q) ||
        autorNorm.includes(q) ||
        isbnNorm.includes(q);

      const coincideCategoria = coincideConCategoria(libro.categoria, categoria);

      const coincideStock =
        !soloDisponibles || Number(libro.stockDisponible) > 0;

      return coincideBusqueda && coincideCategoria && coincideStock;
    });

    if (orden === "titulo") {
      return [...filtrados].sort((a, b) => a.titulo.localeCompare(b.titulo));
    }
    if (orden === "stock") {
      return [...filtrados].sort(
        (a, b) => Number(b.stockDisponible) - Number(a.stockDisponible)
      );
    }
    return filtrados;
  }, [libros, busqueda, categoria, soloDisponibles, orden]);

  const totalDisponibles = useMemo(
    () => libros.filter((l) => Number(l.stockDisponible) > 0).length,
    [libros]
  );

  // Secciones para el scroll vertical cuando no hay búsqueda/filtro específico
  const secciones = useMemo(() => {
    if (libros.length === 0) return [];

    const disponibles = libros.filter((l) => Number(l.stockDisponible) > 0);
    const baseTendencia = disponibles.length > 0 ? disponibles : libros;
    const tendencia = [...baseTendencia].sort(
      (a, b) => Number(a.stockDisponible) - Number(b.stockDisponible)
    );
    const nuevos = [...libros].reverse();

    return [
      {
        id: "recomendados",
        titulo: "Recomendados para ti",
        subtitulo: "Selección destacada disponible para préstamo inmediato",
        items: disponibles.length > 0 ? disponibles : libros,
      },
      {
        id: "tendencia",
        titulo: "En tendencia",
        subtitulo: "Los títulos más solicitados por la comunidad UTR",
        items: tendencia,
      },
      {
        id: "nuevos",
        titulo: "Recién agregados",
        subtitulo: "Últimas incorporaciones a la biblioteca",
        items: nuevos,
      },
      {
        id: "todos",
        titulo: "Explora todo el catálogo",
        subtitulo: "Colección completa de libros registrados",
        items: libros,
      },
    ];
  }, [libros]);

  const hayFiltroActivo =
    busqueda.trim() !== "" ||
    categoria !== "Todas" ||
    soloDisponibles ||
    orden !== "relevancia";

  const nombreUsuario = usuario?.nombre || "Estudiante UTR";
  const rolUsuario = usuario?.rol === "ADMIN" ? "Administrador" : "Usuario";
  const iniciales = nombreUsuario
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  return (
    <div
      className="catalogo-layout"
      style={{ "--catalogo-bg": `url(${fondoCatalogo})` }}
    >
      <div className="catalogo-bg-decor" aria-hidden="true" />

      {/* Sidebar izquierdo */}
      <aside className="catalogo-sidebar">
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
            title="Cerrar sesión"
          >
            Salir
          </button>
        </div>
      </aside>

      {/* Contenido principal con scroll vertical */}
      <main className="catalogo-main">
        <header className="catalogo-header">
          <div>
            <h1 className="catalogo-title">Catálogo de Libros</h1>
            <p className="catalogo-subtitle">
              Encuentra el libro perfecto para ti
            </p>
          </div>

          {!cargando && !error && libros.length > 0 && (
            <span className="catalogo-header-badge">
              {totalDisponibles}{" "}
              {totalDisponibles === 1
                ? "título disponible"
                : "títulos disponibles"}
            </span>
          )}
        </header>

        {/* Buscador + Botón Filtros */}
        <div className="catalogo-search-row">
          <div className="catalogo-search-box">
            <span className="catalogo-search-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <line x1="16.65" y1="16.65" x2="21" y2="21" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Buscar por título, autor o ISBN..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="catalogo-search-input"
            />
            {busqueda && (
              <button
                type="button"
                className="catalogo-clear-search"
                onClick={() => setBusqueda("")}
                aria-label="Limpiar búsqueda"
              >
                ×
              </button>
            )}
          </div>

          <div className="catalogo-filter-dropdown-wrap" ref={filtrosRef}>
            <button
              type="button"
              className={`catalogo-filters-btn ${
                mostrarFiltros || soloDisponibles || orden !== "relevancia"
                  ? "catalogo-filters-btn-active"
                  : ""
              }`}
              onClick={() => setMostrarFiltros((prev) => !prev)}
            >
              <span>Filtros</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {mostrarFiltros && (
              <div className="catalogo-filters-popover">
                <label className="filter-check">
                  <input
                    type="checkbox"
                    checked={soloDisponibles}
                    onChange={(e) => setSoloDisponibles(e.target.checked)}
                  />
                  <span>Solo con stock disponible</span>
                </label>

                <div className="filter-sort">
                  <label htmlFor="orden-select">Ordenar por</label>
                  <select
                    id="orden-select"
                    value={orden}
                    onChange={(e) => setOrden(e.target.value)}
                  >
                    <option value="relevancia">Por defecto</option>
                    <option value="titulo">Título (A - Z)</option>
                    <option value="stock">Mayor disponibilidad</option>
                  </select>
                </div>

                <button
                  type="button"
                  className="filter-reset-btn"
                  onClick={limpiarFiltros}
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Pills de categorías */}
        <div className="catalogo-categories" role="tablist" aria-label="Categorías">
          {CATEGORIAS_PRINCIPALES.map((cat) => (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={categoria === cat}
              onClick={() => setCategoria(cat)}
              className={`category-pill ${
                categoria === cat ? "category-pill-active" : ""
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Estados de carga y error */}
        {cargando && (
          <div className="catalogo-state-box">
            <div className="catalogo-spinner" aria-hidden="true" />
            <p>Cargando libros del catálogo...</p>
          </div>
        )}

        {error && !cargando && (
          <div className="catalogo-state-box catalogo-state-error" role="alert">
            <p>{error}</p>
            <button type="button" onClick={cargarLibros} className="retry-btn">
              Reintentar
            </button>
          </div>
        )}

        {!cargando && !error && libros.length === 0 && (
          <div className="catalogo-state-box">
            <p>No hay libros disponibles en este momento.</p>
          </div>
        )}

        {/* Carruseles: filtrados o por secciones con scroll vertical */}
        {!cargando && !error && libros.length > 0 && (
          <div className="catalogo-sections-list">
            {hayFiltroActivo ? (
              librosFiltrados.length > 0 ? (
                <CarruselLibros
                  titulo={
                    categoria !== "Todas"
                      ? `Resultados en ${categoria}`
                      : "Resultados de búsqueda"
                  }
                  subtitulo="Coincidencias encontradas según tu filtro actual"
                  libros={librosFiltrados}
                  onSelect={handleSelect}
                />
              ) : (
                <div className="catalogo-state-box">
                  <p>No se encontraron libros con los filtros aplicados.</p>
                  <button
                    type="button"
                    onClick={limpiarFiltros}
                    className="retry-btn"
                  >
                    Limpiar filtros
                  </button>
                </div>
              )
            ) : (
              secciones.map((sec) => (
                <CarruselLibros
                  key={sec.id}
                  titulo={sec.titulo}
                  subtitulo={sec.subtitulo}
                  libros={sec.items}
                  onSelect={handleSelect}
                />
              ))
            )}
          </div>
        )}
      </main>

      {libroSeleccionado && (
        <ModalSolicitudPrestamo
          libro={libroSeleccionado}
          onClose={() => setLibroSeleccionado(null)}
          onSuccess={() => cargarLibros()}
        />
      )}
    </div>
  );
}

export default Catalogo;