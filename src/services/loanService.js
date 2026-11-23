import { apiFetch } from "./api";

// Solicitar un préstamo
export function solicitarPrestamo(datosPrestamo) {
  return apiFetch("/api/loans/books", {
    method: "POST",
    body: JSON.stringify(datosPrestamo),
  });
}

// Obtener los préstamos
export function obtenerPrestamos() {
  return apiFetch("/api/loans/books");
}

// Registrar devolución
export function registrarDevolucion(id, observaciones) {
  return apiFetch(`/api/loans/books/${id}/return`, {
    method: "PATCH",
    body: JSON.stringify({ observaciones }),
  });
}