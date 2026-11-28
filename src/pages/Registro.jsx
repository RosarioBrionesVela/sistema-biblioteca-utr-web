import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiFetch } from "../services/api";
import utrLogo from "../assets/utr-logo.png";
import fondoRegistro from "../assets/fondo-registro.png";
import "./Registro.css";

function Registro() {
  const [formData, setFormData] = useState({
    nombre: "",
    matricula: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const redirectTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    setError("");

    const nombreTrimmed = formData.nombre.trim();
    const matriculaTrimmed = formData.matricula.trim();
    const emailTrimmed = formData.email.trim();
    const { password, confirmPassword } = formData;

    // Validación de campos vacíos
    if (
      !nombreTrimmed ||
      !matriculaTrimmed ||
      !emailTrimmed ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      setError("Por favor, completa todos los campos obligatorios.");
      return;
    }

    // Validación de confirmación de contraseña (Requisito Pantalla 2)
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden. Verifica e intenta de nuevo.");
      return;
    }

    setLoading(true);
    try {
      const respuesta = await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          nombre: nombreTrimmed,
          matricula: matriculaTrimmed,
          email: emailTrimmed,
          password,
          rol: "USER",
        }),
      });

      if (respuesta?.error) {
        setError(respuesta.error);
        return;
      }

      setMensaje(
        respuesta?.message || "Usuario registrado correctamente. Redirigiendo..."
      );

      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }

      // Redirección al Login tras registro exitoso (Requisito Pantalla 2)
      redirectTimerRef.current = setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      const msg = (err?.message || "").toLowerCase();

      if (msg.includes("failed to fetch") || msg.includes("network")) {
        setError("No se pudo conectar con el servidor. Intenta de nuevo.");
      } else if (
        err?.status === 409 ||
        msg.includes("ya existe") ||
        msg.includes("already") ||
        msg.includes("registrado") ||
        msg.includes("duplicat")
      ) {
        setError("Ya existe una cuenta con ese correo o matrícula.");
      } else {
        setError(err?.message || "Ocurrió un error al registrar la cuenta.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
      <div
        className="registro-page"
        style={{ "--registro-bg": `url(${fondoRegistro})` }}
      >
        {/* Fondo con la ilustración de Figma */}
        <div className="registro-bg-photo" aria-hidden="true" />

        {/* Ondas decorativas superior derecha e inferior */}
        <svg
          className="registro-wave-top-right"
          viewBox="0 0 600 260"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M120,0 L600,0 L600,260 C530,190 480,105 340,70 C230,42 165,35 120,0 Z"
            fill="rgba(166, 38, 69, 0.2)"
          />
          <path
            d="M270,0 L600,0 L600,210 C560,120 485,62 370,35 C320,23 290,12 270,0 Z"
            fill="#8c0d32"
          />
        </svg>

        <svg
          className="registro-wave-bottom"
          viewBox="0 0 1440 160"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0,120 C260,150 540,95 820,125 C1090,154 1290,90 1440,30 L1440,160 L0,160 Z"
            fill="rgba(222, 134, 155, 0.45)"
          />
          <path
            d="M640,160 C890,115 1180,145 1440,75 L1440,160 Z"
            fill="rgba(140, 13, 50, 0.16)"
          />
        </svg>

        {/* Botón flotante de regreso arriba a la izquierda */}
        <Link
          to="/login"
          className="registro-back-btn"
          aria-label="Volver a iniciar sesión"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </Link>

        {/* Contenedor principal en 2 columnas */}
        <main className="registro-container">
          {/* Espacio izquierdo para dejar visible la ilustración */}
          <div className="registro-hero-spacer" aria-hidden="true" />

          {/* Columna derecha: Tarjeta blanca de Registro */}
          <section className="registro-card-wrap">
            <div className="registro-card">
              <header className="registro-card-header">
                <img
                  src={utrLogo}
                  alt="Escudo Universidad Tecnológica El Retoño"
                  className="registro-logo"
                />
                <h1 className="registro-title">Registro de Usuario</h1>
                <p className="registro-subtitle">Únete a nuestra biblioteca</p>
              </header>

              <form onSubmit={handleSubmit} className="registro-form" noValidate>
                {/* Nombre completo */}
                <div className="registro-input-group">
                  <span className="registro-input-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <circle cx="12" cy="8" r="3.5" />
                      <path d="M5 19.5c0-3.3 3.1-5.5 7-5.5s7 2.2 7 5.5" strokeLinecap="round" />
                    </svg>
                  </span>
                  <input
                    id="nombre"
                    name="nombre"
                    type="text"
                    placeholder="Nombre completo"
                    value={formData.nombre}
                    onChange={handleChange}
                    autoComplete="name"
                    disabled={loading}
                    className="registro-input"
                  />
                </div>

                {/* Matrícula */}
                <div className="registro-input-group">
                  <span className="registro-input-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="3" y="5" width="18" height="14" rx="2.2" />
                      <circle cx="8.5" cy="11.5" r="2" />
                      <path d="M6.2 16c.5-1.4 1.4-2 2.3-2s1.8.6 2.3 2" strokeLinecap="round" />
                      <line x1="13.5" y1="10" x2="18" y2="10" strokeLinecap="round" />
                      <line x1="13.5" y1="14" x2="17" y2="14" strokeLinecap="round" />
                    </svg>
                  </span>
                  <input
                    id="matricula"
                    name="matricula"
                    type="text"
                    placeholder="Matrícula"
                    value={formData.matricula}
                    onChange={handleChange}
                    disabled={loading}
                    className="registro-input"
                  />
                </div>

                {/* Correo institucional */}
                <div className="registro-input-group">
                  <span className="registro-input-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="3" y="5" width="18" height="14" rx="2.5" />
                      <path d="M3.5 7l8.5 6 8.5-6" />
                    </svg>
                  </span>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Correo institucional"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    disabled={loading}
                    className="registro-input"
                  />
                </div>

                {/* Contraseña */}
                <div className="registro-input-group">
                  <span className="registro-input-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="5" y="11" width="14" height="9" rx="2" />
                      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                    </svg>
                  </span>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Contraseña"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    disabled={loading}
                    className="registro-input registro-input-password"
                  />
                  <button
                    type="button"
                    className="registro-toggle-password"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-10-8-10-8a18.4 18.4 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <line x1="2" y1="2" x2="22" y2="22" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Confirmar contraseña */}
                <div className="registro-input-group">
                  <span className="registro-input-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="5" y="11" width="14" height="9" rx="2" />
                      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                    </svg>
                  </span>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirmar contraseña"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                    disabled={loading}
                    className="registro-input registro-input-password"
                  />
                  <button
                    type="button"
                    className="registro-toggle-password"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    aria-label={
                      showConfirmPassword ? "Ocultar confirmación" : "Ver confirmación"
                    }
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-10-8-10-8a18.4 18.4 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <line x1="2" y1="2" x2="22" y2="22" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Mensajes */}
                {mensaje && (
                  <p className="registro-feedback registro-feedback-success" role="status">
                    {mensaje}
                  </p>
                )}
                {error && (
                  <p className="registro-feedback registro-feedback-error" role="alert">
                    {error}
                  </p>
                )}

                {/* Botón de envío */}
                <button
                  type="submit"
                  disabled={loading}
                  className="registro-submit-btn"
                >
                  <span>{loading ? "Registrando..." : "Registrarse"}</span>
                  {!loading && (
                    <svg
                      className="registro-arrow-icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  )}
                </button>
              </form>

              <p className="registro-footer-text">
                ¿Ya tienes cuenta?{" "}
                <Link to="/login" className="registro-login-link">
                  Inicia sesión
                </Link>
              </p>
            </div>
          </section>
        </main>
      </div>
    );
  }

  export default Registro;