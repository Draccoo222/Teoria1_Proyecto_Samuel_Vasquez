CREATE PROCEDURE sp_insertar_presupuesto_detalle (
	IN p_id_presupuesto INTEGER,
	IN p_id_subcategoria INTEGER,
	IN p_monto_mensual DECIMAL(12,2),
	IN p_observaciones VARCHAR(255),
	IN p_creado_por Integer,
	OUT p_id_presupuesto_detalle INTEGER
)
LANGUAGE SQL
BEGIN
	INSERT INTO presupuesto_detalle(
		id_presupuesto, id_subcategoria, monto_mensual, 
		observaciones,creado_por
	)VALUES(
		p_id_presupuesto, p_id_subcategoria, p_monto_mensual,
		p_observaciones, p_creado_por	
	);
	
	SET p_id_presupuesto_detalle = IDENTITY_VAL_LOCAL();
END;

CREATE PROCEDURE sp_actualizar_presupuesto_detalle (
	IN p_id_presupuesto_detalle INTEGER,
	IN p_monto_mensual DECIMAL(12,2),
	IN p_observaciones VARCHAR(255),
	IN p_modificado_por Integer

)
LANGUAGE SQL
BEGIN
	UPDATE presupuesto_detalle
	SET monto_mensual = p_monto_mensual,
		observaciones = p_observaciones, 
		modificado_por = p_modificado_por
	WHERE id_presupuesto_detalle = p_id_presupuesto_detalle;
END;

CREATE PROCEDURE sp_consultar_presupuesto_detalle (
	IN p_id_presupuesto_detalle INTEGER
)
LANGUAGE SQL
DYNAMIC RESULT SETS 1
BEGIN
	DECLARE cur_detalle CURSOR WITH RETURN FOR
	SELECT pd.id_presupuesto_detalle, pd.id_presupuesto,
		   pd.monto_mensual, pd.observaciones, s.id_subcategoria,
		   s.nombre_subcategoria, c.id_categoria, c.nombre_categoria, c.tipo_categoria
	FROM presupuesto_detalle pd
	INNER JOIN subcategoria s ON s.id_subcategoria = pd.id_subcategoria
	INNER JOIN categoria c ON c.id_categoria = s.id_categoria 
	WHERE pd.id_presupuesto_detalle = p_id_presupuesto_detalle;

	OPEN cur_detalle;
END;


CREATE PROCEDURE sp_listar_detalles_presupuesto(IN p_id_presupuesto INTEGER)
LANGUAGE SQL
DYNAMIC RESULT SETS 1
BEGIN
	DECLARE cur_detalles CURSOR WITH RETURN FOR
	SELECT pd.id_presupuesto_detalle, pd.monto_mensual, pd.observaciones, 
	s.id_subcategoria, s.nombre_subcategoria, 
	c.id_categoria, c.nombre_categoria
	FROM presupuesto_detalle pd
	INNER JOIN subcategoria s ON s.id_subcategoria = pd.id_subcategoria
	INNER JOIN categoria c ON c.id_categoria = s.id_categoria 
	WHERE pd.id_presupuesto = p_id_presupuesto
	ORDER BY c.orden_presentacion, s.nombre_subcategoria;

	OPEN cur_detalles;
END;






