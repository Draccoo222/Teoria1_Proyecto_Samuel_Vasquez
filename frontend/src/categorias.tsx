import { useState, useEffect } from 'react';

export default function Categorias({ usuario }: { usuario: any }) {
    const [categorias, setCategorias] = useState<any[]>([]);
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [tipo, setTipo] = useState('gasto'); // Por defecto

    // Función para cargar las categorías desde Db2
    const cargarCategorias = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/categorias');
            const data = await res.json();
            setCategorias(data);
        } catch (error) {
            console.error("Error cargando categorías:", error);
        }
    };

    // Ejecutar al abrir la pantalla
    useEffect(() => {
        cargarCategorias();
    }, []);

    // Función para crear una nueva categoría
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:3000/api/categorias', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre_categoria: nombre,
                    descripcion: descripcion,
                    tipo_categoria: tipo,
                    nombre_icono: 'default.png',
                    color_hex: '#000000',
                    orden_presentacion: 1,
                    creado_por: usuario.ID_USUARIO
                })
            });
            
            if (res.ok) {
                // Limpiar formulario y recargar la tabla
                setNombre('');
                setDescripcion('');
                cargarCategorias();
            } else {
                alert("Error al guardar la categoría");
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    // Función para eliminar
    const handleDelete = async (id: number) => {
        if (!window.confirm("¿Seguro que deseas eliminar esta categoría?")) return;
        
        try {
            const res = await fetch(`http://localhost:3000/api/categorias/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) cargarCategorias();
        } catch (error) {
            console.error("Error al eliminar:", error);
        }
    };

    return (
        <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
            {/* Formulario (Create) */}
            <div style={{ flex: '1', minWidth: '300px', background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                <h3 style={{ color: '#2c3e50', marginTop: 0 }}>Nueva Categoría</h3>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Nombre:</label>
                        <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Descripción:</label>
                        <input type="text" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Tipo:</label>
                        <select value={tipo} onChange={(e) => setTipo(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}>
                            <option value="ingreso">Ingreso</option>
                            <option value="gasto">Gasto</option>
                            <option value="ahorro">Ahorro</option>
                        </select>
                    </div>
                    <button type="submit" style={{ background: '#28a745', color: 'white', border: 'none', padding: '12px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>Guardar</button>
                </form>
            </div>

            {/* Tabla (Read & Delete) */}
            <div style={{ flex: '2', minWidth: '400px', background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                <h3 style={{ color: '#2c3e50', marginTop: 0 }}>Categorías Registradas</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                            <th style={{ padding: '12px', textAlign: 'left' }}>ID</th>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Nombre</th>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Tipo</th>
                            <th style={{ padding: '12px', textAlign: 'center' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categorias.map((cat) => (
                            <tr key={cat.ID_CATEGORIA} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '12px' }}>{cat.ID_CATEGORIA}</td>
                                <td style={{ padding: '12px' }}><strong>{cat.NOMBRE_CATEGORIA}</strong> <br/><small style={{ color: '#666' }}>{cat.DESCRIPCION}</small></td>
                                <td style={{ padding: '12px' }}>
                                    <span style={{ background: cat.TIPO_CATEGORIA === 'ingreso' ? '#d4edda' : cat.TIPO_CATEGORIA === 'gasto' ? '#f8d7da' : '#cce5ff', color: '#333', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                                        {cat.TIPO_CATEGORIA.toUpperCase()}
                                    </span>
                                </td>
                                <td style={{ padding: '12px', textAlign: 'center' }}>
                                    <button onClick={() => handleDelete(cat.ID_CATEGORIA)} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Eliminar</button>
                                </td>
                            </tr>
                        ))}
                        {categorias.length === 0 && (
                            <tr><td colSpan={4} style={{ textAlign: 'center', padding: '20px', color: '#666' }}>No hay categorías. ¡Crea la primera!</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}