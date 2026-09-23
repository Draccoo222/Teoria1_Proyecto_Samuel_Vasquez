import { useState, useEffect } from 'react';

export default function Detalles({ usuario }: { usuario: any }) {
    const [presupuestos, setPresupuestos] = useState<any[]>([]);
    const [categorias, setCategorias] = useState<any[]>([]);
    const [subcategorias, setSubcategorias] = useState<any[]>([]);
    const [detalles, setDetalles] = useState<any[]>([]);

    // Selecciones actuales
    const [idPresupuesto, setIdPresupuesto] = useState<string>('');
    const [idCategoria, setIdCategoria] = useState<string>('');
    const [idSubcategoria, setIdSubcategoria] = useState<string>('');
    
    // Formulario
    const [monto, setMonto] = useState('');
    const [observaciones, setObservaciones] = useState('');
    const [mensaje, setMensaje] = useState('');

    // 1. Cargar Presupuestos y Categorías al abrir la pantalla
    useEffect(() => {
        fetch(`http://localhost:3000/api/presupuestos?id_usuario=${usuario.ID_USUARIO}`)
            .then(res => res.json())
            .then(data => {
                setPresupuestos(data);
                if (data.length > 0) setIdPresupuesto(data[0].ID_PRESUPUESTO.toString());
            });

        fetch('http://localhost:3000/api/categorias')
            .then(res => res.json())
            .then(data => {
                setCategorias(data);
                if (data.length > 0) setIdCategoria(data[0].ID_CATEGORIA.toString());
            });
    }, [usuario.ID_USUARIO]);

    // 2. Cargar Subcategorías cuando cambia la Categoría
    useEffect(() => {
        if (!idCategoria) return;
        fetch(`http://localhost:3000/api/subcategorias?id_categoria=${idCategoria}`)
            .then(res => res.json())
            .then(data => {
                setSubcategorias(data);
                if (data.length > 0) setIdSubcategoria(data[0].ID_SUBCATEGORIA.toString());
                else setIdSubcategoria('');
            });
    }, [idCategoria]);

    // 3. Cargar Detalles cuando cambia el Presupuesto
    const cargarDetalles = async (idPres: string) => {
        if (!idPres) return;
        try {
            const res = await fetch(`http://localhost:3000/api/presupuestos/${idPres}/detalles`);
            const data = await res.json();
            setDetalles(data);
        } catch (error) { console.error(error); }
    };

    useEffect(() => {
        cargarDetalles(idPresupuesto);
    }, [idPresupuesto]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMensaje('Guardando...');
        if (!idSubcategoria) {
            setMensaje('❌ Selecciona una subcategoría válida.');
            return;
        }

        try {
            const res = await fetch('http://localhost:3000/api/detalles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_presupuesto: parseInt(idPresupuesto),
                    id_subcategoria: parseInt(idSubcategoria),
                    monto_mensual: parseFloat(monto),
                    observaciones: observaciones || 'Sin observaciones',
                    creado_por: usuario.ID_USUARIO
                })
            });

            if (res.ok) {
                setMensaje('✅ Detalle asignado correctamente.');
                setMonto('');
                setObservaciones('');
                cargarDetalles(idPresupuesto);
            } else {
                setMensaje('❌ Error al asignar detalle (Revisa que no exista ya).');
            }
        } catch (error) { setMensaje('❌ Error de red.'); }
    };

    return (
        <div style={{ background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h2 style={{ color: '#2c3e50', marginTop: 0 }}>Asignación de Detalles del Presupuesto</h2>
            
            <div style={{ marginBottom: '20px', padding: '15px', background: '#e9ecef', borderRadius: '8px', display: 'flex', gap: '15px', alignItems: 'center' }}>
                <label style={{ fontWeight: 'bold' }}>Trabajando en el Presupuesto:</label>
                <select value={idPresupuesto} onChange={(e) => setIdPresupuesto(e.target.value)} style={{ padding: '8px', borderRadius: '5px', flex: 1 }}>
                    {presupuestos.map(p => (
                        <option key={p.ID_PRESUPUESTO} value={p.ID_PRESUPUESTO}>{p.NOMBRE_DESCRIPTIVO} ({p.ESTADO})</option>
                    ))}
                </select>
            </div>

            {mensaje && (
                <div style={{ padding: '10px', marginBottom: '20px', borderRadius: '5px', background: mensaje.includes('✅') ? '#d4edda' : '#f8d7da', color: mensaje.includes('✅') ? '#155724' : '#721c24' }}>
                    {mensaje}
                </div>
            )}

            <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
                {/* Formulario */}
                <div style={{ flex: '1', minWidth: '350px' }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div>
                            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Filtro de Categoría:</label>
                            <select value={idCategoria} onChange={(e) => setIdCategoria(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}>
                                {categorias.map(cat => <option key={cat.ID_CATEGORIA} value={cat.ID_CATEGORIA}>{cat.NOMBRE_CATEGORIA}</option>)}
                            </select>
                        </div>
                        
                        <div>
                            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Subcategoría a Asignar:</label>
                            <select value={idSubcategoria} onChange={(e) => setIdSubcategoria(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}>
                                {subcategorias.length === 0 ? <option value="">Sin subcategorías...</option> : 
                                 subcategorias.map(sub => <option key={sub.ID_SUBCATEGORIA} value={sub.ID_SUBCATEGORIA}>{sub.NOMBRE_SUBCATEGORIA}</option>)}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Monto Planificado (L.):</label>
                            <input type="number" step="0.01" value={monto} onChange={(e) => setMonto(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Observaciones:</label>
                            <input type="text" value={observaciones} onChange={(e) => setObservaciones(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
                        </div>

                        <button type="submit" disabled={!idSubcategoria} style={{ background: '#0056b3', color: 'white', border: 'none', padding: '12px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>
                            Agregar al Presupuesto
                        </button>
                    </form>
                </div>

                {/* Tabla */}
                <div style={{ flex: '2', minWidth: '400px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#343a40', color: 'white' }}>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Subcategoría</th>
                                <th style={{ padding: '10px', textAlign: 'right' }}>Monto Asignado</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Observaciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {detalles.map((d, index) => (
                                <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '10px' }}><strong>{d.NOMBRE_SUBCATEGORIA || `ID Subcat: ${d.ID_SUBCATEGORIA}`}</strong></td>
                                    <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', color: '#dc3545' }}>L. {parseFloat(d.MONTO_MENSUAL).toFixed(2)}</td>
                                    <td style={{ padding: '10px', fontSize: '13px', color: '#666' }}>{d.OBSERVACIONES}</td>
                                </tr>
                            ))}
                            {detalles.length === 0 && (
                                <tr><td colSpan={3} style={{ textAlign: 'center', padding: '20px' }}>No hay detalles asignados a este presupuesto.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}