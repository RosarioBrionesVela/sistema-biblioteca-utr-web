import { useState, useEffect } from "react";
import { registrarLibro } from "../services/bookService";
import { obtenerUsuarios } from "../services/userService";
import { cambiarRolUsuario } from "../services/userService";
import { obtenerPrestamos, registrarDevolucion } from "../services/loanService";


function Admin() {
    const [seccion, setSeccion] = useState("libros");
    const [isbn, setIsbn] = useState("");
    const [titulo, setTitulo] = useState("");
    const [autor, setAutor] = useState("");
    const [categoria, setCategoria] = useState("");
    const [stockTotal, setStockTotal] = useState("");
    const [cargando, setCargando] = useState(false);
    const [usuarios, setUsuarios] = useState([]);
    const [cargandoUsuarios, setCargandoUsuarios] = useState(false);
    const [errorUsuarios, setErrorUsuarios] = useState("");
    const [busquedaUsuario, setBusquedaUsuario] = useState("");
    const [prestamos, setPrestamos] = useState([]);
    const [cargandoPrestamos, setCargandoPrestamos] = useState(false);
    const [errorPrestamos, setErrorPrestamos] = useState("");

    const cargarUsuarios = async () => {
        try {
            setCargandoUsuarios(true);
            setErrorUsuarios("");

            const respuesta = await obtenerUsuarios();

            setUsuarios(respuesta);
        } catch (error) {
            setErrorUsuarios(error.message);
        } finally {
            setCargandoUsuarios(false);
        }
    };

    const cargarPrestamos = async () => {
        try {
            setCargandoPrestamos(true);
            setErrorPrestamos("");

            const respuesta = await obtenerPrestamos();

            setPrestamos(respuesta);
        } catch (error) {
            setErrorPrestamos(error.message);
        } finally {
            setCargandoPrestamos(false);
        }
    };

    const handleRegistrarDevolucion = async (id) => {
        const observaciones = prompt("Escribe las observaciones de la devolución:");

        if (observaciones === null) {
            return;
        }

        try {
            await registrarDevolucion(id, observaciones);

            await cargarPrestamos();

            alert("Devolución registrada correctamente");
        } catch (error) {
            alert(error.message);
        }
    };

    const handleCambiarRol = async (usuario) => {
        try {
            const nuevoRol = usuario.role === "USER" ? "ADMIN" : "USER";

            await cambiarRolUsuario(usuario.id, nuevoRol);

            await cargarUsuarios();

            alert("Rol actualizado correctamente");
        } catch (error) {
            alert(error.message);
        }
    };

    const usuariosFiltrados = usuarios.filter((usuario) =>
        usuario.nombre?.toLowerCase().includes(busquedaUsuario.toLowerCase()) ||
        String(usuario.matricula).toLowerCase().includes(busquedaUsuario.toLowerCase())
    );

    useEffect(() => {
        if (seccion === "usuarios") {
            cargarUsuarios();
        }

        if (seccion === "prestamos") {
            cargarPrestamos();
        }
    }, [seccion]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isbn || !titulo || !autor || !categoria || !stockTotal) {
            alert("Completa todos los campos");
            return;
        }

        try {
            setCargando(true);

            await registrarLibro({
                isbn,
                titulo,
                autor,
                categoria,
                stockTotal: Number(stockTotal),
            });

            alert("Libro registrado correctamente");

            setIsbn("");
            setTitulo("");
            setAutor("");
            setCategoria("");
            setStockTotal("");

        } catch (error) {
            alert(error.message);
        } finally {
            setCargando(false);
        }
    };

    return (
        <div>
            <h1>Panel de Administración</h1>

            <nav>
                <button onClick={() => setSeccion("libros")}>
                    Libros
                </button>

                <button onClick={() => setSeccion("prestamos")}>
                    Préstamos activos
                </button>

                <button onClick={() => setSeccion("usuarios")}>
                    Usuarios
                </button>
            </nav>

            {seccion === "libros" && (
                <div>
                    <h2>Registrar libro</h2>

                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            placeholder="ISBN"
                            value={isbn}
                            onChange={(e) => setIsbn(e.target.value)}
                        />

                        <input
                            type="text"
                            placeholder="Título"
                            value={titulo}
                            onChange={(e) => setTitulo(e.target.value)}
                        />

                        <input
                            type="text"
                            placeholder="Autor"
                            value={autor}
                            onChange={(e) => setAutor(e.target.value)}
                        />

                        <input
                            type="text"
                            placeholder="Categoría"
                            value={categoria}
                            onChange={(e) => setCategoria(e.target.value)}
                        />

                        <input
                            type="number"
                            placeholder="Stock total"
                            value={stockTotal}
                            onChange={(e) => setStockTotal(e.target.value)}
                        />

                        <button type="submit" disabled={cargando}>
                            {cargando ? "Registrando..." : "Registrar libro"}
                        </button>
                    </form>
                </div>
            )}

            {seccion === "prestamos" && (
                <div>
                    <h2>Préstamos activos</h2>

                    {cargandoPrestamos && <p>Cargando préstamos...</p>}

                    {errorPrestamos && <p>{errorPrestamos}</p>}

                    {!cargandoPrestamos && !errorPrestamos && (
                        <table>
                            <thead>
                                <tr>
                                    <th>Libro</th>
                                    <th>Usuario</th>
                                    <th>Fecha de préstamo</th>
                                    <th>Fecha de devolución</th>
                                    <th>Estado</th>
                                    <th>Acción</th>
                                </tr>
                            </thead>

                            <tbody>
                                {prestamos.map((prestamo) => (
                                    <tr key={prestamo.id}>
                                        <td>{prestamo.libro?.titulo}</td>
                                        <td>{prestamo.usuario?.nombre}</td>
                                        <td>{prestamo.fechaPrestamo}</td>
                                        <td>{prestamo.fechaDevolucionEstimada}</td>
                                        <td>{prestamo.estado}</td>
                                        <td>
                                            {prestamo.estado === "PRESTADO" && (
                                                <button
                                                    onClick={() => handleRegistrarDevolucion(prestamo.id)}
                                                >
                                                    Registrar devolución
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}

                                {prestamos.length === 0 && (
                                    <tr>
                                        <td colSpan="6">No hay préstamos registrados.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {seccion === "usuarios" && (
                <div>
                    <h2>Gestión de usuarios</h2>

                    <p>Administrar usuarios registrados.</p>

                    <input
                        type="text"
                        placeholder="Buscar por nombre o matrícula"
                        value={busquedaUsuario}
                        onChange={(e) => setBusquedaUsuario(e.target.value)}
                    />

                    {cargandoUsuarios && <p>Cargando usuarios...</p>}

                    {errorUsuarios && <p>{errorUsuarios}</p>}

                    {!cargandoUsuarios && !errorUsuarios && (
                        <table>
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Matrícula</th>
                                    <th>Correo</th>
                                    <th>Estado</th>
                                    <th>Rol</th>
                                    <th>Acción</th>
                                </tr>
                            </thead>

                            <tbody>
                                {usuariosFiltrados.map((usuario) => (
                                    <tr key={usuario.id}>
                                        <td>{usuario.nombre}</td>
                                        <td>{usuario.matricula}</td>
                                        <td>{usuario.email}</td>
                                        <td>{usuario.activo ? "Activo" : "Inactivo"}</td>
                                        <td>{usuario.role}</td>
                                        <td>
                                            <button onClick={() => handleCambiarRol(usuario)}>
                                                Cambiar rol
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {usuariosFiltrados.length === 0 && (
                                    <tr>
                                        <td colSpan="6">No se encontraron usuarios.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

        </div>
    );
}

export default Admin;