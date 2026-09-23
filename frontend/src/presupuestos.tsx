import { useState, useEffect } from 'react';

export default function Presupuestos({ usuario }: { usuario: any }) {
    const [presupuestos, setPresupuestos] = useState<any[]>([]);
    
    // Estados del formulario
    const [nombre, setNombre] = useState('');
    const [anioInicio, setAnioInicio] = useState(new Date().getFullYear());
    const [mesInicio, setMesInicio] = useState(new Date().getMonth() + 1);
    const [anioFin, setAnioFin] = useState(new Date().getFullYear());
    const [mesFin, setMesFin] = useState(new Date().getMonth() + 1);
    const [ingresos, setIngresos] = useState('');
    const [gastos, setGastos] = useState('');
    const [ahorro, setAhorro] = useState('');

    const cargarPresupuestos = async () => {
        try {
            const res = await fetch(`http://localhost:3000/api/presupuestos?id_usuario=${usuario.ID_USUARIO}`);
            const data = await res.json();
            setPresupuestos(data);
        } catch (error) { console.error(error); }
    };

    useEffect(() => { cargarPresupuestos(); }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:3000/api/presupuestos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_usuario: usuario.ID_USUARIO,
                    nombre_descriptivo: nombre,
                    anio_inicio: anioInicio,
                    mes_inicio: mesInicio,
                    anio_fin: anioFin,
                    mes_fin: mesFin,
                    total_ingresos: parseFloat(ingresos),
                    total_gastos: parseFloat(gastos),
                    total_ahorro: parseFloat(ahorro),
                    creado_por: usuario.ID_USUARIO
                })
            });
            if (res.ok) {
                setNombre(''); setIngresos(''); setGastos(''); setAhorro('');
                cargarPresupuestos();
            }
        } catch (error) { console.error(error); }
    };

    return (
        <div style={{ background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h2 style={{ color: '#2c3e50', marginTop: 0 }}>Gestión de Presupuestos</h2>
            
            <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
                <div style={{ flex: '1', minWidth: '350px' }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <input type="text" placeholder="Nombre (Ej: Trimestre 3)" value={nombre} onChange={(e) => setNombre(e.target.value)} required style={{ padding: '10px' }} />
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input type="number" placeholder="Año Inicio" value={anioInicio} onChange={(e) => setAnioInicio(parseInt(e.target.value))} required style={{ padding: '10px', width: '50%' }} />
                            <input type="number" placeholder="Mes Inicio" value={mesInicio} onChange={(e) => setMesInicio(parseInt(e.target.value))} required min="1" max="12" style={{ padding: '10px', width: '50%' }} />
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input type="number" placeholder="Año Fin" value={anioFin} onChange={(e) => setAnioFin(parseInt(e.target.value))} required style={{ padding: '10px', width: '50%' }} />
                            <input type="number" placeholder="Mes Fin" value={mesFin} onChange={(e) => setMesFin(parseInt(e.target.value))} required min="1" max="12" style={{ padding: '10px', width: '50%' }} />
                        </div>
                        <input type="number" placeholder="Total Ingresos (L.)" value={ingresos} onChange={(e) => setIngresos(e.target.value)} required style={{ padding: '10px' }} />
                        <input type="number" placeholder="Total Gastos (L.)" value={gastos} onChange={(e) => setGastos(e.target.value)} required style={{ padding: '10px' }} />
                        <input type="number" placeholder="Total Ahorro (L.)" value={ahorro} onChange={(e) => setAhorro(e.target.value)} required style={{ padding: '10px' }} />
                        <button type="submit" style={{ background: '#0056b3', color: 'white', border: 'none', padding: '12px', cursor: 'pointer' }}>Crear Presupuesto</button>
                    </form>
                </div>

                <div style={{ flex: '2', minWidth: '400px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#e9ecef' }}>
                                <th style={{ padding: '10px' }}>ID</th>
                                <th style={{ padding: '10px' }}>Nombre</th>
                                <th style={{ padding: '10px' }}>Vigencia</th>
                                <th style={{ padding: '10px' }}>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {presupuestos.map((p) => (
                                <tr key={p.ID_PRESUPUESTO} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '10px' }}>{p.ID_PRESUPUESTO}</td>
                                    <td style={{ padding: '10px' }}>{p.NOMBRE_DESCRIPTIVO}</td>
                                    <td style={{ padding: '10px' }}>{p.ANIO_INICIO}/{p.MES_INICIO} - {p.ANIO_FIN}/{p.MES_FIN}</td>
                                    <td style={{ padding: '10px' }}>
                                        <span style={{ background: p.ESTADO === 'activo' ? '#d4edda' : '#f8d7da', padding: '4px 8px', borderRadius: '10px', fontSize: '12px' }}>
                                            {p.ESTADO}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}