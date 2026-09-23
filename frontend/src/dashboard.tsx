import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// Importamos la librería para el PDF
import html2pdf from 'html2pdf.js';

export default function Dashboard({ usuario }: { usuario: any }) {
    const [presupuestos, setPresupuestos] = useState<any[]>([]);
    const [idPresupuestoSel, setIdPresupuestoSel] = useState<string>('');
    const [datosJSON, setDatosJSON] = useState<any>(null);

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
        fetch(`http://localhost:3000/api/presupuestos/${idPresupuestoSel}/json`)
            .then(res => res.json())
            .then(data => setDatosJSON(data))
            .catch(err => console.error(err));
    }, [idPresupuestoSel]);

    // Función que toma el HTML renderizado por React y lo convierte en PDF
    const generarPDF = () => {
        const elemento = document.getElementById('reporte-pdf');
        const opciones = {
            margin:       10,
            filename:     `Reporte_Presupuestal_ID_${idPresupuestoSel}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' }
        };
        // @ts-ignore - Ignoramos el tipado estricto de TS para esta librería
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
            
            {/* Cabecera con el botón de PDF */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <h2 style={{ color: '#2c3e50', margin: 0 }}>📊 Dashboard Analítico</h2>
                    <button 
                        onClick={generarPDF}
                        style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                    >
                        📄 Exportar a PDF
                    </button>
                </div>
                <select 
                    value={idPresupuestoSel} 
                    onChange={(e) => setIdPresupuestoSel(e.target.value)}
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontWeight: 'bold' }}
                >
                    {presupuestos.map(p => (
                        <option key={p.ID_PRESUPUESTO} value={p.ID_PRESUPUESTO}>
                            Visualizando: {p.NOMBRE_DESCRIPTIVO}
                        </option>
                    ))}
                </select>
            </div>

            {/* Este es el contenedor exacto que será convertido a PDF */}
            <div id="reporte-pdf" style={{ padding: '10px', background: '#f8f9fa' }}>
                <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderLeft: '5px solid #28a745' }}>
                        <p style={{ margin: 0, color: '#666', fontWeight: 'bold' }}>Ingresos Planificados</p>
                        <h2 style={{ margin: '10px 0 0 0', color: '#28a745' }}>L. {ingresosTotales.toFixed(2)}</h2>
                    </div>
                    <div style={{ flex: 1, background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderLeft: '5px solid #dc3545' }}>
                        <p style={{ margin: 0, color: '#666', fontWeight: 'bold' }}>Gastos Planificados</p>
                        <h2 style={{ margin: '10px 0 0 0', color: '#dc3545' }}>L. {gastosTotales.toFixed(2)}</h2>
                    </div>
                    <div style={{ flex: 1, background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderLeft: `5px solid ${balance >= 0 ? '#007bff' : '#e74c3c'}` }}>
                        <p style={{ margin: 0, color: '#666', fontWeight: 'bold' }}>Balance Proyectado</p>
                        <h2 style={{ margin: '10px 0 0 0', color: balance >= 0 ? '#007bff' : '#e74c3c' }}>L. {balance.toFixed(2)}</h2>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '400px', background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                        <h3 style={{ textAlign: 'center', color: '#333' }}>Distribución por Categoría</h3>
                        {datosPastel.length === 0 ? (
                            <p style={{ textAlign: 'center', color: '#999', marginTop: '50px' }}>No hay detalles asignados a este presupuesto.</p>
                        ) : (
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie data={datosPastel} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" label>
                                            {datosPastel.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={COLORES[index % COLORES.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value: number) => `L. ${value.toFixed(2)}`} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>

                    <div style={{ flex: 1, minWidth: '400px', background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                        <h3 style={{ textAlign: 'center', color: '#333' }}>Desglose de Asignaciones</h3>
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
                            <thead>
                                <tr style={{ background: '#f4f6f8' }}>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Subcategoría</th>
                                    <th style={{ padding: '10px', textAlign: 'right' }}>Monto Asignado</th>
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
                </div>
            </div>
        </div>
    );
}