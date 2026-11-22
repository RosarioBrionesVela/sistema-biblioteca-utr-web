import { useState } from "react";
import { Link } from "react-router-dom";
import { registrarUsuario as registrarUsuarioAPI } from "../services/authService";
import { useNavigate } from "react-router-dom";

function Registro() {
    const [nombre, setNombre] = useState("");
    const [matricula, setMatricula] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmarPassword, setConfirmarPassword] = useState("");
    const navigate = useNavigate();
    const [cargando, setCargando] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (
            !nombre.trim() ||
            !matricula.trim() ||
            !email.trim() ||
            !password.trim() ||
            !confirmarPassword.trim()
        ) {
            alert("Completa todos los campos");
            return;
        }

        if (password !== confirmarPassword) {
            alert("Las contraseñas no coinciden");
            return;
        }

        try {
            setCargando(true);

            await registrarUsuarioAPI({
                nombre,
                matricula,
                email,
                password,
                role: "USER",
            });

            alert("Registro exitoso. Ahora inicia sesión.");
            navigate("/login");

        } catch (error) {
            alert(error.message);
        } finally {
            setCargando(false);
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

                <label>Confirmar contraseña</label>
                <input
                    type="password"
                    value={confirmarPassword}
                    onChange={(e) => setConfirmarPassword(e.target.value)}
                />

                <button type="submit" disabled={cargando}>
                    {cargando ? "Registrando..." : "Registrarme"}
                </button>
            </form>

            <p>
                ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
            </p>
        </div>
    );
}

export default Registro;