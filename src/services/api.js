
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

  try {
    const respuesta = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Error 401: sesión no válida
    if (respuesta.status === 401) {
      localStorage.removeItem("usuario");
      window.location.href = "/login";
      return null;
    }

    // Error 403: acceso denegado
    if (respuesta.status === 403) {
      throw new Error("No tienes permiso para realizar esta acción.");
    }

    // Error 404: recurso no encontrado
    if (respuesta.status === 404) {
      throw new Error("No se encontró la información solicitada.");
    }

    // Error 500: error interno del servidor
    if (respuesta.status >= 500) {
      throw new Error("Error interno del servidor. Intenta más tarde.");
    }

    // Otros errores HTTP
    if (!respuesta.ok) {
      throw new Error("Ocurrió un error al comunicarse con el servidor.");
    }

    // Respuesta sin contenido
    if (respuesta.status === 204) {
      return null;
    }

    return await respuesta.json();

  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error("No se pudo conectar con el servidor.");
    }

    throw error;
  }
}
