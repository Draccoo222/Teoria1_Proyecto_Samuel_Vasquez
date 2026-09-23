import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import Login from './login';
import Categorias from './Categorias'; // Importamos tu nueva pantalla
import Transacciones from './Transacciones';
import Subcategorias from './Subcategorias';
import Presupuestos from './Presupuestos';
import Detalles from './Detalles';
import Obligaciones from './Obligaciones';
import Dashboard from './Dashboard';
import Usuarios from './Usuarios';

const COLORES = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ffc658'];

function App() {
  const [usuario, setUsuario] = useState<any>(null);
  const [vistaActual, setVistaActual] = useState<'dashboard' |'usuarios'| 'categorias' | 'subcategorias' | 'presupuestos' | 'detalles' | 'obligaciones' |'transacciones'>('dashboard');
  
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
        <div style={{ fontFamily: 'Arial, sans-serif', background: '#e9ecef', minHeight: '100vh', padding: '20px' }}>
            
            {/* =========================================================================
                BARRA DE NAVEGACIÓN SUPERIOR (LA CAJA OSCURA)
               ========================================================================= */}
            <div style={{ background: '#212529', color: 'white', padding: '20px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                
                {/* 1. Información del Usuario (IZQUIERDA) */}
                <div>
                    <h3 style={{ margin: 0, fontSize: '14px', color: '#ccc' }}>Usuario:</h3>
                    <p style={{ margin: '5px 0' }}>{usuario.PRIMER_NOMBRE} {usuario.PRIMER_APELLIDO}</p>
                    <span style={{ background: usuario.ROL === 'ADMIN' ? '#dc3545' : '#28a745', padding: '3px 8px', borderRadius: '4px', fontSize: '12px' }}>
                        Rol: {usuario.ROL}
                    </span>
                </div>

                {/* 2. AQUÍ PEGAS EL NUEVO CÓDIGO DE LOS BOTONES (CENTRO) */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    
                    {/* 🟢 BOTONES PARA TODOS (Administrador y Usuario Normal) */}
                    <button onClick={() => setVistaActual('dashboard')} style={{ background: vistaActual === 'dashboard' ? '#007bff' : '#495057', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '6px', cursor: 'pointer' }}>Dashboard</button>
                    <button onClick={() => setVistaActual('presupuestos')} style={{ background: vistaActual === 'presupuestos' ? '#007bff' : '#495057', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '6px', cursor: 'pointer' }}>Presupuestos</button>
                    <button onClick={() => setVistaActual('detalles')} style={{ background: vistaActual === 'detalles' ? '#007bff' : '#495057', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '6px', cursor: 'pointer' }}>Detalles Pres.</button>
                    <button onClick={() => setVistaActual('obligaciones')} style={{ background: vistaActual === 'obligaciones' ? '#007bff' : '#495057', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '6px', cursor: 'pointer' }}>Obligaciones</button>
                    <button onClick={() => setVistaActual('transacciones')} style={{ background: vistaActual === 'transacciones' ? '#007bff' : '#495057', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '6px', cursor: 'pointer' }}>Transacciones</button>

                    {/* 🔴 BOTONES EXCLUSIVOS DEL ADMINISTRADOR (Catálogos Globales) */}
                      {usuario.ROL === 'ADMIN' && (
                          <>
                              <div style={{ borderLeft: '2px solid #555', margin: '0 5px' }}></div>
                              <button onClick={() => setVistaActual('usuarios')} style={{ background: vistaActual === 'usuarios' ? '#007bff' : '#343a40', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '6px', cursor: 'pointer' }}>Usuarios</button>
                              <button onClick={() => setVistaActual('categorias')} style={{ background: vistaActual === 'categorias' ? '#007bff' : '#343a40', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '6px', cursor: 'pointer' }}>Categorías</button>
                              <button onClick={() => setVistaActual('subcategorias')} style={{ background: vistaActual === 'subcategorias' ? '#007bff' : '#343a40', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '6px', cursor: 'pointer' }}>Subcategorías</button>
                          </>
                      )}
                  </div>

                {/* 3. Botón de Salir (DERECHA) */}
                <button onClick={() => {setUsuario(null); setVistaActual('dashboard');}} style={{ background: '#c0392b', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Salir
                </button>
            </div>

            {/* =========================================================================
                RENDERIZADO DE LAS PANTALLAS
               ========================================================================= */}
            <div>
                {vistaActual === 'dashboard' && <Dashboard usuario={usuario} />}
                {vistaActual === 'obligaciones' && <Obligaciones usuario={usuario} />}
                {vistaActual === 'transacciones' && <Transacciones usuario={usuario} />}
                {vistaActual === 'subcategorias' && <Subcategorias usuario={usuario} />}
                {vistaActual === 'categorias' && <Categorias usuario={usuario} />}
                {vistaActual === 'presupuestos' && <Presupuestos usuario={usuario} />}
                {vistaActual === 'detalles' && <Detalles usuario={usuario} />}
                {vistaActual === 'usuarios' && <Usuarios usuarioLogueado={usuario} />}
            </div>

        </div>
    );
}

export default App;