import { apiFetch } from "./api";

// Registrar un usuario
export function registrarUsuario(datosUsuario) {
  return apiFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(datosUsuario),
  });
}

// Iniciar sesión
export function iniciarSesion(datosLogin) {
  return apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(datosLogin),
  });
}