CREATE PROCEDURE sp_insertar_usuario (
	IN p_nombres VARCHAR(100),
	IN P_apellidos VARCHAR(100),
	IN p_correo_electronico VARCHAR(150),
	IN p_salario_mensual_base DECIMAL(12,2),
	IN p_creado_por INTEGER,
	OUT p_id_usuario INTEGER
)
LANGUAGE SQL
BEGIN
	INSERT INTO usuario(
		nombres, apellidos, correo_electronico, fecha_registro,
		salario_mensual_base, estado, creado_por
	)VALUES(
		p_nombres, p_apellidos, p_correo_electronico, CURRENT DATE,
		p_salario_mensual_base, 'activo', p_creado_por	
	);
	
	SET p_id_usuario = IDENTITY_VAL_LOCAL();
	
END;


CREATE PROCEDURE sp_actualizar_usuario (
	IN p_id_usuario INTEGER,
	IN p_nombres VARCHAR(100),
	IN P_apellidos VARCHAR(100),
	IN p_correo_electronico VARCHAR(150),
	IN p_salario_mensual_base DECIMAL(12,2),
	IN p_modificado_por INTEGER
)
LANGUAGE SQL
BEGIN
	UPDATE usuario
	SET nombres = p_nombres, apellidos = p_apellidos,
		correo_electronico = p_correo_electronico, 
		salario_mensual_base = p_salario_mensual_base,
		modificado_por = p_modificado_por
	WHERE id_usuario = p_id_usuario;
END;

CREATE PROCEDURE sp_eliminar_usuario(IN p_id_usuario INTEGER,
IN p_modificado_por INTEGER)
LANGUAGE SQL
BEGIN
	UPDATE usuario
	SET estado = 'inactivo',
		modificado_por = p_modificado_por
	WHERE id_usuario = p_id_usuario;
END;


CREATE PROCEDURE sp_consultar_usuario(IN p_id_usuario INTEGER)
LANGUAGE SQL
DYNAMIC RESULT SETS 1
BEGIN
	DECLARE cur_usuario CURSOR WITH RETURN FOR
		SELECT id_usuario, nombres, apellidos, correo_electronico,
			fecha_registro, salario_mensual_base, estado,
			creado_en, modificado_en
		FROM usuario 
		WHERE id_usuario = p_id_usuario;

	OPEN cur_usuario;
END;


CREATE PROCEDURE sp_listar_usuarios()
LANGUAGE SQL
DYNAMIC RESULT SETS 1
BEGIN
	DECLARE cur_usuarios CURSOR WITH RETURN FOR
		SELECT id_usuario, nombres, apellidos, correo_electronico,
			fecha_registro, salario_mensual_base, estado
		FROM usuario
		ORDER BY apellidos, nombres;

	OPEN cur_usuarios;
END;






