import { useState, useEffect } from 'react';

export default function Obligaciones({ usuario }: { usuario: any }) {
    const [obligaciones, setObligaciones] = useState<any[]>([]);
    const [categorias, setCategorias] = useState<any[]>([]);
    const [subcategorias, setSubcategorias] = useState<any[]>([]);

    // Estados de selección
    const [idCategoria, setIdCategoria] = useState<string>('');
    const [idSubcategoria, setIdSubcategoria] = useState<string>('');

    // Estados del formulario
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [monto, setMonto] = useState('');
    const [diaVencimiento, setDiaVencimiento] = useState('');
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');

    const cargarObligaciones = async () => {
        try {
            const res = await fetch(`http://localhost:3000/api/obligaciones?id_usuario=${usuario.ID_USUARIO}`);
            const data = await res.json();
            setObligaciones(data);
        } catch (error) { console.error(error); }
    };

    useEffect(() => {
        cargarObligaciones();
        fetch('http://localhost:3000/api/categorias')
            .then(res => res.json())
            .then(data => {
                setCategorias(data);
                if (data.length > 0) setIdCategoria(data[0].ID_CATEGORIA.toString());
            });
    }, [usuario.ID_USUARIO]);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:3000/api/obligaciones', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_usuario: usuario.ID_USUARIO,
                    id_subcategoria: parseInt(idSubcategoria),
                    nombre_obligacion: nombre,
                    descripcion: descripcion,
                    monto: parseFloat(monto),
                    dia_vencimiento: parseInt(diaVencimiento),
                    fecha_inicio: fechaInicio,
                    fecha_fin: fechaFin || null,
                    creado_por: usuario.ID_USUARIO
                })
            });

            if (res.ok) {
                setNombre(''); setDescripcion(''); setMonto(''); 
                setDiaVencimiento(''); setFechaInicio(''); setFechaFin('');
                cargarObligaciones();
            }
        } catch (error) { console.error("Error al guardar:", error); }
    };

    return (
        <div style={{ background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h2 style={{ color: '#2c3e50', marginTop: 0 }}>Obligaciones Fijas Mensuales</h2>

            <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
                <div style={{ flex: '1', minWidth: '350px' }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <select value={idCategoria} onChange={(e) => setIdCategoria(e.target.value)} style={{ padding: '8px', width: '50%' }}>
                                {categorias.map(c => <option key={c.ID_CATEGORIA} value={c.ID_CATEGORIA}>{c.NOMBRE_CATEGORIA}</option>)}
                            </select>
                            <select value={idSubcategoria} onChange={(e) => setIdSubcategoria(e.target.value)} required style={{ padding: '8px', width: '50%' }}>
                                {subcategorias.length === 0 ? <option value="">Sin subcategorías</option> : 
                                 subcategorias.map(s => <option key={s.ID_SUBCATEGORIA} value={s.ID_SUBCATEGORIA}>{s.NOMBRE_SUBCATEGORIA}</option>)}
                            </select>
                        </div>

                        <input type="text" placeholder="Nombre (Ej: Recibo de Luz)" value={nombre} onChange={(e) => setNombre(e.target.value)} required style={{ padding: '10px' }} />
                        <input type="text" placeholder="Descripción breve" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} style={{ padding: '10px' }} />
                        
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input type="number" step="0.01" placeholder="Monto (L.)" value={monto} onChange={(e) => setMonto(e.target.value)} required style={{ padding: '10px', width: '60%' }} />
                            <input type="number" placeholder="Día de Pago (1-31)" value={diaVencimiento} onChange={(e) => setDiaVencimiento(e.target.value)} required min="1" max="31" style={{ padding: '10px', width: '40%' }} />
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <div style={{ width: '50%' }}>
                                <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Fecha Inicio:</label>
                                <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} required style={{ padding: '8px', width: '100%' }} />
                            </div>
                            <div style={{ width: '50%' }}>
                                <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Fecha Fin (Opcional):</label>
                                <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} style={{ padding: '8px', width: '100%' }} />
                            </div>
                        </div>

                        <button type="submit" disabled={!idSubcategoria} style={{ background: '#e67e22', color: 'white', border: 'none', padding: '12px', fontWeight: 'bold', cursor: 'pointer', borderRadius: '5px' }}>Registrar Obligación</button>
                    </form>
                </div>

                <div style={{ flex: '2', minWidth: '400px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#34495e', color: 'white' }}>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Obligación</th>
                                <th style={{ padding: '10px', textAlign: 'right' }}>Monto</th>
                                <th style={{ padding: '10px', textAlign: 'center' }}>Día Pago</th>
                                <th style={{ padding: '10px', textAlign: 'center' }}>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {obligaciones.map((o) => (
                                <tr key={o.ID_OBLIGACION} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '10px' }}><strong>{o.NOMBRE_OBLIGACION}</strong></td>
                                    <td style={{ padding: '10px', textAlign: 'right', color: '#c0392b', fontWeight: 'bold' }}>L. {parseFloat(o.MONTO_FIJO_MENSUAL || o.MONTO || 0).toFixed(2)}</td>
                                    <td style={{ padding: '10px', textAlign: 'center' }}>{o.DIA_VENCIMIENTO}</td>
                                    <td style={{ padding: '10px', textAlign: 'center' }}>
                                        <span style={{ background: o.ESTA_VIGENTE ? '#d4edda' : '#f8d7da', color: o.ESTA_VIGENTE ? '#155724' : '#721c24', padding: '4px 8px', borderRadius: '12px', fontSize: '12px' }}>
                                            {o.ESTA_VIGENTE ? 'Vigente' : 'Inactiva'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {obligaciones.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', padding: '20px' }}>No hay obligaciones registradas.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}