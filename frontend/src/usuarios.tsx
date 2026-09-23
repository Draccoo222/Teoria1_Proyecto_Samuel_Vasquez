import { useState, useEffect } from 'react';

export default function Usuarios({ usuarioLogueado }: { usuarioLogueado: any }) {
    const [usuarios, setUsuarios] = useState<any[]>([]);
    
    // 4 Estados atómicos
    const [primerNombre, setPrimerNombre] = useState('');
    const [segundoNombre, setSegundoNombre] = useState('');
    const [primerApellido, setPrimerApellido] = useState('');
    const [segundoApellido, setSegundoApellido] = useState('');
    
    const [correo, setCorreo] = useState('');
    const [salario, setSalario] = useState('');

    const cargarUsuarios = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/usuarios');
            const data = await res.json();
            setUsuarios(data);
        } catch (error) { console.error(error); }
    };

    useEffect(() => { cargarUsuarios(); }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:3000/api/usuarios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    primer_nombre: primerNombre,
                    segundo_nombre: segundoNombre,
                    primer_apellido: primerApellido,
                    segundo_apellido: segundoApellido,
                    correo_electronico: correo,
                    salario_mensual_base: parseFloat(salario),
                    creado_por: usuarioLogueado.ID_USUARIO
                })
            });

            if (res.ok) {
                setPrimerNombre(''); setSegundoNombre(''); setPrimerApellido(''); setSegundoApellido('');
                setCorreo(''); setSalario('');
                cargarUsuarios();
                alert("✅ Usuario creado exitosamente.");
            } else {
                const data = await res.json();
                alert(`❌ Error al crear usuario: ${data.error}`);
            }
        } catch (error) { console.error(error); }
    };

    // Función auxiliar para mostrar el nombre limpio en la tabla sin espacios extra
    const formatearNombre = (u: any) => {
        return `${u.PRIMER_NOMBRE} ${u.SEGUNDO_NOMBRE || ''} ${u.PRIMER_APELLIDO} ${u.SEGUNDO_APELLIDO || ''}`.replace(/\s+/g, ' ').trim();
    };

    return (
        <div style={{ background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h2 style={{ color: '#2c3e50', marginTop: 0 }}>👥 Gestión de Usuarios (Panel Admin)</h2>

            <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
                <div style={{ flex: '1', minWidth: '300px' }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', background: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
                        <h4 style={{ margin: 0, color: '#333' }}>Registrar Nuevo Usuario</h4>
                        
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input type="text" placeholder="1er Nombre" value={primerNombre} onChange={(e) => setPrimerNombre(e.target.value)} required style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
                            <input type="text" placeholder="2do Nombre (Opcional)" value={segundoNombre} onChange={(e) => setSegundoNombre(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input type="text" placeholder="1er Apellido" value={primerApellido} onChange={(e) => setPrimerApellido(e.target.value)} required style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
                            <input type="text" placeholder="2do Apellido (Opcional)" value={segundoApellido} onChange={(e) => setSegundoApellido(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
                        </div>

                        <input type="email" placeholder="Correo Electrónico (Ej: user@mail.com)" value={correo} onChange={(e) => setCorreo(e.target.value)} required style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
                        <input type="number" step="0.01" placeholder="Salario Base Mensual (L.)" value={salario} onChange={(e) => setSalario(e.target.value)} required style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
                        
                        <button type="submit" style={{ background: '#28a745', color: 'white', border: 'none', padding: '12px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>Crear Usuario</button>
                    </form>
                </div>

                <div style={{ flex: '2', minWidth: '400px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#343a40', color: 'white' }}>
                                <th style={{ padding: '10px', textAlign: 'left' }}>ID</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Nombre Completo</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Correo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usuarios.map((u) => (
                                <tr key={u.ID_USUARIO} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '10px' }}>{u.ID_USUARIO}</td>
                                    <td style={{ padding: '10px' }}><strong>{formatearNombre(u)}</strong></td>
                                    <td style={{ padding: '10px' }}>{u.CORREO_ELECTRONICO}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}