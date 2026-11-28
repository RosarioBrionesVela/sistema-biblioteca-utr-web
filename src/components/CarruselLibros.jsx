import { useRef, useState, useEffect, useCallback } from "react";

function getOpenLibraryCover(isbn) {
  const isbnLimpio = (isbn || "").replace(/[^0-9Xx]/g, "");
  if (!isbnLimpio) return null;
  return `https://covers.openlibrary.org/b/isbn/${isbnLimpio}-M.jpg?default=false`;
}

function BookCard({ libro, onSelect }) {
  const coverUrl =
    libro.portadaUrl ||
    libro.imagenUrl ||
    libro.portada ||
    libro.imagen ||
    getOpenLibraryCover(libro.isbn);

  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [coverUrl]);

  const stock = Number(libro.stockDisponible) || 0;
  const disponible = stock > 0;

  return (
    <article className="book-card">
      <div>
        <div className="book-cover-wrap">
          {coverUrl && !imgError ? (
            <img
              src={coverUrl}
              alt={`Portada de ${libro.titulo}`}
              className="book-cover-img"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="book-cover-fallback">
              <span className="book-cover-cat">
                {libro.categoria || "Libro"}
              </span>
              <strong className="book-cover-title">{libro.titulo}</strong>
              <span className="book-cover-author">{libro.autor}</span>
            </div>
          )}
        </div>

        <div className="book-info">
          <h3 className="book-title" title={libro.titulo}>
            {libro.titulo}
          </h3>
          <p className="book-author" title={libro.autor}>
            {libro.autor || "Autor desconocido"}
          </p>

          <div className="book-meta">
            <span className="book-category-tag">
              {libro.categoria || "General"}
            </span>
            {libro.isbn && (
              <span className="book-isbn">ISBN: {libro.isbn}</span>
            )}
          </div>

          <div className="book-status">
            <span
              className={`status-dot ${
                disponible ? "status-dot-ok" : "status-dot-out"
              }`}
              aria-hidden="true"
            />
            <span
              className={`status-text ${
                disponible ? "status-text-ok" : "status-text-out"
              }`}
            >
              {disponible ? `${stock} disponibles` : "Agotado"}
            </span>
          </div>
        </div>
      </div>

      <button
        type="button"
        disabled={!disponible}
        onClick={() => onSelect(libro)}
        className="book-request-btn"
      >
        {disponible ? "Solicitar préstamo" : "Sin stock"}
      </button>
    </article>
  );
}

function CarruselLibros({ titulo, subtitulo, libros = [], onSelect }) {
  const trackRef = useRef(null);
  const [puedeIrIzq, setPuedeIrIzq] = useState(false);
  const [puedeIrDer, setPuedeIrDer] = useState(false);

  const actualizarFlechas = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    setPuedeIrIzq(scrollLeft > 2);
    setPuedeIrDer(scrollLeft + clientWidth < scrollWidth - 2);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    // Al cambiar la lista (p. ej. al filtrar), reinicia al inicio y recalcula
    el.scrollLeft = 0;
    const rafId = requestAnimationFrame(actualizarFlechas);

    const observer = new ResizeObserver(actualizarFlechas);
    observer.observe(el);

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, [libros, actualizarFlechas]);

  const desplazar = (direccion) => {
    if (!trackRef.current) return;
    const distancia = trackRef.current.clientWidth * 0.75;
    trackRef.current.scrollBy({
      left: direccion === "izq" ? -distancia : distancia,
      behavior: "smooth",
    });
  };

  return (
    <section className="catalogo-section">
      <div className="catalogo-section-header">
        <div>
          <h2 className="catalogo-section-title">{titulo}</h2>
          {subtitulo && (
            <p className="catalogo-section-subtitle">{subtitulo}</p>
          )}
        </div>
        <span className="catalogo-section-count">
          {libros.length} {libros.length === 1 ? "libro" : "libros"}
        </span>
      </div>

      <div className="carousel-wrapper">
        {puedeIrIzq && (
          <button
            type="button"
            className="carousel-arrow carousel-arrow-left"
            onClick={() => desplazar("izq")}
            aria-label={`Desplazar ${titulo} a la izquierda`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}

        <div
          className="carousel-track"
          ref={trackRef}
          onScroll={actualizarFlechas}
        >
          {libros.map((libro, index) => (
            <BookCard
              key={libro.id || libro._id || libro.isbn || index}
              libro={libro}
              onSelect={onSelect}
            />
          ))}
        </div>

        {puedeIrDer && (
          <button
            type="button"
            className="carousel-arrow carousel-arrow-right"
            onClick={() => desplazar("der")}
            aria-label={`Desplazar ${titulo} a la derecha`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        )}
      </div>
    </section>
  );
}

export default CarruselLibros;