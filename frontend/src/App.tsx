import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import Login from './login';
import Categorias from './Categorias'; // Importamos tu nueva pantalla
import Transacciones from './Transacciones';

const COLORES = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ffc658'];

function App() {
  const [usuario, setUsuario] = useState<any>(null);
  const [vistaActual, setVistaActual] = useState<'dashboard' | 'categorias' | 'transacciones'>('dashboard');
  
  const [presupuesto, setPresupuesto] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [errorRed, setErrorRed] = useState<string | null>(null);

  useEffect(() => {
    if (!usuario) return;

    fetch('http://localhost:3000/api/presupuestos/1/json')
      .then(res => res.json())
      .then(data => {
        setPresupuesto(data);
        setCargando(false);
      })
      .catch(error => {
        setErrorRed(error.toString());
        setCargando(false);
      });
  }, [usuario]);

  // Si no hay usuario, mostramos el Login
  if (!usuario) {
    return <Login onLogin={setUsuario} />;
  }

  // Validaciones de carga para el Dashboard
  if (cargando) return <h2 style={{ textAlign: 'center', marginTop: '50px' }}>Cargando datos desde Db2... 🚀</h2>;
  if (errorRed) return <h2 style={{ textAlign: 'center', color: 'red' }}>Error de red: {errorRed}</h2>;
  
  const datosValidos = presupuesto && presupuesto.detalles && Array.isArray(presupuesto.detalles);
  
  const datosGrafico = datosValidos ? presupuesto.detalles.reduce((acc: any[], detalle: any) => {
    const existente = acc.find((item: any) => item.name === detalle.categoria);
    if (existente) existente.value += parseFloat(detalle.monto_asignado || 0);
    else acc.push({ name: detalle.categoria, value: parseFloat(detalle.monto_asignado || 0) });
    return acc;
  }, []) : [];

  return (
    <div style={{ padding: '30px', fontFamily: 'system-ui', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* BARRA DE NAVEGACIÓN SUPERIOR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#343a40', color: 'white', padding: '15px 25px', borderRadius: '10px', marginBottom: '20px' }}>
        <div>
           <strong>Usuario:</strong> {usuario.NOMBRES} {usuario.APELLIDOS} <br/>
           <span style={{ fontSize: '12px', background: usuario.ROL === 'ADMIN' ? '#dc3545' : '#28a745', padding: '3px 8px', borderRadius: '10px', marginTop: '5px', display: 'inline-block' }}>
             Rol: {usuario.ROL}
           </span>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
            <button 
                onClick={() => setVistaActual('dashboard')}
                style={{ background: vistaActual === 'dashboard' ? '#007bff' : '#6c757d', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '6px', cursor: 'pointer' }}
            >
                Dashboard
            </button>
            
            {usuario.ROL === 'ADMIN' && (
                <button 
                    onClick={() => setVistaActual('categorias')}
                    style={{ background: vistaActual === 'categorias' ? '#007bff' : '#6c757d', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '6px', cursor: 'pointer' }}
                >
                    Categorías
                </button>
            )}

            {/* AQUÍ VA EL BOTÓN NUEVO */}
            <button 
                onClick={() => setVistaActual('transacciones')}
                style={{ background: vistaActual === 'transacciones' ? '#007bff' : '#6c757d', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '6px', cursor: 'pointer' }}
            >
                Transacciones
            </button>

            <button 
                onClick={() => { setUsuario(null); setVistaActual('dashboard'); }} 
                style={{ background: '#dc3545', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '6px', cursor: 'pointer' }}
            >
                Salir
            </button>
        </div>
      </div>

 {/* RENDERIZADO CONDICIONAL DE PANTALLAS */}
      
      {vistaActual === 'dashboard' && (
          <>
            <h1 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '40px' }}>📊 Dashboard Analítico</h1>
            
            {!datosValidos ? (
                <h2 style={{ textAlign: 'center', color: 'red' }}>⚠️ Error en la estructura del JSON del presupuesto.</h2>
            ) : (
                <>
                    {/* ... (Deja aquí adentro TODO tu código de las tarjetas y el PieChart) ... */}
                </>
            )}
          </>
      )}

      {vistaActual === 'categorias' && <Categorias usuario={usuario} />}
      
      {/* AQUÍ CARGA LA NUEVA PANTALLA */}
      {vistaActual === 'transacciones' && <Transacciones usuario={usuario} />}

    </div>
  );
}

export default App;