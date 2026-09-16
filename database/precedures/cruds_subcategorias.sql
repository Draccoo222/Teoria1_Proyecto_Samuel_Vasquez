CREATE PROCEDURE sp_insertar_subcategoria (
	IN p_id_categoria INTEGER,
	IN p_nombre_subcategoria VARCHAR(100),
	IN P_descripcion VARCHAR(255),
	IN p_creado_por INTEGER,
	OUT p_id_subcategoria INTEGER
)
LANGUAGE SQL
BEGIN
	INSERT INTO subcategoria(
		id_categoria, nombre_subcategoria, descripcion, esta_activa,
	    es_por_defecto, creado_por
	)VALUES(
		p_id_categoria, p_nombre_subcategoria, p_descripcion,
		TRUE, FALSE, p_creado_por	
	);
	
	SET p_id_subcategoria = IDENTITY_VAL_LOCAL();
END;


CREATE PROCEDURE sp_actualizar_subcategoria(
    IN p_id_subcategoria INTEGER,
	IN p_nombre_subcategoria VARCHAR(100),
	IN P_descripcion VARCHAR(255),
	IN p_esta_activa BOOLEAN,
	OUT p_modificado_por INTEGER
)
LANGUAGE SQL
BEGIN
	UPDATE subcategoria
	SET nombre_subcategoria = p_nombre_subcategoria,
	descripcion = p_descripcion,
	esta_activa = p_esta_activa,
	modificado_por = p_modificado_por
	WHERE id_subcategoria = p_id_subcategoria;
END;

CREATE PROCEDURE sp_eliminar_subcategoria(IN p_id_subcategoria INTEGER)
LANGUAGE SQL
BEGIN
	DECLARE v_en_detalle Integer;
	DECLARE v_en_transaccion Integer;
	DECLARE v_en_obligacion Integer;

	SELECT count(*) INTO v_en_detalle
	FROM presupuesto_detalle
	WHERE id_subcategoria = p_id_subcategoria;
	
	SELECT count(*) INTO v_en_transaccion
	FROM transaccion
	WHERE id_subcategoria = p_id_subcategoria;
	
	SELECT count(*) INTO v_en_obligacion
	FROM obligacion_fija
	WHERE id_subcategoria = p_id_subcategoria;

	IF v_en_detalle > 0 OR v_en_transaccion > 0 OR v_en_obligacion > 0 THEN
		SIGNAL SQLSTATE '75002' SET MESSAGE_TEXT = 'No se pudo eliminar: la subcategoria se usa en presopuestos, obligaciones o transacciones';
	ELSE
		DELETE FROM subcategoria WHERE id_subcategoria = p_id_subcategoria;
	END IF;
END;



CREATE PROCEDURE sp_consultar_subcategoria(IN p_id_subcategoria INTEGER)
LANGUAGE SQL
DYNAMIC RESULT SETS 1
BEGIN
	DECLARE cur_subcategoria CURSOR WITH RETURN FOR
		SELECT s.id_categoria, s.nombre_subcategoria, s.descripcion, 
			s.esta_activa, s.es_por_defecto,
		    c.id_categoria, c.nombre_categoria, c.tipo_categoria
		FROM categoria c 
		INNER JOIN subcategoria s ON c.id_categoria = s.id_categoria
		WHERE s.id_subcategoria = p_id_subcategoria;

	OPEN cur_subcategoria;
END;




CREATE PROCEDURE sp_listar_subcategorias(IN p_id_categoria VARCHAR(20))
LANGUAGE SQL
DYNAMIC RESULT SETS 1
BEGIN
	DECLARE cur_subcategorias CURSOR WITH RETURN FOR
		SELECT id_subcategoria, nombre_subcategoria, descripcion, 
			esta_activa, es_por_defecto
		FROM subcategoria 
		WHERE id_categoria = p_id_categoria
		ORDER BY es_por_defecto DESC, nombre_subcategoria;

	OPEN cur_subcategorias;
END;


