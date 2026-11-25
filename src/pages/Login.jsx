import { apiFetch } from "../services/api";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { iniciarSesion } = useContext(AuthContext);
  const [error, setError] = useState("");
  const navigate = useNavigate();


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const respuesta = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (respuesta) {
        iniciarSesion({
          ...respuesta.user,
          token: respuesta.token,
        });
        navigate("/catalogo");

        console.log("Inicio de sesión exitoso");
      }

    } catch (error) {
      setError(error.message);
    }
  };


  return (
    <div>
      <h1>Inicio de sesión</h1>

      <form onSubmit={handleSubmit}>
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
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit">
          Iniciar sesión
        </button>
      </form>
    </div>
  );
}

export default Login;
