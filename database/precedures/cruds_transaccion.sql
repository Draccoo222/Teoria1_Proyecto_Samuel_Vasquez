CREATE PROCEDURE sp_insertar_transaccion (
    IN  p_id_usuario        INTEGER,
    IN  p_id_presupuesto    INTEGER,
    IN  p_anio              INTEGER,
    IN  p_mes                INTEGER,
    IN  p_id_subcategoria   INTEGER,
    IN  p_id_obligacion     INTEGER,
    IN  p_tipo_transaccion  VARCHAR(20),
    IN  p_descripcion       VARCHAR(255),
    IN  p_monto             DECIMAL(12,2),
    IN  p_fecha_movimiento  DATE,
    IN  p_metodo_pago       VARCHAR(50),
    IN  p_numero_factura    VARCHAR(100),
    IN  p_observaciones     VARCHAR(255),
    IN  p_creado_por        INTEGER,
    OUT p_id_transaccion    INTEGER
)
LANGUAGE SQL
BEGIN
    DECLARE v_tipo_categoria      VARCHAR(20);
    DECLARE v_subcategoria_oblig  INTEGER;

	SELECT c.tipo_categoria INTO v_tipo_categoria
	FROM subcategoria s
	INNER JOIN categoria c ON c.id_categoria = s.id_categoria
	WHERE s.id_subcategoria = p_id_subcategoria;
	
	IF v_tipo_categoria <> p_tipo_transaccion THEN 
		SIGNAL SQLSTATE '75005'
			SET MESSAGE_TEXT = 'El tipo de transaccion no coincide con nel tipo de la categoria de la subcategoria';
	END IF;
	
	
	IF p_id_obligacion IS NOT NULL THEN 
		SELECT id_subcategoria INTO v_subcategoria_oblig
		FROM obligacion_fija
		WHERE id_obligacion = p_id_obligacion;
	
		IF v_subcategoria_oblig <> p_id_subcategoria THEN
			SIGNAL SQLSTATE '75006'
				SET MESSAGE_TEXT = 'La subcategoria de la transaccionn debe coincidir con la de la obligacion vinculada';
		END IF;
	END IF;
		
	    INSERT INTO transaccion (
        id_usuario, id_presupuesto, anio, mes, id_subcategoria, id_obligacion,
        tipo_transaccion, descripcion, monto, fecha_movimiento,
        metodo_pago, numero_factura, observaciones, creado_por
    )
    VALUES (p_id_usuario, p_id_presupuesto, p_anio, p_mes, p_id_subcategoria, p_id_obligacion,
        p_tipo_transaccion, p_descripcion, p_monto, p_fecha_movimiento,
        p_metodo_pago, p_numero_factura, p_observaciones, p_creado_por
    );
 
    SET p_id_transaccion = IDENTITY_VAL_LOCAL();
END;

CREATE PROCEDURE sp_actualizar_transaccion (
    IN p_id_transaccion    INTEGER,
    IN p_descripcion       VARCHAR(255),
    IN p_monto             DECIMAL(12,2),
    IN p_fecha_movimiento  DATE,
    IN p_metodo_pago       VARCHAR(50),
    IN p_numero_factura    VARCHAR(100),
    IN p_observaciones     VARCHAR(255),
    IN p_modificado_por    INTEGER
)
LANGUAGE SQL
BEGIN
    UPDATE transaccion
    SET descripcion       = p_descripcion, monto = p_monto,
        fecha_movimiento = p_fecha_movimiento,
        metodo_pago = p_metodo_pago,
        numero_factura = p_numero_factura,
        observaciones = p_observaciones, modificado_por = p_modificado_por
    WHERE id_transaccion = p_id_transaccion;
END;

CREATE PROCEDURE sp_eliminar_transaccion (
IN p_id_transaccion integer, 
OUT p_era_ahorro varchar(20)
)
LANGUAGE SQL 
BEGIN
	SELECT tipo_transaccion INTO p_era_ahorro
	FROM transaccion
	WHERE id_transaccion = p_id_transaccion;

	DELETE FROM transaccion WHERE id_transaccion = p_id_transaccion;
END;

CREATE PROCEDURE sp_calcular_transaccion (
IN p_id_transaccion integer)
LANGUAGE SQL
DYNAMIC RESULT SETS 1
BEGIN 
	DECLARE cur_transaccion CURSOR WITH RETURN FOR
	SELECT t.id_transaccion, t.id_usuario, t.id_presupuesto,
	t.anio, t.mes, t.tipo_transaccion, t.descripcion, t.monto,
	t.fecha_movimiento, t.metodo_pago, t.numero_factura, t.observaciones, t.id_obligacion,
	s.id_subcategoria, s.nombre_subcategoria, c.nombre_categoria
	FROM transaccion t
	INNER JOIN subcategoria s ON s.id_subcategoria = t.id_subcategoria
	INNER JOIN categoria c ON c.id_categoria = s.id_categoria
	WHERE t.id_transaccion = p_id_transaccion;
	
	OPEN cur_transaccion;
END;


CREATE PROCEDURE sp_listar_transacciones_presupuesto(
	IN p_id_presupuesto integer, IN p_tipo_transaccion varchar(20),
	IN p_id_subcategoria integer
)
LANGUAGE SQL
DYNAMIC RESULT SETS 1
BEGIN
	DECLARE cur_transacciones CURSOR WITH RETURN FOR
	SELECT t.id_transaccion, t.anio, t.mes, t.tipo_transaccion, 
	t.descripcion, t.monto, t.fecha_movimiento, t.metodo_pago, s.nombre_subcategoria,
	c.nombre_categoria
	FROM transaccion t
	INNER JOIN subcategoria s ON s.id_subcategoria = t.id_subcategoria
	INNER JOIN categoria c ON c.id_categoria  = s.id_categoria
	WHERE t.id_presupuesto = p_id_presupuesto
		AND (p_tipo_transaccion IS NULL OR t.tipo_transaccion = p_tipo_transaccion)
		AND (p_id_subcategoria IS NULL OR t.id_subcategoria = p_id_subcategoria)
		ORDER BY t.fecha_movimiento DESC;

	OPEN cur_transacciones;
END;



