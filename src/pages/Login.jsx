import { useState } from "react";
import { Link } from "react-router-dom";
import { iniciarSesion as iniciarSesionAPI } from "../services/authService";
import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { iniciarSesion } = useContext(AuthContext);
    const [cargando, setCargando] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email.trim() || !password.trim()) {
            alert("Completa todos los campos");
            return;
        }

        try {
            setCargando(true);

            const respuesta = await iniciarSesionAPI({
                email,
                password,
            });

            iniciarSesion({
                token: respuesta.token,
                role: respuesta.role,
            });

            if (respuesta.role === "ADMIN") {
                window.location.href = "/admin";
            } else {
                window.location.href = "/catalogo";
            }

        } catch (error) {
            alert(error.message);
        } finally {
            setCargando(false);
        }
    };

    return (
        <div>
            <h1>Inicio de sesión</h1>

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Correo electrónico</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Ingresa tu correo"
                    />
                </div>

                <div>
                    <label>Contraseña</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Ingresa tu contraseña"
                    />
                </div>

                <button type="submit" disabled={cargando}>
                    {cargando ? "Iniciando sesión..." : "Iniciar sesión"}
                </button>
            </form>

            <p>
                ¿No tienes cuenta? <Link to="/registro">Regístrate</Link>
            </p>
        </div>
    );
}

export default Login;