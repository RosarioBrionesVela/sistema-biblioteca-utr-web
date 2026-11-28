import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { solicitarPrestamo } from "../services/loanService";
import { AuthContext } from "../context/AuthContext";
import "./ModalSolicitudPrestamo.css";

function getOpenLibraryCover(isbn) {
  const isbnLimpio = (isbn || "").replace(/[^0-9Xx]/g, "");
  if (!isbnLimpio) return null;
  return `https://covers.openlibrary.org/b/isbn/${isbnLimpio}-M.jpg?default=false`;
}

function ModalSolicitudPrestamo({ libro, onClose, onSuccess }) {
  const [fechaDevolucion, setFechaDevolucion] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [imgError, setImgError] = useState(false);

  const auth = useContext(AuthContext) || {};
  const usuario = auth.usuario || auth.user || null;
  const navigate = useNavigate();

  // Fecha mínima: hoy (YYYY-MM-DD)
  const hoy = new Date().toISOString().split("T")[0];

  const portadaUrl = libro
    ? libro.portadaUrl ||
      libro.imagenUrl ||
      libro.portada ||
      libro.imagen ||
      getOpenLibraryCover(libro.isbn)
    : null;

  // Reinicia el estado de error de imagen si cambia el libro seleccionado
  useEffect(() => {
    setImgError(false);
  }, [portadaUrl]);

  // Cerrar con tecla Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !cargando) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cargando, onClose]);

  if (!libro) return null;

  const disponible = Number(libro.stockDisponible) > 0;

  const handleChange = (e) => {
    setFechaDevolucion(e.target.value);
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setExito("");

    if (!fechaDevolucion) {
      setError("Selecciona una fecha de devolución estimada.");
      return;
    }

    if (fechaDevolucion < hoy) {
      setError("La fecha de devolución no puede ser anterior a hoy.");
      return;
    }

    try {
      setCargando(true);

      const payload = {
        bookId: libro.id,
        fechaDevolucionEstimada: fechaDevolucion,
      };

      // Si AuthContext tiene el id del usuario, lo incluimos según el contrato del PDF
      if (usuario?.id) {
        payload.userId = usuario.id;
      }

      await solicitarPrestamo(payload);

      setExito("¡Préstamo solicitado correctamente!");

      if (typeof onSuccess === "function") {
        onSuccess(libro.id);
      }

      setTimeout(() => {
        onClose();
        navigate("/mis-prestamos");
      }, 900);
    } catch (err) {
      setError(err.message || "No se pudo completar la solicitud de préstamo.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div
      className="loan-modal-backdrop"
      onClick={() => !cargando && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="loan-modal-title"
    >
      <div
        className="loan-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del modal */}
        <header className="loan-modal-header">
          <div className="loan-modal-heading">
            <span className="loan-modal-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                <path d="M2 5.5A2.5 2.5 0 0 1 4.5 3H12v17H4.5A2.5 2.5 0 0 0 2 22V5.5z" />
                <path d="M22 5.5A2.5 2.5 0 0 0 19.5 3H12v17h7.5a2.5 2.5 0 0 1 2.5 2V5.5z" />
                <line x1="6" y1="8" x2="9" y2="8" />
                <line x1="6" y1="12" x2="9" y2="12" />
                <line x1="15" y1="8" x2="18" y2="8" />
                <line x1="15" y1="12" x2="18" y2="12" />
              </svg>
            </span>
            <h2 id="loan-modal-title" className="loan-modal-title">
              Solicitar Préstamo
            </h2>
          </div>

          <button
            type="button"
            className="loan-modal-close"
            onClick={onClose}
            disabled={cargando}
            aria-label="Cerrar modal"
          >
            ×
          </button>
        </header>

        {/* Información del libro seleccionado */}
        <div className="loan-book-preview">
          <div className="loan-book-cover-wrap">
            {portadaUrl && !imgError ? (
              <img
                src={portadaUrl}
                alt={`Portada de ${libro.titulo}`}
                className="loan-book-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="loan-book-cover-fallback">
                <span className="loan-cover-cat">{libro.categoria}</span>
                <strong className="loan-cover-title">{libro.titulo}</strong>
                <span className="loan-cover-author">{libro.autor}</span>
              </div>
            )}
          </div>

          <div className="loan-book-details">
            <h3 className="loan-book-title">{libro.titulo}</h3>
            <p className="loan-book-author">{libro.autor}</p>

            <span
              className={`loan-stock-badge ${
                disponible ? "loan-stock-ok" : "loan-stock-out"
              }`}
            >
              <span className="loan-stock-dot" />
              {disponible ? "Disponible" : "Sin existencias"}
            </span>

            <div className="loan-book-meta">
              <p>
                <span>ISBN:</span> {libro.isbn}
              </p>
              <p>
                <span>Categoría:</span> {libro.categoria}
              </p>
              <p>
                <span>Stock:</span> {libro.stockDisponible}
              </p>
            </div>
          </div>
        </div>

        {/* Formulario de solicitud */}
        <form onSubmit={handleSubmit} className="loan-modal-form" noValidate>
          <label htmlFor="fechaDevolucion" className="loan-date-label">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
              <rect x="3" y="4" width="18" height="17" rx="2.5" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>Fecha de devolución estimada</span>
          </label>

          <input
            id="fechaDevolucion"
            name="fechaDevolucion"
            type="date"
            min={hoy}
            value={fechaDevolucion}
            onChange={handleChange}
            disabled={cargando}
            className="loan-date-input"
          />

          {error && (
            <p className="loan-modal-feedback loan-modal-error" role="alert">
              {error}
            </p>
          )}
          {exito && (
            <p className="loan-modal-feedback loan-modal-success" role="status">
              {exito}
            </p>
          )}

          <button
            type="submit"
            disabled={cargando || !disponible}
            className="loan-confirm-btn"
          >
            {cargando ? "Enviando..." : "Confirmar Préstamo"}
          </button>

          <button
            type="button"
            onClick={onClose}
            disabled={cargando}
            className="loan-cancel-btn"
          >
            Cancelar
          </button>
        </form>
      </div>
    </div>
  );
}

export default ModalSolicitudPrestamo;