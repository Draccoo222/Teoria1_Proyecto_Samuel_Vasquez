import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORES = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ffc658'];

function App() {
  const [presupuesto, setPresupuesto] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [errorRed, setErrorRed] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:3000/api/presupuestos/1/json')
      .then(res => res.json())
      .then(data => {
        console.log("Datos que llegaron del backend:", data); // Lo imprime en la consola F12
        setPresupuesto(data);
        setCargando(false);
      })
      .catch(error => {
        console.error("Error de conexión:", error);
        setErrorRed(error.toString());
        setCargando(false);
      });
  }, []);

  if (cargando) {
    return <h2 style={{ textAlign: 'center', marginTop: '50px' }}>Cargando datos desde Db2... 🚀</h2>;
  }

  if (errorRed) {
    return <h2 style={{ textAlign: 'center', color: 'red' }}>Error de red: {errorRed}</h2>;
  }

  // PROTECCIÓN: Si el backend devolvió algo, pero no tiene el arreglo "detalles"
  if (!presupuesto || !presupuesto.detalles || !Array.isArray(presupuesto.detalles)) {
    return (
      <div style={{ padding: '30px' }}>
        <h2 style={{ color: 'red' }}>⚠️ El JSON llegó, pero tiene una estructura diferente.</h2>
        <p>Esto fue exactamente lo que el servidor envió (cópialo y envíamelo para arreglarlo):</p>
        <pre style={{ background: '#222', color: '#0f0', padding: '20px', borderRadius: '10px' }}>
          {JSON.stringify(presupuesto, null, 2)}
        </pre>
      </div>
    );
  }

  // Si llegamos aquí, los datos son perfectos y podemos graficar
  const datosGrafico = presupuesto.detalles.reduce((acc: any[], detalle: any) => {
    const existente = acc.find(item => item.name === detalle.categoria);
    if (existente) {
      existente.value += parseFloat(detalle.monto_asignado || 0);
    } else {
      acc.push({ name: detalle.categoria, value: parseFloat(detalle.monto_asignado || 0) });
    }
    return acc;
  }, []);

  return (
    <div style={{ padding: '30px', fontFamily: 'system-ui', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '40px' }}>
        📊 Dashboard Analítico - Teoría de Base de Datos
      </h1>
      
      <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '10px', marginBottom: '30px', borderLeft: '5px solid #0056b3' }}>
        <h2 style={{ margin: '0 0 10px 0', color: '#0056b3' }}>{presupuesto.nombre}</h2>
        <div style={{ display: 'flex', gap: '40px', fontSize: '18px' }}>
          <p><strong>Ingresos Planificados:</strong> L. {parseFloat(presupuesto.total_ingresos || 0).toFixed(2)}</p>
          <p><strong>Gastos Planificados:</strong> L. {parseFloat(presupuesto.total_gastos || 0).toFixed(2)}</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '400px', background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h3 style={{ textAlign: 'center' }}>Distribución de Gastos</h3>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <PieChart width={400} height={300}>
              <Pie
                data={datosGrafico}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {datosGrafico.map((_entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORES[index % COLORES.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `L. ${value.toFixed(2)}`} />
              <Legend />
            </PieChart>
          </div>
        </div>

        <div style={{ flex: 1, minWidth: '400px', background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h3>Detalle de Asignaciones</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {presupuesto.detalles.map((det: any, idx: number) => (
              <li key={idx} style={{ padding: '12px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
                <span><strong>{det.categoria}</strong> <br/><small style={{ color: '#666' }}>{det.subcategoria}</small></span>
                <span style={{ fontWeight: 'bold', color: '#dc3545' }}>L. {parseFloat(det.monto_asignado || 0).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;