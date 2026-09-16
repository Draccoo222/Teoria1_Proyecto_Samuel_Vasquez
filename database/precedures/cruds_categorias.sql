CREATE PROCEDURE sp_insertar_categoria (
	IN p_nombre_categoria VARCHAR(100),
	IN P_descripcion VARCHAR(255),
	IN p_tipo_categoria VARCHAR(20),
	IN p_nombre_icono VARCHAR(50),
	IN p_color_hex VARCHAR(7),
	IN p_orden_presentacion INTEGER,
	IN p_creado_por INTEGER,
	OUT p_id_categoria INTEGER
)
LANGUAGE SQL
BEGIN
	INSERT INTO categoria(
		nombre_categoria, descripcion, tipo_categoria, nombre_icono,
	    color_hex, orden_presentacion, creado_por
	)VALUES(
		p_nombre_categoria, p_descripcion, p_tipo_categoria, p_nombre_icono,
		p_color_hex, p_orden_presentacion, p_creado_por	
	);
	
	SET p_id_categoria = IDENTITY_VAL_LOCAL();
END;

CREATE PROCEDURE sp_actualizar_categoria (
	IN p_id_categoria INTEGER,
	IN p_nombre_categoria VARCHAR(100),
	IN p_descripcion VARCHAR(255),
	IN p_modificado_por INTEGER
)
LANGUAGE SQL
BEGIN
	UPDATE categoria
	SET nombre_categoria = p_nombre_categoria, 
        descripcion = p_descripcion,
		modificado_por = p_modificado_por
	WHERE id_categoria = p_id_categoria;
END;

CREATE PROCEDURE sp_eliminar_categoria(IN p_id_categoria INTEGER)
LANGUAGE SQL
BEGIN
	DECLARE v_subcategorias_adicionales INTEGER;

	SELECT COUNT(*) INTO v_subcategorias_adicionales
	FROM subcategoria
	WHERE id_categoria = p_id_categoria
		AND esta_activa = TRUE 
		AND es_por_defecto = FALSE;
	
	IF v_subcategorias_adicionales > 0 THEN
		SIGNAL SQLSTATE '75001' 
			SET MESSAGE_TEXT = 'No se puede eliminar: la categoria contiene subcategorias adicionales activas';
    ELSE
    	DELETE FROM subcategoria WHERE id_categoria = p_id_categoria;
		DELETE FROM categoria WHERE  id_categoria = p_id_categoria;
	END IF;
	
END;



CREATE PROCEDURE sp_consultar_categoria(IN p_id_categoria INTEGER)
LANGUAGE SQL
DYNAMIC RESULT SETS 1
BEGIN
	DECLARE cur_categoria CURSOR WITH RETURN FOR
		SELECT id_categoria, nombre_categoria, descripcion, tipo_categoria,
			nombre_icono, color_hex, orden_presentacion,
			creado_en, modificado_en
		FROM categoria 
		WHERE id_categoria = p_id_categoria;

	OPEN cur_categoria;
END;




CREATE PROCEDURE sp_listar_categorias(IN p_tipo_categoria VARCHAR(20))
LANGUAGE SQL
DYNAMIC RESULT SETS 1
BEGIN
	DECLARE cur_categorias CURSOR WITH RETURN FOR
		SELECT id_categoria, nombre_categoria, descripcion, tipo_categoria,
			nombre_icono, color_hex, orden_presentacion
		FROM categoria 
		WHERE p_tipo_categoria IS NULL OR tipo_categoria = p_tipo_categoria
		ORDER BY orden_presentacion, nombre_categoria;

	OPEN cur_categorias;
END;



