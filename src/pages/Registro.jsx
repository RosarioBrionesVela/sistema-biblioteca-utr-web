
import { useState } from "react";
import { apiFetch } from "../services/api";

function Registro() {
  const [nombre, setNombre] = useState("");
  const [matricula, setMatricula] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");


  const handleSubmit = async (e) => {
    e.preventDefault();

    setMensaje("");
    setError("");

    try {
      const respuesta = await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          nombre,
          matricula,
          email,
          password,
          rol: "USER",
        }),
      });

      setMensaje(respuesta.message);

    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div>
      <h1>Crear cuenta</h1>

      <form onSubmit={handleSubmit}>
        <label>Nombre completo</label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />

        <label>Matrícula</label>
        <input
          type="text"
          value={matricula}
          onChange={(e) => setMatricula(e.target.value)}
        />

        <label>Correo electrónico</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label>Contraseña</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {mensaje && <p style={{ color: "green" }}>{mensaje}</p>}

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button type="submit">
          Registrarme
        </button>
      </form>
    </div>
  );
}

export default Registro;
