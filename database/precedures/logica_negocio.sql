CREATE PROCEDURE sp_calcular_monto_ejecutado_mes(IN p_id_subcategoria integer,
	IN p_id_presupuesto integer, IN p_anio integer, p_mes integer,
	OUT p_monto_ejecutado decimal(12,2)
)
LANGUAGE SQL 
BEGIN 
	SET p_monto_ejecutado = fn_calcular_monto_ejecutado(p_id_subcategoria, p_anio, p_mes);
END;

CREATE PROCEDURE sp_calcular_porcentaje_ejecucion_mes(
	IN p_id_subcategoria integer, IN p_id_presupuesto integer, 
	IN p_anio integer, IN p_mes integer,
	OUT p_porcentaje DECIMAL(7,2)
	
)
LANGUAGE SQL 
BEGIN 
	SET p_porcentaje = fn_calcular_porcentaje_ejecutado(p_id_subcategoria, p_id_presupuesto, p_anio, p_mes);
END;


CREATE PROCEDURE sp_calcuar_balance_mensual (
	IN p_id_usuario integer, IN p_id_presupuesto integer, IN p_anio integer,
	IN p_mes integer, OUT p_total_ingresos decimal(12,2), OUT p_total_gasto decimal(12,2),
	OUT p_total_ahorros decimal(12,2), OUT p_balance_final decimal(12,2)
)
LANGUAGE SQL
BEGIN 
	SELECT COALESCE(sum(CASE WHEN tipo_transaccion = 'ingreso' THEN monto ELSE 0 end), 0),
		   COALESCE(sum(CASE WHEN tipo_transaccion = 'gasto' THEN monto ELSE 0 END), 0),
		   COALESCE (sum (CASE WHEN tipo_transaccion = 'ahorro' THEN monto ELSE 0 end), 0)
	INTO p_total_ingresos, p_total_gasto, p_total_ahorros
	FROM transaccion
	WHERE id_usuario = p_id_usuario
	 AND id_presupuesto = p_id_presupuesto
	 AND anio = p_anio
	 AND mes = p_mes;

	SET p_balance_final = p_total_ingresos - p_total_gasto - p_total_ahorros;
END;


CREATE PROCEDURE sp_obtener_resumen_categoria_mes(
	IN p_id_categoria integer, IN p_id_presupuesto integer, 
	IN p_anio integer, IN p_mes integer,
	OUT p_monto_presupuestado DECIMAL(12,2),
	OUT p_monto_ejecutado decimal(12,2),
	OUT p_porcentaje decimal(7,2)
)
LANGUAGE SQL 
BEGIN 
	SET p_monto_presupuestado = fn_obtener_total_categoria_mes(p_id_categoria, p_id_presupuesto, p_anio, p_mes);
	SET p_monto_ejecutado = fn_obtener_total_ejecutado_categoria_mes(p_id_categoria, p_anio, p_mes);

	IF p_monto_presupuestado IS NULL OR p_monto_presupuestado = 0 THEN 
		SET p_porcentaje = NULL; 
	ELSE
		SET p_porcentaje = (p_monto_ejecutado/ p_monto_presupuestado) *100;
	END IF;
END;

CREATE PROCEDURE sp_cerrar_presupuesto(
IN p_id_presupuesto integer, IN p_modificado_por integer)
LANGUAGE SQL 
DYNAMIC RESULT SETS 1
BEGIN 
	DECLARE s_anio_fin, s_mes_fin integer;
	DECLARE s_mes_str varchar(2);
	DECLARE s_primer_dia_fin date;
	DECLARE s_ultimo_dia_fin date;

	DECLARE cur_resumen CURSOR WITH RETURN FOR 
		SELECT s.nombre_subcategoria, pd.monto_mensual,
			coalesce(sum(t.monto), 0) AS monto_ejecutado_total
	FROM presupuesto_detalle pd
	INNER JOIN subcategoria s ON s.id_subcategoria = pd.id_subcategoria
	LEFT JOIN transaccion t ON t.id_presupuesto = pd.id_subcategoria
		AND t.id_presupuesto = pd.id_presupuesto
	WHERE pd.id_presupuesto = p_id_presupuesto
	GROUP BY s.nombre_subcategoria, pd.monto_mensual;
	
	SELECT anio_fin, mes_fin INTO s_anio_fin, s_mes_fin
	FROM presupuesto
	WHERE id_presupuesto = p_id_presupuesto;
	
	SET s_mes_str = CASE WHEN s_mes_fin < 10 THEN '0' || trim(char(s_mes_fin)) 
		ELSE trim(char(s_mes_fin)) 
		END;
	
	SET s_primer_dia_fin = date(trim(char(s_anio_fin)) || '-' || s_mes_str || '-01');
	SET s_ultimo_dia_fin = LAST_DAY(s_primer_dia_fin);
	
	IF CURRENT DATE < s_ultimo_dia_fin THEN 
		SIGNAL SQLSTATE '75008'
			SET MESSAGE_TEXT = 'No se puede cerrar: aun no acaba la vigencia del presupuesto';
	ELSE	
		UPDATE presupuesto 
			SET estado = 'cerrado', modificado_por = p_modificado_por
		WHERE id_presupuesto = p_id_presupuesto;
	
	OPEN cur_resumen;
	
	END IF;
	
END;

CREATE PROCEDURE sp_procesar_obligacion_mes (
IN p_id_usuario integer, IN p_anio integer, 
IN p_mes integer, IN p_id_presupuesto integer)
LANGUAGE SQL 
DYNAMIC RESULT SETS 1
BEGIN 	
	DECLARE cur_alertas CURSOR WITH RETURN FOR
	SELECT o.id_obligacion, o.nombre_obligacion, o.monto_fijo_mensual,
		o.dia_vencimiento,
		fn_dias_hasta_vencimiento(o.id_obligacion) AS dias_restantes,
		CASE 
			WHEN EXISTS(
				SELECT 1 FROM transaccion t
				WHERE t.id_obligacion = o.id_obligacion
				AND t.id_presupuesto = p_id_presupuesto
				AND t.anio = p_anio AND t.mes = p_mes
			) THEN 'pagada'
			WHEN fn_dias_hasta_vencimiento(o.id_obligacion) < 0 THEN 'vencida'
			WHEN fn_dias_hasta_vencimiento(o.id_obligacion) <= 3 THEN 'por_vencer'
			ELSE 'pendiente'
		END AS estado_pago
		FROM obligacion_fija o 
		WHERE o.id_usuario = p_id_usuario
		AND o.esta_vigente = TRUE
		ORDER BY o.dia_vencimiento;

	OPEN cur_alertas;
END;

CREATE PROCEDURE sp_registrar_transaccion_completa(
IN p_id_usuario integer, IN p_id_presupuesto integer,
IN p_anio integer, IN p_mes integer, IN p_id_subcategoria integer, 
IN p_tipo_transaccion varchar(20), IN p_descripcion varchar(255),
IN p_monto decimal(12,2), IN p_fecha_movimiento date, IN p_metodo_pago varchar(50),
IN p_creado_por integer, OUT p_id_transaccion integer, OUT p_advertencia varchar(255)
)
LANGUAGE SQL
BEGIN 
	DECLARE v_vigente_periodo integer;
	DECLARE mes_str varchar(2);

	SET mes_str = CASE WHEN p_mes < 10 THEN '0' || trim(char(p_mes))
		ELSE trim(char(p_mes))
		END;
	
	SET v_vigente_periodo = fn_validar_vigencia_presupuesto(
	DATE(trim(char(p_anio)) || '-' || mes_str || '-01'), p_id_presupuesto
	);
	
	IF v_vigente_periodo = 0 THEN 
		SIGNAL SQLSTATE '75008'
			SET MESSAGE_TEXT = 'El anio/mes de la transaccion esta fuera de la vigencia del presupuesto';
	END IF;
	
	IF YEAR(p_fecha_movimiento) <> p_anio OR MONTH(p_fecha_movimiento) <> p_mes THEN 
		SET p_advertencia = 'La fecha real difiere del anio/mes de imputacion prosupuestal';
	ELSE
		SET p_advertencia = NULL;
	END IF;
	
	CALL sp_insertar_transaccion(
		p_id_usuario, p_id_presupuesto, p_anio, p_mes, p_id_subcategoria, NULL,
		p_tipo_transaccion, p_descripcion, p_monto, p_fecha_movimiento, p_metodo_pago,
		NULL , NULL, p_creado_por, p_id_transaccion
	);
	
END;


