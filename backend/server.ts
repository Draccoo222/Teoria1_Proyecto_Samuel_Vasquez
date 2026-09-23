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
app.get('/api/categorias', async (req, res) => {
    const { tipo } = req.query;
    const param = tipo ? `'${tipo}'` : 'NULL';
    try {
        const conn = await ibmdb.open(connStr);
        const data = await conn.query(`CALL sp_listar_categorias(${param})`);
        await conn.close();
        res.status(200).json(data);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.get('/api/categorias/:id', async (req, res) => {
    try {
        const conn = await ibmdb.open(connStr);
        const data = await conn.query(`CALL sp_consultar_categoria(${req.params.id})`);
        await conn.close();
        res.status(200).json(data);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/categorias', async (req, res) => {
    const { nombre_categoria, descripcion, tipo_categoria, nombre_icono, color_hex, orden_presentacion, creado_por } = req.body;
    try {
        const conn = await ibmdb.open(connStr);
        const query = `CALL sp_insertar_categoria('${nombre_categoria}', '${descripcion}', '${tipo_categoria}', '${nombre_icono}', '${color_hex}', ${orden_presentacion}, ${creado_por}, ?)`;
        const result = await conn.query(query);
        await conn.close();
        res.status(201).json({ mensaje: "Categoría creada", id: result[0] });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.put('/api/categorias/:id', async (req, res) => {
    const { nombre_categoria, descripcion, modificado_por } = req.body;
    try {
        const conn = await ibmdb.open(connStr);
        await conn.query(`CALL sp_actualizar_categoria(${req.params.id}, '${nombre_categoria}', '${descripcion}', ${modificado_por})`);
        await conn.close();
        res.status(200).json({ mensaje: "Categoría actualizada" });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/categorias/:id', async (req, res) => {
    try {
        const conn = await ibmdb.open(connStr);
        await conn.query(`CALL sp_eliminar_categoria(${req.params.id})`);
        await conn.close();
        res.status(200).json({ mensaje: "Categoría eliminada" });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});


// SUBCATEGORIAS


app.get('/api/subcategorias', async (req, res) => {
    const { id_categoria } = req.query;
    if(!id_categoria) return res.status(400).json({error: "Se requiere id_categoria en la query string"});
    try {
        const conn = await ibmdb.open(connStr);
        const data = await conn.query(`CALL sp_listar_subcategorias(${id_categoria})`);
        await conn.close();
        res.status(200).json(data);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.get('/api/subcategorias/:id', async (req, res) => {
    try {
        const conn = await ibmdb.open(connStr);
        const data = await conn.query(`CALL sp_consultar_subcategoria(${req.params.id})`);
        await conn.close();
        res.status(200).json(data);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/subcategorias', async (req, res) => {
    const { id_categoria, nombre_subcategoria, descripcion, creado_por } = req.body;
    try {
        const conn = await ibmdb.open(connStr);
        const query = `CALL sp_insertar_subcategoria(${id_categoria}, '${nombre_subcategoria}', '${descripcion}', ${creado_por}, ?)`;
        const result = await conn.query(query);
        await conn.close();
        res.status(201).json({ mensaje: "Subcategoría creada", id: result[0] });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.put('/api/subcategorias/:id', async (req, res) => {
    const { nombre_subcategoria, descripcion, esta_activa } = req.body;
    try {
        const conn = await ibmdb.open(connStr);
        const query = `CALL sp_actualizar_subcategoria(${req.params.id}, '${nombre_subcategoria}', '${descripcion}', ${esta_activa ? 'TRUE' : 'FALSE'}, ?)`;
        const result = await conn.query(query);
        await conn.close();
        res.status(200).json({ mensaje: "Subcategoría actualizada", modificado_por: result[0] });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/subcategorias/:id', async (req, res) => {
    try {
        const conn = await ibmdb.open(connStr);
        await conn.query(`CALL sp_eliminar_subcategoria(${req.params.id})`);
        await conn.close();
        res.status(200).json({ mensaje: "Subcategoría eliminada" });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// PRESUPUESTOS

app.get('/api/presupuestos', async (req, res) => {
    const { id_usuario, estado } = req.query;
    if(!id_usuario) return res.status(400).json({error: "Se requiere id_usuario en la query string"});
    const estadoParam = estado ? `'${estado}'` : 'NULL';
    try {
        const conn = await ibmdb.open(connStr);
        const data = await conn.query(`CALL sp_listar_presupuestos_usuario(${id_usuario}, ${estadoParam})`);
        await conn.close();
        res.status(200).json(data);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.get('/api/presupuestos/:id', async (req, res) => {
    try {
        const conn = await ibmdb.open(connStr);
        const data = await conn.query(`CALL sp_consultar_presupuesto(${req.params.id})`);
        await conn.close();
        res.status(200).json(data);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.get('/api/presupuestos/:id/json', async (req, res) => {
    try {
        const conn = await ibmdb.open(connStr);
        const data = await conn.query(`CALL sp_obtener_presupuesto_json(${req.params.id}, ?)`);
        await conn.close();
        res.status(200).json(JSON.parse(data[0]));
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/presupuestos', async (req, res) => {
    const { id_usuario, nombre_descriptivo, anio_inicio, mes_inicio, anio_fin, mes_fin, total_ingresos, total_gastos, total_ahorro, creado_por } = req.body;
    try {
        const conn = await ibmdb.open(connStr);
        const query = `CALL sp_insertar_presupuesto(${id_usuario}, '${nombre_descriptivo}', ${anio_inicio}, ${mes_inicio}, ${anio_fin}, ${mes_fin}, ${total_ingresos}, ${total_gastos}, ${total_ahorro}, ${creado_por}, ?)`;
        const result = await conn.query(query);
        await conn.close();
        res.status(201).json({ mensaje: "Presupuesto creado", id: result[0] });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.put('/api/presupuestos/:id', async (req, res) => {
    const { nombre_descriptivo, anio_inicio, mes_inicio, anio_fin, mes_fin, total_ingresos, total_gastos, total_ahorro, modificado_por } = req.body;
    try {
        const conn = await ibmdb.open(connStr);
        const query = `CALL sp_actualizar_presupuesto(${req.params.id}, '${nombre_descriptivo}', ${anio_inicio}, ${mes_inicio}, ${anio_fin}, ${mes_fin}, ${total_ingresos}, ${total_gastos}, ${total_ahorro}, ${modificado_por})`;
        await conn.query(query);
        await conn.close();
        res.status(200).json({ mensaje: "Presupuesto actualizado" });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/presupuestos/:id', async (req, res) => {
    try {
        const conn = await ibmdb.open(connStr);
        await conn.query(`CALL sp_eliminar_presupuesto(${req.params.id})`);
        await conn.close();
        res.status(200).json({ mensaje: "Presupuesto eliminado" });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// PRESUPUESTO DETALLE

app.get('/api/presupuestos/:id_presupuesto/detalles', async (req, res) => {
    try {
        const conn = await ibmdb.open(connStr);
        const data = await conn.query(`CALL sp_listar_detalles_presupuesto(${req.params.id_presupuesto})`);
        await conn.close();
        res.status(200).json(data);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.get('/api/detalles/:id', async (req, res) => {
    try {
        const conn = await ibmdb.open(connStr);
        const data = await conn.query(`CALL sp_consultar_presupuesto_detalle(${req.params.id})`);
        await conn.close();
        res.status(200).json(data);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/detalles', async (req, res) => {
    const { id_presupuesto, id_subcategoria, monto_mensual, observaciones, creado_por } = req.body;
    try {
        const conn = await ibmdb.open(connStr);
        const query = `CALL sp_insertar_presupuesto_detalle(${id_presupuesto}, ${id_subcategoria}, ${monto_mensual}, '${observaciones}', ${creado_por}, ?)`;
        const result = await conn.query(query);
        await conn.close();
        res.status(201).json({ mensaje: "Detalle creado", id: result[0] });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.put('/api/detalles/:id', async (req, res) => {
    const { monto_mensual, observaciones, modificado_por } = req.body;
    try {
        const conn = await ibmdb.open(connStr);
        const query = `CALL sp_actualizar_presupuesto_detalle(${req.params.id}, ${monto_mensual}, '${observaciones}', ${modificado_por})`;
        await conn.query(query);
        await conn.close();
        res.status(200).json({ mensaje: "Detalle actualizado" });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});
