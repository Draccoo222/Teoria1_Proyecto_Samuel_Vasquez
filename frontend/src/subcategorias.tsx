import { useState, useEffect } from 'react';

export default function Subcategorias({ usuario }: { usuario: any }) {
    const [categorias, setCategorias] = useState<any[]>([]);
    const [idCategoriaSel, setIdCategoriaSel] = useState<string>('');
    const [subcategorias, setSubcategorias] = useState<any[]>([]);
    
    // Estados del formulario
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');

    // 1. Cargar categorías al inicio para llenar el select
    useEffect(() => {
        fetch('http://localhost:3000/api/categorias')
            .then(res => res.json())
            .then(data => {
                setCategorias(data);
                if (data.length > 0) setIdCategoriaSel(data[0].ID_CATEGORIA.toString());
            })
            .catch(err => console.error(err));
    }, []);

    // 2. Cargar subcategorías cada vez que cambie la categoría seleccionada
    const cargarSubcategorias = async (idCat: string) => {
        if (!idCat) return;
        try {
            const res = await fetch(`http://localhost:3000/api/subcategorias?id_categoria=${idCat}`);
            const data = await res.json();
            setSubcategorias(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        cargarSubcategorias(idCategoriaSel);
    }, [idCategoriaSel]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:3000/api/subcategorias', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_categoria: parseInt(idCategoriaSel),
                    nombre_subcategoria: nombre,
                    descripcion: descripcion,
                    creado_por: usuario.ID_USUARIO
                })
            });
            if (res.ok) {
                setNombre('');
                setDescripcion('');
                cargarSubcategorias(idCategoriaSel);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("¿Eliminar esta subcategoría?")) return;
        try {
            const res = await fetch(`http://localhost:3000/api/subcategorias/${id}`, { method: 'DELETE' });
            if (res.ok) cargarSubcategorias(idCategoriaSel);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div style={{ background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h2 style={{ color: '#2c3e50', marginTop: 0 }}>Gestión de Subcategorías</h2>
            
            <div style={{ marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
                <label style={{ fontWeight: 'bold', marginRight: '10px' }}>Selecciona una Categoría Padre:</label>
                <select value={idCategoriaSel} onChange={(e) => setIdCategoriaSel(e.target.value)} style={{ padding: '8px', borderRadius: '5px' }}>
                    {categorias.map(cat => (
                        <option key={cat.ID_CATEGORIA} value={cat.ID_CATEGORIA}>{cat.NOMBRE_CATEGORIA}</option>
                    ))}
                </select>
            </div>

            <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
                {/* Formulario */}
                <div style={{ flex: '1', minWidth: '300px' }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div>
                            <label style={{ display: 'block', fontWeight: 'bold' }}>Nombre Subcategoría:</label>
                            <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontWeight: 'bold' }}>Descripción:</label>
                            <input type="text" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
                        </div>
                        <button type="submit" style={{ background: '#28a745', color: 'white', border: 'none', padding: '12px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>Guardar Subcategoría</button>
                    </form>
                </div>

                {/* Tabla */}
                <div style={{ flex: '2', minWidth: '400px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#e9ecef' }}>
                                <th style={{ padding: '10px', textAlign: 'left' }}>ID</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Subcategoría</th>
                                <th style={{ padding: '10px', textAlign: 'center' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subcategorias.map((sub) => (
                                <tr key={sub.ID_SUBCATEGORIA} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '10px' }}>{sub.ID_SUBCATEGORIA}</td>
                                    <td style={{ padding: '10px' }}><strong>{sub.NOMBRE_SUBCATEGORIA}</strong></td>
                                    <td style={{ padding: '10px', textAlign: 'center' }}>
                                        <button onClick={() => handleDelete(sub.ID_SUBCATEGORIA)} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Borrar</button>
                                    </td>
                                </tr>
                            ))}
                            {subcategorias.length === 0 && <tr><td colSpan={3} style={{ textAlign: 'center', padding: '20px' }}>No hay subcategorías</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}