import express from 'express';
import * as ibmdb from 'ibm_db';

const app = express();
const port = 3000;

const connStr = "DATABASE=teoriadb;HOSTNAME=localhost;UID=db2inst1;PWD=TeoriaDB2026.;PORT=50000;PROTOCOL=TCPIP";

app.get('/api/usuarios', async (req, res) => {
    console.log("Solicitud recibida en /api/usuarios...");
    
    try {
        const conn = await ibmdb.open(connStr);
       
        const data = await conn.query("CALL sp_listar_usuarios()");
        
        await conn.close();
      
        res.status(200).json({
            mensaje: "Usuarios obtenidos exitosamente",
            datos: data
        });
        
    } catch (error) {
        console.error("Error en la BD:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

app.listen(port, () => {
    console.log(` Backend de Presupuesto corriendo en http://localhost:${port}`);
});