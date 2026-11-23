import { apiFetch } from "./api";

// Obtener todos los libros
export function obtenerLibros() {
  return apiFetch("/api/books");
}

// Buscar libros
export function buscarLibros(search, categoria) {
  return apiFetch(
    `/api/books?search=${search}&categoria=${categoria}`
  );
}

// Registrar un libro
export function registrarLibro(datosLibro) {
  return apiFetch("/api/books", {
    method: "POST",
    body: JSON.stringify(datosLibro),
  });
}

// Editar un libro
export function editarLibro(id, datosLibro) {
  return apiFetch(`/api/books/${id}`, {
    method: "PUT",
    body: JSON.stringify(datosLibro),
  });
}