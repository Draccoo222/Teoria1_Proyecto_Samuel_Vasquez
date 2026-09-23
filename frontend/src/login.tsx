import { useState } from 'react';

export default function Login({ onLogin }: { onLogin: (user: any) => void }) {
    const [correo, setCorreo] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        try {
            const res = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ correo })
            });
            const data = await res.json();
            
            if (res.ok) {
                onLogin(data);
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError('Error conectando con la base de datos Db2.');
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#e9ecef', fontFamily: 'system-ui' }}>
            <div style={{ background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 8px 16px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
                <h2 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '10px' }}>Teoría de BD1</h2>
                <p style={{ textAlign: 'center', color: '#6c757d', marginBottom: '30px' }}>Ingresa tus credenciales para continuar</p>
                
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label style={{ fontWeight: '600', fontSize: '14px', color: '#333' }}>Correo Electrónico:</label>
                        <input 
                            type="email" 
                            value={correo} 
                            onChange={(e) => setCorreo(e.target.value)} 
                            required 
                            placeholder="ej: admin@teoriadb.com"
                            style={{ width: '100%', padding: '12px', marginTop: '8px', borderRadius: '6px', border: '1px solid #ced4da', boxSizing: 'border-box' }}
                        />
                    </div>
                    <div>
                        <label style={{ fontWeight: '600', fontSize: '14px', color: '#333' }}>Contraseña:</label>
                        <input 
                            type="password" 
                            required 
                            placeholder="Cualquier contraseña funciona"
                            style={{ width: '100%', padding: '12px', marginTop: '8px', borderRadius: '6px', border: '1px solid #ced4da', boxSizing: 'border-box' }}
                        />
                    </div>
                    {error && <div style={{ background: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '6px', fontSize: '14px' }}>{error}</div>}
                    
                    <button type="submit" style={{ background: '#0056b3', color: 'white', padding: '14px', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', marginTop: '10px' }}>
                        Iniciar Sesión
                    </button>
                </form>
            </div>
        </div>
    );
}