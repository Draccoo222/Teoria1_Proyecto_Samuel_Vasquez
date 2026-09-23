CREATE FUNCTION fn_calcular_monto_ejecutado(
p_id_subcategoria integer, p_anio integer, p_mes integer)
RETURNS Decimal(12,2)
LANGUAGE SQL
READS SQL DATA
BEGIN
	DECLARE calc_monto decimal(12,2);
	
	SELECT COALESCE(sum(monto), 0) INTO calc_monto
	FROM transaccion
	WHERE id_subcategoria = p_id_subcategoria
	AND anio = p_anio
	AND mes = p_mes;
	
	RETURN calc_monto;
END;


CREATE FUNCTION fn_calcular_porcentaje_ejecutado(
p_id_subcategoria integer, p_id_presupuesto integer, 
p_anio integer, p_mes integer)
RETURNS decimal(7,2)
LANGUAGE SQL
READS SQL DATA
BEGIN
	DECLARE calc_presupuesto decimal(12,2);
	DECLARE calc_ejecutado decimal(12,2);

	SELECT monto_mensual INTO calc_presupuesto
	FROM presupuesto_detalle
	WHERE id_presupuesto = p_id_presupuesto AND
		id_subcategoria = p_id_subcategoria;
	
	SET calc_ejecutado = fn_calcular_monto_ejecutado(p_id_subcategoria, p_anio, p_mes);
	
	IF calc_presupuesto IS NULL OR calc_presupuesto = 0 THEN
		RETURN NULL;
	END IF;
	
	RETURN (calc_ejecutado/calc_presupuesto) * 100;
END;


CREATE FUNCTION fn_obtener_balance_subcategoria(
p_id_presupuesto integer, p_id_subcategoria integer,
p_anio integer, p_mes integer
)
RETURNS decimal(12,2)
LANGUAGE SQL
READS SQL DATA 
BEGIN
	DECLARE calc_presupuesto decimal(12,2);
	DECLARE calc_ejecutado decimal(12,2);
	
	SELECT monto_mensual INTO calc_presupuesto
	FROM presupuesto_detalle
	WHERE id_presupuesto = p_id_presupuesto
		AND id_subcategoria = p_id_subcategoria;
	
	SET calc_ejecutado = fn_calcular_monto_ejecutado(p_id_subcategoria, p_anio, p_mes);
	
	RETURN COALESCE(calc_presupuesto, 0) - calc_ejecutado;
END;

CREATE OR REPLACE FUNCTION fn_obtener_total_categoria_mes (
    p_id_categoria   INTEGER,
    p_id_presupuesto INTEGER,
    p_anio           INTEGER,
    p_mes            INTEGER
)
RETURNS DECIMAL(12,2)
LANGUAGE SQL
READS SQL DATA
BEGIN
    DECLARE v_total DECIMAL(12,2);

    SELECT COALESCE(SUM(pd.monto_mensual), 0) INTO v_total
    FROM presupuesto_detalle pd
    INNER JOIN subcategoria s ON s.id_subcategoria = pd.id_subcategoria
    WHERE s.id_categoria = p_id_categoria
      AND pd.id_presupuesto = p_id_presupuesto;

    RETURN v_total;
END;


CREATE FUNCTION fn_obtener_total_ejecutado_categoria_mes(
p_id_categoria integer, p_anio integer, p_mes integer
)
RETURNS decimal(12,2)
LANGUAGE SQL
READS SQL DATA 
BEGIN
	DECLARE calc_total decimal(12,2);
	
	SELECT coalesce(SUM(t.monto), 0) INTO calc_total
	FROM transaccion t
	INNER JOIN subcategoria s ON s.id_subcategoria = t.id_subcategoria 
	WHERE s.id_categoria = p_id_categoria
		AND t.anio = p_anio AND t.mes = p_mes;

	RETURN calc_total;
END;


CREATE OR REPLACE FUNCTION fn_dias_hasta_vencimiento(
	p_id_obligacion integer
)
RETURNS integer
LANGUAGE SQL
READS SQL DATA 
BEGIN 
	DECLARE calc_dia integer;
	DECLARE primer_dia date;
	DECLARE fecha_venc date;

	SELECT dia_vencimiento INTO calc_dia
	FROM obligacion_fija
	WHERE id_obligacion = p_id_obligacion;
	
	SET primer_dia = CURRENT DATE - (DAY(CURRENT DATE) - 1) DAYS;
	SET fecha_venc = primer_dia + (calc_dia - 1) DAYS;
	
	
	
	RETURN DAYS(fecha_venc) - DAYS(CURRENT DATE);
END;

CREATE FUNCTION fn_validar_vigencia_presupuesto(p_fecha date, p_id_presupuesto integer)
RETURNS integer
LANGUAGE SQL 
READS SQL DATA 
BEGIN 
	DECLARE s_anio_inicio, s_mes_inicio, s_anio_fin, s_mes_fin integer;
	DECLARE s_periodo_fecha, s_periodo_inicio, s_periodo_fin integer;

	SELECT anio_inicio, mes_inicio, anio_fin, mes_fin
		INTO s_anio_inicio, s_mes_inicio, s_anio_fin, s_mes_fin
	FROM presupuesto
	WHERE id_presupuesto = p_id_presupuesto;
	
	SET s_periodo_fecha = YEAR(p_fecha) * 12 + MONTH(p_fecha);
	SET s_periodo_inicio = s_anio_inicio *12 + s_mes_inicio;
	SET s_periodo_fin = s_anio_fin *12 + s_mes_fin;
	
	IF s_periodo_fecha BETWEEN s_periodo_inicio AND s_periodo_fin THEN
		RETURN 1;
	ELSE
		RETURN 0;
	END IF;
END;

CREATE FUNCTION fn_obtener_categoria_por_subcategoria(
p_id_subcategoria integer)
RETURNS integer
LANGUAGE SQL
READS SQL DATA
BEGIN
	DECLARE s_id_categoria integer;

	SELECT id_categoria INTO s_id_categoria
	FROM subcategoria
	WHERE id_subcategoria = p_id_subcategoria;
	
	RETURN s_id_categoria;
END;

CREATE FUNCTION fn_calcular_proyeccion_gasto_mensual(p_id_subcategoria integer, p_anio integer, p_mes integer)
RETURNS decimal(12,2)
LANGUAGE SQL
READS SQL DATA 
BEGIN 
	DECLARE s_mes_str varchar(2);
	DECLARE primer_dia_mes date;
	DECLARE dias_totales integer;
	DECLARE dias_pasados integer;
	DECLARE ejecutado decimal(12,2);

	SET s_mes_str = CASE WHEN p_mes < 10 THEN '0' || trim(char(p_mes)) 
			ELSE trim(char(p_mes))
		    END;
	
	SET primer_dia_mes = date(trim(char(p_anio)) || '-' || s_mes_str || '-01');
	SET dias_totales = day(last_day(primer_dia_mes));
	
	IF p_anio = year(CURRENT date) AND p_mes = month(CURRENT date) THEN
		SET dias_pasados = day(CURRENT Date);
	ELSE 
		SET dias_pasados = dias_totales;
	END IF;
	
	IF dias_pasados = 0 THEN 
		SET dias_pasados = 1;
	END IF; 
	
	SET ejecutado = fn_calcular_monto_ejecutado(p_id_subcategoria, p_anio, p_mes);
	
	RETURN (ejecutado / dias_pasados) * dias_totales;
END;


CREATE FUNCTION fn_obtener_promedio_gasto_subcategoria(
p_id_usuario integer, p_id_subcategoria integer, p_cantidad_mes integer)
RETURNS decimal(12,2)
LANGUAGE SQL
READS SQL DATA
BEGIN 
	DECLARE promedio decimal(12,2);
	
	SELECT avg(monto_mes) INTO promedio
	FROM (
		SELECT sum(monto) AS monto_mes
		FROM transaccion
		WHERE id_usuario = p_id_usuario
			AND id_subcategoria = p_id_subcategoria
		GROUP BY anio, mes
		ORDER BY anio DESC, mes DESC
		FETCH FIRST p_cantidad_mes ROWS ONLY 
	) AS ultimos_meses;
	
	
	RETURN promedio;
END;






