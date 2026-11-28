import { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiFetch } from "../services/api";
import { AuthContext } from "../context/AuthContext";
import utrLogo from "../assets/utr-logo.png";
import fondoBiblioteca from "../assets/fondo-biblioteca.png";
import "./Login.css";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [infoMsg, setInfoMsg] = useState("");

  const { iniciarSesion } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const savedEmail = localStorage.getItem("utr_remembered_email");
    if (savedEmail) {
      setFormData((prev) => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
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
    setError("");
    setInfoMsg("");

    const emailTrimmed = formData.email.trim();
    const passwordValue = formData.password;

    if (!emailTrimmed || !passwordValue.trim()) {
      setError("Por favor, ingresa tu correo institucional y tu contraseña.");
      return;
    }

    setLoading(true);
    try {
      const respuesta = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: emailTrimmed,
          password: passwordValue,
        }),
      });

      if (respuesta && respuesta.token) {
        if (rememberMe) {
          localStorage.setItem("utr_remembered_email", emailTrimmed);
        } else {
          localStorage.removeItem("utr_remembered_email");
        }

        iniciarSesion({
          ...respuesta.user,
          token: respuesta.token,
        });

        navigate("/catalogo");
      } else {
        setError(
          respuesta?.message ||
          respuesta?.error ||
          "El usuario no existe o la contraseña es incorrecta."
        );
      }
    } catch (err) {
      const msg = (err?.message || "").toLowerCase();

      if (msg.includes("failed to fetch") || msg.includes("network")) {
        setError("No se pudo conectar con el servidor. Intenta de nuevo.");
      } else if (
        err?.status === 404 ||
        msg.includes("no existe") ||
        msg.includes("not found") ||
        msg.includes("no encontrado")
      ) {
        setError("El usuario no existe.");
      } else if (
        msg.includes("contraseña") ||
        msg.includes("password")
      ) {
        setError("Contraseña incorrecta.");
      } else if (
        err?.status === 401 ||
        err?.status === 400 ||
        msg.includes("unauthorized") ||
        msg.includes("credenciales") ||
        msg.includes("invalid") ||
        !err?.message
      ) {
        setError("El usuario no existe o la contraseña es incorrecta.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setError("");
    setInfoMsg(
      "Para restablecer tu contraseña, acude o contacta al administrador de la Biblioteca UTR."
    );
  };

  return (
    <div
      className="login-page"
      style={{ "--library-bg": `url(${fondoBiblioteca})` }}
    >
      {/* Imagen única de fondo (gatito + libros + estantes) */}
      <div className="login-bg-photo" aria-hidden="true" />
      {/* Degradado claro solo arriba-izquierda para legibilidad del logo */}
      <div className="login-bg-wash" aria-hidden="true" />

      {/* Ondas guinda estilo Figma */}
      <svg
        className="login-wave-top"
        viewBox="0 0 1440 220"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0,0 L1440,0 L1440,70 C1280,145 1060,20 840,75 C620,130 420,170 210,120 C110,95 45,105 0,130 Z"
          fill="rgba(166, 38, 69, 0.22)"
        />
        <path
          d="M0,0 L1440,0 L1440,42 C1260,115 1050,5 800,45 C580,82 400,15 220,75 C120,108 50,95 0,68 Z"
          fill="#8c0d32"
        />
      </svg>

      <svg
        className="login-wave-left"
        viewBox="0 0 240 600"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0,0 C45,110 130,170 155,310 C180,450 95,530 165,600 L0,600 Z"
          fill="#8c0d32"
        />
      </svg>

      <svg
        className="login-wave-bottom"
        viewBox="0 0 1440 160"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0,75 C120,135 280,150 480,130 C760,102 1080,140 1440,55 L1440,160 L0,160 Z"
          fill="#8c0d32"
        />
      </svg>

      {/* Contenedor principal */}
      <main className="login-container">
        {/* Izquierda: solo encabezado arriba para dejar visible al gatito abajo */}
        <section className="login-hero">
          <div className="login-brand">
            <img
              src={utrLogo}
              alt="Escudo Universidad Tecnológica El Retoño"
              className="login-logo"
            />
            <h2 className="login-brand-title">Biblioteca Universitaria</h2>
            <p className="login-brand-subtitle">
              Tu conocimiento, nuestro propósito
            </p>
          </div>
        </section>

        {/* Derecha: Tarjeta blanca de Inicio de Sesión */}
        <section className="login-card-wrap">
          <div className="login-card">
            <header className="login-card-header">
              <h1 className="login-title">Iniciar Sesión</h1>
              <p className="login-subtitle">Accede a tu cuenta</p>
            </header>

            <form onSubmit={handleSubmit} className="login-form" noValidate>
              <div className="login-input-group">
                <span className="login-input-icon" aria-hidden="true">
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
                  className="login-input"
                />
              </div>

              <div className="login-input-group">
                <span className="login-input-icon" aria-hidden="true">
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
                  autoComplete="current-password"
                  disabled={loading}
                  className="login-input login-input-password"
                />
                <button
                  type="button"
                  className="login-toggle-password"
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

              <div className="login-options">
                <label className="login-remember">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={loading}
                  />
                  <span>Recordarme</span>
                </label>

                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="login-forgot-btn"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              {error && (
                <p className="login-feedback login-feedback-error" role="alert">
                  {error}
                </p>
              )}
              {infoMsg && (
                <p className="login-feedback login-feedback-info">
                  {infoMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="login-submit-btn"
              >
                <span>{loading ? "Iniciando sesión..." : "Iniciar Sesión"}</span>
                {!loading && (
                  <svg
                    className="login-arrow-icon"
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

            <p className="login-footer-text">
              ¿No tienes cuenta?{" "}
              <Link to="/registro" className="login-register-link">
                Regístrate aquí
              </Link>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Login;