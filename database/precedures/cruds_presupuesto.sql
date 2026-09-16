CREATE PROCEDURE sp_insertar_presupuesto(
	IN p_id_usuario INTEGER,
	IN p_nombre_descriptivo varchar(150),
	IN p_anio_inicio INTEGER,
	IN p_mes_inicio INTEGER,
	IN p_anio_fin INTEGER,
	IN p_mes_fin INTEGER,
	IN p_total_ingresos_planificados DECIMAL(12, 2),
	IN p_total_gastos_planificados DECIMAL(12, 2),
	IN p_total_ahorro_planificado DECIMAL(12, 2),
	IN p_creado_por INTEGER,
	OUT p_id_presupuesto INTEGER
)
LANGUAGE SQL
BEGIN
	INSERT INTO presupuesto(
	id_usuario, nombre_descriptivo,
	anio_inicio, mes_inicio, anio_fin, mes_fin,
	total_ingresos_planificados, total_gastos_planificados,
	total_ahorro_planificado, estado, creado_por
	)
	VALUES (
		p_id_usuario, p_nombre_descriptivo,
		p_anio_inicio, p_mes_inicio, p_anio_fin, p_mes_fin,
		p_total_ingresos_planificados, p_total_gastos_planificados,
		p_total_ahorro_planificado, 'activo', p_creado_por	
	);

	SET p_id_presupuesto = IDENTITY_VAL_LOCAL();
END;


CREATE PROCEDURE sp_actualizar_presupuesto(
	IN p_id_presupuesto INTEGER,
	IN p_nombre_descriptivo varchar(150),
	IN p_anio_inicio INTEGER,
	IN p_mes_inicio INTEGER,
	IN p_anio_fin INTEGER,
	IN p_mes_fin INTEGER,
	IN p_total_ingresos_planificados DECIMAL(12, 2),
	IN p_total_gastos_planificados DECIMAL(12, 2),
	IN p_total_ahorro_planificado DECIMAL(12, 2),
	IN p_modificado_por INTEGER
)
LANGUAGE SQL
BEGIN
	UPDATE presupuesto
	
	SET nombre_descriptivo = p_nombre_descriptivo,
		anio_inicio = anio_inicio, mes_inicio = p_mes_inicio, 
		anio_fin = p_anio_fin, mes_fin = p_mes_fin,
		total_ingresos_planificados = p_total_ingresos_planificados, 
		total_gastos_planificados = p_total_gastos_planificados,
		total_ahorro_planificado = p_total_ahorro_planificado, 
		modificado_por = p_modificado_por
	WHERE id_presupuesto = p_id_presupuesto;
END;


CREATE PROCEDURE sp_eliminar_presupuesto(IN p_id_presupuesto INTEGER)
LANGUAGE SQL
BEGIN
	DECLARE v_transacciones INTEGER;

	SELECT COUNT(*) INTO v_transacciones
	FROM transaccion
	WHERE id_presupuesto = p_id_presupuesto;
	
	IF v_transacciones > 0 THEN
		SIGNAL SQLSTATE '75003' 
			SET MESSAGE_TEXT = 'No se puede eliminar, el presupuesto contiene transacciones activas';
	ELSE
    	DELETE FROM presupuesto_detalle WHERE id_presupuesto = p_id_presupuesto;
		DELETE FROM presupuesto WHERE  id_presupuesto = p_id_presupuesto;
	END IF;
	
END;

CREATE PROCEDURE sp_consultar_presupuesto(IN p_id_presupuesto integer)
LANGUAGE SQL
DYNAMIC RESULT SETS 1
BEGIN
	DECLARE cur_presupuesto CURSOR WITH RETURN FOR
		SELECT id_presupuesto, id_usuario, nombre_descriptivo,
			   anio_inicio, mes_inicio, anio_fin, mes_fin,
			   total_ingresos_planificados, total_gastos_planificados,
		       total_ahorro_planificado, estado, fecha_hora_creacion
		FROM presupuesto
		WHERE id_presupuesto = p_id_presupuesto;
	
	OPEN cur_presupuesto;
END;



CREATE PROCEDURE sp_listar_presupuestos_usuario(
IN p_id_usuario integer, IN p_estado varchar(20)
)
LANGUAGE SQL
DYNAMIC RESULT SETS 1
BEGIN
	DECLARE cur_presupuesto CURSOR WITH RETURN FOR
		SELECT id_presupuesto, nombre_descriptivo,
			   anio_inicio, mes_inicio, anio_fin, mes_fin,
			   total_ingresos_planificados, total_gastos_planificados,
		       total_ahorro_planificado, estado
		FROM presupuesto
		WHERE id_usuario = p_id_usuario
			AND (p_estado IS NULL OR estado = p_estado)
		ORDER BY anio_inicio DESC, mes_inicio DESC;
	
	OPEN cur_presupuesto;
END;



