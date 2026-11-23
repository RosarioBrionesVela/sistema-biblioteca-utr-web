import { useState, useEffect } from "react";
import { obtenerPrestamos } from "../services/loanService";

function MisPrestamos() {
  const [prestamos, setPrestamos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarPrestamos();
  }, []);

  const cargarPrestamos = async () => {
    try {
      setCargando(true);

      const respuesta = await obtenerPrestamos();

      setPrestamos(respuesta);
    } catch (error) {
      setError(error.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div>
      <h1>Mis préstamos</h1>

      {cargando && <p>Cargando préstamos...</p>}

      {error && <p>{error}</p>}

      {!cargando && !error && prestamos.length === 0 && (
        <p>No tienes préstamos registrados.</p>
      )}

      {prestamos.map((prestamo) => (
        <div key={prestamo.id}>
          <h2>{prestamo.libro?.titulo}</h2>

          <p>Fecha del préstamo: {prestamo.fechaPrestamo}</p>

          <p>
            Fecha de devolución: {prestamo.fechaDevolucionEstimada}
          </p>

          <p>Estado: {prestamo.estado}</p>
        </div>
      ))}
    </div>
  );
}

export default MisPrestamos;