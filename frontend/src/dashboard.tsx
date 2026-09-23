import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import html2pdf from 'html2pdf.js';

export default function Dashboard({ usuario }: { usuario: any }) {
    const [presupuestos, setPresupuestos] = useState<any[]>([]);
    const [idPresupuestoSel, setIdPresupuestoSel] = useState<string>('');
    const [datosJSON, setDatosJSON] = useState<any>(null);
    const [alertas, setAlertas] = useState<any[]>([]);

    const COLORES = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8e44ad', '#e74c3c', '#2c3e50'];

    useEffect(() => {
        fetch(`http://localhost:3000/api/presupuestos?id_usuario=${usuario.ID_USUARIO}`)
            .then(res => res.json())
            .then(data => {
                setPresupuestos(data);
                if (data.length > 0) setIdPresupuestoSel(data[0].ID_PRESUPUESTO.toString());
            })
            .catch(err => console.error(err));
    }, [usuario.ID_USUARIO]);

    useEffect(() => {
        if (!idPresupuestoSel) return;
        
        const presupuestoActual = presupuestos.find(p => p.ID_PRESUPUESTO.toString() === idPresupuestoSel);
        
        // 1. Datos financieros
        fetch(`http://localhost:3000/api/presupuestos/${idPresupuestoSel}/json`)
            .then(res => res.json())
            .then(data => setDatosJSON(data))
            .catch(err => console.error(err));
            
        // 2. Alertas
        if(presupuestoActual) {
            fetch(`http://localhost:3000/api/alertas?id_usuario=${usuario.ID_USUARIO}&anio=${presupuestoActual.ANIO_INICIO}&mes=${presupuestoActual.MES_INICIO}&id_presupuesto=${idPresupuestoSel}`)
                .then(res => res.json())
                .then(data => setAlertas(data))
                .catch(err => console.error(err));
        }
    }, [idPresupuestoSel, presupuestos, usuario.ID_USUARIO]);

    const generarPDF = () => {
        const elemento = document.getElementById('reporte-pdf');
        const opciones = {
            margin:       10,
            filename:     `Reporte_Presupuestal_${idPresupuestoSel}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' }
        };
        // @ts-ignore
        html2pdf().set(opciones).from(elemento).save();
    };

    if (!datosJSON) {
        return <div style={{ padding: '40px', textAlign: 'center' }}><h3>Cargando datos analíticos...</h3></div>;
    }

    const datosPastel = datosJSON.detalles ? datosJSON.detalles.reduce((acc: any[], curr: any) => {
        const existente = acc.find((item: any) => item.name === curr.categoria);
        if (existente) {
            existente.value += parseFloat(curr.monto_asignado);
        } else {
            acc.push({ name: curr.categoria, value: parseFloat(curr.monto_asignado) });
        }
        return acc;
    }, []) : [];

    const ingresosTotales = parseFloat(datosJSON.total_ingresos || 0);
    const gastosTotales = parseFloat(datosJSON.total_gastos || 0);
    const balance = ingresosTotales - gastosTotales;

    return (
        <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '10px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <h2 style={{ color: '#2c3e50', margin: 0 }}>📊 Dashboard Analítico</h2>
                    <button onClick={generarPDF} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                        📄 Exportar a PDF
                    </button>
                </div>
                <select value={idPresupuestoSel} onChange={(e) => setIdPresupuestoSel(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontWeight: 'bold' }}>
                    {presupuestos.map(p => <option key={p.ID_PRESUPUESTO} value={p.ID_PRESUPUESTO}>Visualizando: {p.NOMBRE_DESCRIPTIVO}</option>)}
                </select>
            </div>

            {/* Todo lo que está dentro de este div saldrá en el PDF */}
            <div id="reporte-pdf" style={{ padding: '10px', background: '#f8f9fa' }}>
                
                {/* 1. KPIs */}
                <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, background: 'white', padding: '20px', borderRadius: '10px', borderLeft: '5px solid #28a745' }}>
                        <p style={{ margin: 0, color: '#666', fontWeight: 'bold' }}>Ingresos Planificados</p>
                        <h2 style={{ margin: '10px 0 0 0', color: '#28a745' }}>L. {ingresosTotales.toFixed(2)}</h2>
                    </div>
                    <div style={{ flex: 1, background: 'white', padding: '20px', borderRadius: '10px', borderLeft: '5px solid #dc3545' }}>
                        <p style={{ margin: 0, color: '#666', fontWeight: 'bold' }}>Gastos Planificados</p>
                        <h2 style={{ margin: '10px 0 0 0', color: '#dc3545' }}>L. {gastosTotales.toFixed(2)}</h2>
                    </div>
                    <div style={{ flex: 1, background: 'white', padding: '20px', borderRadius: '10px', borderLeft: `5px solid ${balance >= 0 ? '#007bff' : '#e74c3c'}` }}>
                        <p style={{ margin: 0, color: '#666', fontWeight: 'bold' }}>Balance Proyectado</p>
                        <h2 style={{ margin: '10px 0 0 0', color: balance >= 0 ? '#007bff' : '#e74c3c' }}>L. {balance.toFixed(2)}</h2>
                    </div>
                </div>

                {/* 2. Fila de Gráficos (Pastel + Barras) */}
                <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
                    {/* Gráfico de Pastel */}
                    <div style={{ flex: 1, minWidth: '400px', background: 'white', padding: '20px', borderRadius: '10px' }}>
                        <h3 style={{ textAlign: 'center', color: '#333' }}>Distribución por Categoría</h3>
                        {datosPastel.length === 0 ? (
                            <p style={{ textAlign: 'center', color: '#999', marginTop: '50px' }}>No hay detalles asignados.</p>
                        ) : (
                            <div style={{ width: '100%', height: 250 }}>
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie data={datosPastel} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value" label>
                                            {datosPastel.map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={COLORES[index % COLORES.length]} />)}
                                        </Pie>
                                        <Tooltip formatter={(value: number) => `L. ${value.toFixed(2)}`} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>

                    {/* Gráfico Comparativo */}
                    <div style={{ flex: 1, minWidth: '400px', background: 'white', padding: '20px', borderRadius: '10px' }}>
                        <h3 style={{ textAlign: 'center', color: '#333' }}>Ejecución vs Presupuesto</h3>
                        {datosJSON.detalles ? (
                            <div style={{ width: '100%', height: 250 }}>
                                <ResponsiveContainer>
                                    <BarChart data={datosJSON.detalles} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="subcategoria" tick={{fontSize: 12}} />
                                        <YAxis />
                                        <Tooltip formatter={(value: number) => `L. ${value.toFixed(2)}`} />
                                        <Legend />
                                        <Bar dataKey="monto_asignado" name="Planificado" fill="#0088FE" />
                                        <Bar dataKey="monto_ejecutado" name="Gasto Real" fill="#e74c3c" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <p style={{ textAlign: 'center', color: '#999', marginTop: '50px' }}>Sin datos comparativos.</p>
                        )}
                    </div>
                </div>

                {/* 3. Fila de Tablas y Alertas */}
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                    {/* Tabla */}
                    <div style={{ flex: 1, minWidth: '400px', background: 'white', padding: '20px', borderRadius: '10px', maxHeight: '350px', overflowY: 'auto' }}>
                        <h3 style={{ textAlign: 'center', color: '#333' }}>Desglose de Asignaciones</h3>
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
                            <thead>
                                <tr style={{ background: '#f4f6f8' }}>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Subcategoría</th>
                                    <th style={{ padding: '10px', textAlign: 'right' }}>Monto</th>
                                </tr>
                            </thead>
                            <tbody>
                                {datosJSON.detalles ? datosJSON.detalles.map((d: any, i: number) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '10px' }}>{d.subcategoria}</td>
                                        <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>L. {parseFloat(d.monto_asignado).toFixed(2)}</td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={2} style={{ textAlign: 'center', padding: '20px' }}>Sin datos</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Alertas */}
                    <div style={{ flex: 1, minWidth: '400px', background: 'white', padding: '20px', borderRadius: '10px', maxHeight: '350px', overflowY: 'auto' }}>
                        <h3 style={{ textAlign: 'center', color: '#333' }}>🔔 Alertas de Obligaciones</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
                            {alertas.length === 0 ? (
                                <p style={{ textAlign: 'center', color: '#999' }}>Sin obligaciones para este periodo.</p>
                            ) : (
                                alertas.map((alerta, i) => {
                                    let colorFondo = '#f8f9fa'; let colorTexto = '#333'; let icono = '⚪';
                                    if(alerta.ESTADO_PAGO === 'vencida') { colorFondo = '#f8d7da'; colorTexto = '#721c24'; icono = '❌'; }
                                    if(alerta.ESTADO_PAGO === 'por_vencer') { colorFondo = '#fff3cd'; colorTexto = '#856404'; icono = '⚠️'; }
                                    if(alerta.ESTADO_PAGO === 'pagada') { colorFondo = '#d4edda'; colorTexto = '#155724'; icono = '✅'; }

                                    return (
                                        <div key={i} style={{ padding: '12px', borderRadius: '8px', background: colorFondo, color: colorTexto, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <strong>{icono} {alerta.NOMBRE_OBLIGACION}</strong>
                                                <div style={{ fontSize: '12px', marginTop: '4px' }}>Día {alerta.DIA_VENCIMIENTO} - L. {parseFloat(alerta.MONTO_FIJO_MENSUAL).toFixed(2)}</div>
                                            </div>
                                            <div style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                                                {alerta.ESTADO_PAGO.replace('_', ' ')}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}