CREATE TRIGGER trg_subcategoria_default
AFTER INSERT ON categoria
REFERENCING NEW AS n 
FOR EACH ROW
BEGIN ATOMIC
	INSERT INTO subcategoria (
		id_categoria,
		nombre_subcategoria,
		descripcion,
		esta_activa,
		es_por_defecto,
		creado_por
	)
	VALUES (
		n.id_categoria,
		'General',
		'Subcategoria creada automaticamente al registrar la categoria',
		TRUE,
		TRUE,
		n.creado_por
		
	);
END;

CREATE TRIGGER trg_usuario_modificado
NO CASCADE BEFORE UPDATE ON usuario
REFERENCING NEW AS n 
FOR EACH ROW
SET n.modificado_en = CURRENT TIMESTAMP;


CREATE TRIGGER trg_presupuesto_modificado
NO CASCADE BEFORE UPDATE ON presupuesto
REFERENCING NEW AS n 
FOR EACH ROW
SET n.modificado_en = CURRENT TIMESTAMP;

CREATE TRIGGER trg_categoria_modificado
NO CASCADE BEFORE UPDATE ON categoria
REFERENCING NEW AS n 
FOR EACH ROW
SET n.modificado_en = CURRENT TIMESTAMP;


CREATE TRIGGER trg_subcategoria_modificado
NO CASCADE BEFORE UPDATE ON subcategoria
REFERENCING NEW AS n 
FOR EACH ROW
SET n.modificado_en = CURRENT TIMESTAMP;


CREATE TRIGGER trg_presupuesto_detalle_modificado
NO CASCADE BEFORE UPDATE ON presupuesto_detalle
REFERENCING NEW AS n 
FOR EACH ROW
SET n.modificado_en = CURRENT TIMESTAMP;

CREATE TRIGGER trg_obligacion_modificado
NO CASCADE BEFORE UPDATE ON obligacion_fija
REFERENCING NEW AS n 
FOR EACH ROW
SET n.modificado_en = CURRENT TIMESTAMP;


CREATE TRIGGER trg_transaccion_modificado
NO CASCADE BEFORE UPDATE ON transaccion
REFERENCING NEW AS n 
FOR EACH ROW
SET n.modificado_en = CURRENT TIMESTAMP;







