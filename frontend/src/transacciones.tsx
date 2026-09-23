import { useState } from 'react';

export default function Transacciones({ usuario }: { usuario: any }) {
    const [idPresupuesto, setIdPresupuesto] = useState('1'); // Por defecto al presupuesto activo
    const [idSubcategoria, setIdSubcategoria] = useState('');
    const [tipo, setTipo] = useState('gasto');
    const [descripcion, setDescripcion] = useState('');
    const [monto, setMonto] = useState('');
    const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
    const [metodoPago, setMetodoPago] = useState('tarjeta_debito');
    const [mensaje, setMensaje] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMensaje('Procesando...');
        
        // El PDF exige que año y mes se envíen de forma independiente a la fecha
        const fechaObj = new Date(fecha);
        // Se suma 1 al mes porque JavaScript indexa los meses de 0 a 11
        const anio = fechaObj.getFullYear();
        const mes = fechaObj.getMonth() + 1;

        try {
            const res = await fetch('http://localhost:3000/api/transacciones', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_usuario: usuario.ID_USUARIO,
                    id_presupuesto: parseInt(idPresupuesto),
                    anio: anio,
                    mes: mes,
                    id_subcategoria: parseInt(idSubcategoria),
                    tipo: tipo,
                    descripcion: descripcion,
                    monto: parseFloat(monto),
                    fecha: fecha,
                    metodo_pago: metodoPago,
                    creado_por: usuario.ID_USUARIO
                })
            });

            if (res.ok) {
                setMensaje('✅ Transacción registrada en Db2 con éxito.');
                setDescripcion('');
                setMonto('');
                setIdSubcategoria('');
            } else {
                const data = await res.json();
                setMensaje(`❌ Error de base de datos: ${data.error}`);
            }
        } catch (error) {
            setMensaje('❌ Error conectando con el backend.');
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h2 style={{ color: '#2c3e50', marginTop: 0, borderBottom: '2px solid #eee', paddingBottom: '10px' }}>Registrar Nueva Transacción</h2>
            
            {mensaje && (
                <div style={{ padding: '10px', marginBottom: '20px', borderRadius: '5px', background: mensaje.includes('✅') ? '#d4edda' : '#f8d7da', color: mensaje.includes('✅') ? '#155724' : '#721c24' }}>
                    {mensaje}
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>ID Presupuesto:</label>
                        <input type="number" value={idPresupuesto} onChange={(e) => setIdPresupuesto(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>ID Subcategoría:</label>
                        <input type="number" value={idSubcategoria} onChange={(e) => setIdSubcategoria(e.target.value)} required placeholder="Ej: 1, 2, 3..." style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Tipo:</label>
                        <select value={tipo} onChange={(e) => setTipo(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}>
                            <option value="gasto">Gasto</option>
                            <option value="ingreso">Ingreso</option>
                            <option value="ahorro">Ahorro</option>
                        </select>
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Monto (L.):</label>
                        <input type="number" step="0.01" value={monto} onChange={(e) => setMonto(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                    </div>
                </div>

                <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Descripción:</label>
                    <input type="text" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} required placeholder="Ej: Compra supermercado quincena" style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Fecha:</label>
                        <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Método de Pago:</label>
                        <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}>
                            <option value="efectivo">Efectivo</option>
                            <option value="tarjeta_debito">Tarjeta de Débito</option>
                            <option value="tarjeta_credito">Tarjeta de Crédito</option>
                            <option value="transferencia">Transferencia</option>
                        </select>
                    </div>
                </div>

                <button type="submit" style={{ background: '#0056b3', color: 'white', border: 'none', padding: '15px', borderRadius: '5px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', marginTop: '10px' }}>
                    Registrar Movimiento
                </button>
            </form>
        </div>
    );
}