import { apiFetch } from "./api";

// Obtener todos los usuarios
export function obtenerUsuarios() {
  return apiFetch("/api/users");
}

// Cambiar el rol de un usuario
export function cambiarRolUsuario(id, role) {
  return apiFetch(`/api/users/${id}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
}