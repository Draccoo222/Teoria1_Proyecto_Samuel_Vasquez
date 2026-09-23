import express from 'express';
import * as ibmdb from 'ibm_db';

const app = express();
const port = 3000;

const connStr = "DATABASE=teoriadb;HOSTNAME=localhost;UID=db2inst1;PWD=TeoriaDB2026.;PORT=50000;PROTOCOL=TCPIP";


// USUARIOS

app.get('/api/usuarios', async (req, res) => {
    try {
        const conn = await ibmdb.open(connStr);
        const data = await conn.query("CALL sp_listar_usuarios()");
        await conn.close();
        res.status(200).json(data);
    } catch (e: any) {res.status(500).json({ error: e.message });
    }
});

app.get('/api/usuarios/:id', async(req, res) => {
    try {
        const conn = await ibmdb.open(connStr);
        const data = await conn.query('CALL sp_consultar_usuario(${req.params.id})');
        await conn.close();
        res.status(200).json(data);
    } catch (e: any) {res.status(500).json({ error: e.message });
    }
});

app.post('/api/usuarios', async (req, res) => {
    const { nombres, apellidos, correo_electronico, salario_mensual_base, creado_por } = req.body;
    try {
        const conn = await ibmdb.open(connStr);
        const query = `CALL sp_insertar_usuario('${nombres}', '${apellidos}', '${correo_electronico}', ${salario_mensual_base}, ${creado_por}, ?)`;
        const result = await conn.query(query);
        await conn.close();
        res.status(201).json({ mensaje: "Usuario creado", id: result[0] });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.put('/api/usuarios/:id', async (req, res) => {
    const { nombres, apellidos, correo_electronico, salario_mensual_base, modificado_por } = req.body;
    try {
        const conn = await ibmdb.open(connStr);
        await conn.query(`CALL sp_actualizar_usuario(${req.params.id}, '${nombres}', '${apellidos}', '${correo_electronico}', ${salario_mensual_base}, ${modificado_por})`);
        await conn.close();
        res.status(200).json({ mensaje: "Usuario actualizado" });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/usuarios/:id', async (req, res) => {
    const { modificado_por } = req.body;
    try {
        const conn = await ibmdb.open(connStr);
        await conn.query(`CALL sp_eliminar_usuario(${req.params.id}, ${modificado_por})`);
        await conn.close();
        res.status(200).json({ mensaje: "Usuario inactivado" });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// CATEGORIAS

