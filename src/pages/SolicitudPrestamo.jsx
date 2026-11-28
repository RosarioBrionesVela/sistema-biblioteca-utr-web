import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { obtenerLibros } from "../services/bookService";
import ModalSolicitudPrestamo from "../components/ModalSolicitudPrestamo";

function SolicitudPrestamo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [libro, setLibro] = useState(location.state?.libro || null);
  const [cargando, setCargando] = useState(!location.state?.libro);

  useEffect(() => {
    if (libro) return;

    const cargarLibro = async () => {
      try {
        const lista = await obtenerLibros();
        const libros = Array.isArray(lista) ? lista : lista?.books || [];
        const encontrado = libros.find((b) => String(b.id) === String(id));
        setLibro(encontrado || null);
      } finally {
        setCargando(false);
      }
    };

    cargarLibro();
  }, [id, libro]);

  if (cargando) return <p style={{ padding: "2rem" }}>Cargando libro...</p>;
  if (!libro) return <p style={{ padding: "2rem" }}>Libro no encontrado.</p>;

  return (
    <ModalSolicitudPrestamo
      libro={libro}
      onClose={() => navigate("/catalogo")}
    />
  );
}

export default SolicitudPrestamo;