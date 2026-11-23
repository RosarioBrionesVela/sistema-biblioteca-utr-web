import { useState, useEffect } from "react";
import { obtenerLibros } from "../services/bookService";
import { Link } from "react-router-dom";


function Catalogo() {
    const [libros, setLibros] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [busqueda, setBusqueda] = useState("");
    const [categoria, setCategoria] = useState("");

    useEffect(() => {
        cargarLibros();
    }, []);

    const cargarLibros = async () => {
        try {
            setCargando(true);

            const respuesta = await obtenerLibros();

            setLibros(respuesta);
        } catch (error) {
            setError(error.message);
        } finally {
            setCargando(false);
        }
    };

    const librosFiltrados = libros.filter((libro) => {
        const coincideBusqueda =
            libro.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
            libro.autor.toLowerCase().includes(busqueda.toLowerCase());

        const coincideCategoria =
            categoria === "" || libro.categoria === categoria;

        return coincideBusqueda && coincideCategoria;
    });

    return (
        <div>
            <h1>Catálogo de libros</h1>

            <input
                type="text"
                placeholder="Buscar por título o autor"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
            />

            <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
            >
                <option value="">Todas las categorías</option>
                <option value="Ciencia">Ciencia</option>
                <option value="Tecnología">Tecnología</option>
                <option value="Arte">Arte</option>
                <option value="Literatura">Literatura</option>
            </select>

            {cargando && <p>Cargando libros...</p>}

            {error && <p>{error}</p>}

            {!cargando && !error && libros.length === 0 && (
                <p>No hay libros disponibles.</p>
            )}

            <div>
                {librosFiltrados.map((libro) => (
                    <div key={libro.id}>
                        <h2>{libro.titulo}</h2>

                        <p>Autor: {libro.autor}</p>

                        <p>ISBN: {libro.isbn}</p>

                        <p>Categoría: {libro.categoria}</p>

                        <p>
                            Disponibilidad: {libro.stockDisponible}
                        </p>

                        {libro.stockDisponible > 0 ? (
                            <Link to={`/solicitar/${libro.id}`}>
                                Solicitar préstamo
                            </Link>
                        ) : (
                            <p>Sin existencias</p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Catalogo;