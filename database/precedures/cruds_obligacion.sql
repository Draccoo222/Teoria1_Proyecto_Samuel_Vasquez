CREATE PROCEDURE sp_insertar_obligacion (
    IN  p_id_usuario         INTEGER,
    IN  p_id_subcategoria    INTEGER,
    IN  p_nombre_obligacion  VARCHAR(150),
    IN  p_descripcion        VARCHAR(255),
    IN  p_monto_fijo_mensual DECIMAL(12,2),
    IN  p_dia_vencimiento    INTEGER,
    IN  p_fecha_inicio       DATE,
    IN  p_fecha_fin          DATE,
    IN  p_creado_por         INTEGER,
    OUT p_id_obligacion      INTEGER
)
LANGUAGE SQL
BEGIN
    DECLARE v_tipo_categoria VARCHAR(20);
 
    SELECT c.tipo_categoria INTO v_tipo_categoria
    FROM subcategoria s
    INNER JOIN categoria c ON c.id_categoria = s.id_categoria
    WHERE s.id_subcategoria = p_id_subcategoria;
 
    IF v_tipo_categoria <> 'gasto' THEN
        SIGNAL SQLSTATE '75004'
            SET MESSAGE_TEXT = 'La subcategoria debe pertenecer a una categoria de tipo gasto';
    ELSE
        INSERT INTO obligacion_fija (
            id_usuario, id_subcategoria, nombre_obligacion, descripcion,
            monto_fijo_mensual, dia_vencimiento, esta_vigente,
            fecha_inicio, fecha_fin, 
            creado_por
        )
        VALUES (
            p_id_usuario, p_id_subcategoria, p_nombre_obligacion, p_descripcion,
            p_monto_fijo_mensual, p_dia_vencimiento, TRUE,
            p_fecha_inicio, p_fecha_fin, 
            p_creado_por
        );
 
        SET p_id_obligacion = IDENTITY_VAL_LOCAL();
    END IF;
END;

CREATE PROCEDURE sp_actualizar_obligacion (
    IN p_id_obligacion       INTEGER,
    IN p_nombre_obligacion   VARCHAR(150),
    IN p_descripcion         VARCHAR(255),
    IN p_monto_fijo_mensual  DECIMAL(12,2),
    IN p_dia_vencimiento     INTEGER,
    IN p_fecha_fin           DATE,
    IN p_modificado_por      INTEGER
)
LANGUAGE SQL
BEGIN
    UPDATE obligacion_fija
    SET nombre_obligacion   = p_nombre_obligacion,
        descripcion         = p_descripcion,
        monto_fijo_mensual  = p_monto_fijo_mensual,
        dia_vencimiento     = p_dia_vencimiento,
        fecha_fin           = p_fecha_fin,
        modificado_por      = p_modificado_por
    WHERE id_obligacion = p_id_obligacion;
END;


CREATE PROCEDURE sp_eliminar_obligacion(
	IN p_id_obligacion INTEGER,
	IN p_modificado_por INTEGER
)
LANGUAGE SQL
BEGIN
	UPDATE obligacion_fija
	SET esta_vigente = FALSE,
	modificado_por = p_modificado_por
	WHERE id_obligacion = p_id_obligacion;
END;

CREATE PROCEDURE sp_consultar_obligacion (IN p_id_obligacion integer)
LANGUAGE SQL 
DYNAMIC RESULT SETS 1
BEGIN
	DECLARE cur_obligacion CURSOR WITH RETURN FOR
		SELECT o.id_obligacion, o.id_usuario, o.nombre_obligacion,
		o.descripcion, o.monto_fijo_mensual, o.dia_vencimiento, o.esta_vigente,
		o.fecha_inicio, o.fecha_fin, s.id_subcategoria, s.nombre_subcategoria,
		c.nombre_categoria
	FROM obligacion_fija o INNER JOIN subcategoria s ON s.id_subcategoria = o.id_subcategoria
		INNER JOIN categoria c ON c.id_categoria = s.id_categoria
		WHERE o.id_obligacion = p_id_obligacion;

	OPEN cur_obligacion;
END;

CREATE PROCEDURE sp_listar_obligaciones_usuario (
IN p_id_usuario Integer,
IN p_esta_vigente Boolean)
LANGUAGE SQL 
DYNAMIC RESULT SETS 1
BEGIN 
	DECLARE cur_obligaciones CURSOR WITH RETURN FOR 
	SELECT id_obligacion, nombre_obligacion, monto_fijo_mensual, 
		dia_vencimiento, esta_vigente, fecha_inicio, fecha_fin
	FROM obligacion_fija
	WHERE id_usuario = p_id_usuario
	AND (p_esta_vigente IS NULL OR esta_vigente = p_esta_vigente)
	ORDER BY dia_vencimiento;
	
	OPEN cur_obligaciones;
END;





	







