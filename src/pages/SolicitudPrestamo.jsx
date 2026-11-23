import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { solicitarPrestamo } from "../services/loanService";

function SolicitudPrestamo() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [fechaDevolucion, setFechaDevolucion] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fechaDevolucion) {
      alert("Selecciona una fecha de devolución");
      return;
    }

    try {
      setCargando(true);

      await solicitarPrestamo({
        bookId: id,
        fechaDevolucionEstimada: fechaDevolucion,
      });

      alert("Solicitud de préstamo enviada correctamente");
      navigate("/mis-prestamos");

    } catch (error) {
      alert(error.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div>
      <h1>Solicitar préstamo</h1>

      <form onSubmit={handleSubmit}>
        <label>Fecha estimada de devolución</label>

        <input
          type="date"
          value={fechaDevolucion}
          onChange={(e) => setFechaDevolucion(e.target.value)}
        />

        <button type="submit" disabled={cargando}>
          {cargando ? "Enviando..." : "Confirmar préstamo"}
        </button>
      </form>
    </div>
  );
}

export default SolicitudPrestamo;