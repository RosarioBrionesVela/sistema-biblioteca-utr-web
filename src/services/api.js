const API_URL = import.meta.env.VITE_API_URL;

const APP_TOKEN = import.meta.env.VITE_API_APP_TOKEN;

export async function apiFetch(endpoint, options = {}) {
  const usuarioGuardado = localStorage.getItem("usuario");

  const usuario = usuarioGuardado
    ? JSON.parse(usuarioGuardado)
    : null;

  const headers = {
    "Content-Type": "application/json",
    "x-api-token": APP_TOKEN,
    ...options.headers,
  };

  if (usuario?.token) {
    headers.Authorization = `Bearer ${usuario.token}`;
  }

  const respuesta = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (respuesta.status === 401) {
    localStorage.removeItem("usuario");
    window.location.href = "/login";
    return;
  }

  if (respuesta.status === 403) {
    throw new Error("No tienes permiso para realizar esta acción.");
  }

  if (!respuesta.ok) {
    throw new Error("Ocurrió un error al comunicarse con el servidor.");
  }

  if (respuesta.status === 204) {
    return null;
  }

  return respuesta.json();
}