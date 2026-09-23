
CREATE TABLE usuario (
    id_usuario INTEGER NOT NULL GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    correo_electronico VARCHAR(150) NOT NULL UNIQUE,
    fecha_registro DATE NOT NULL,
    salario_mensual_base DECIMAL(12, 2) NOT NULL,
    estado VARCHAR(20) NOT NULL,
    creado_por INTEGER,
    modificado_por INTEGER,
    creado_en TIMESTAMP DEFAULT CURRENT TIMESTAMP,
    modificado_en TIMESTAMP DEFAULT CURRENT TIMESTAMP,
    PRIMARY KEY (id_usuario)
);


CREATE TABLE presupuesto (
    id_presupuesto INTEGER NOT NULL GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    id_usuario INTEGER NOT NULL,
    nombre_descriptivo VARCHAR(150) NOT NULL,
    anio_inicio INTEGER NOT NULL,
    mes_inicio INTEGER NOT NULL,
    anio_fin INTEGER NOT NULL,
    mes_fin INTEGER NOT NULL,
    total_ingresos_planificados DECIMAL(12, 2) NOT NULL,
    total_gastos_planificados DECIMAL(12, 2) NOT NULL,
    total_ahorro_planificado DECIMAL(12, 2) NOT NULL,
    fecha_hora_creacion TIMESTAMP DEFAULT CURRENT TIMESTAMP,
    estado VARCHAR(20) NOT NULL,
    creado_por INTEGER,
    modificado_por INTEGER,
    creado_en TIMESTAMP DEFAULT CURRENT TIMESTAMP,
    modificado_en TIMESTAMP DEFAULT CURRENT TIMESTAMP,
    PRIMARY KEY (id_presupuesto),
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);

CREATE TABLE categoria (
    id_categoria INTEGER NOT NULL GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    nombre_categoria VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255),
    tipo_categoria VARCHAR(20) NOT NULL,
    nombre_icono VARCHAR(50),
    color_hex VARCHAR(7),
    orden_presentacion INTEGER,
    creado_por INTEGER,
    modificado_por INTEGER,
    creado_en TIMESTAMP DEFAULT CURRENT TIMESTAMP,
    modificado_en TIMESTAMP DEFAULT CURRENT TIMESTAMP,
    PRIMARY KEY (id_categoria)
);


CREATE TABLE subcategoria (
    id_subcategoria INTEGER NOT NULL GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    id_categoria INTEGER NOT NULL,
    nombre_subcategoria VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255),
    esta_activa BOOLEAN NOT NULL DEFAULT TRUE,
    es_por_defecto BOOLEAN NOT NULL DEFAULT FALSE,
    creado_por INTEGER,
    modificado_por INTEGER,
    creado_en TIMESTAMP DEFAULT CURRENT TIMESTAMP,
    modificado_en TIMESTAMP DEFAULT CURRENT TIMESTAMP,
    PRIMARY KEY (id_subcategoria),
    FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria)
);


CREATE TABLE presupuesto_detalle (
    id_presupuesto_detalle INTEGER NOT NULL GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    id_presupuesto INTEGER NOT NULL,
    id_subcategoria INTEGER NOT NULL,
    monto_mensual DECIMAL(12, 2) NOT NULL,
    observaciones VARCHAR(255),
    creado_por INTEGER,
    modificado_por INTEGER,
    creado_en TIMESTAMP DEFAULT CURRENT TIMESTAMP,
    modificado_en TIMESTAMP DEFAULT CURRENT TIMESTAMP,
    PRIMARY KEY (id_presupuesto_detalle),
    FOREIGN KEY (id_presupuesto) REFERENCES presupuesto(id_presupuesto),
    FOREIGN KEY (id_subcategoria) REFERENCES subcategoria(id_subcategoria)
);


CREATE TABLE obligacion_fija (
    id_obligacion INTEGER NOT NULL GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    id_usuario INTEGER NOT NULL,
    id_subcategoria INTEGER NOT NULL,
    nombre_obligacion VARCHAR(150) NOT NULL,
    descripcion VARCHAR(255),
    monto_fijo_mensual DECIMAL(12, 2) NOT NULL,
    dia_vencimiento INTEGER NOT NULL,
    esta_vigente BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    creado_por INTEGER,
    modificado_por INTEGER,
    creado_en TIMESTAMP DEFAULT CURRENT TIMESTAMP,
    modificado_en TIMESTAMP DEFAULT CURRENT TIMESTAMP,
    PRIMARY KEY (id_obligacion),
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario),
    FOREIGN KEY (id_subcategoria) REFERENCES subcategoria(id_subcategoria)
);


CREATE TABLE transaccion (
    id_transaccion INTEGER NOT NULL GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    id_usuario INTEGER NOT NULL,
    id_presupuesto INTEGER NOT NULL,
    anio INTEGER NOT NULL,
    mes INTEGER NOT NULL,
    id_subcategoria INTEGER NOT NULL,
    id_obligacion INTEGER, 
    tipo_transaccion VARCHAR(20) NOT NULL,
    descripcion VARCHAR(255) NOT NULL,
    monto DECIMAL(12, 2) NOT NULL,
    fecha_movimiento DATE NOT NULL,
    metodo_pago VARCHAR(50) NOT NULL,
    numero_factura VARCHAR(100),
    observaciones VARCHAR(255),
    fecha_hora_registro TIMESTAMP DEFAULT CURRENT TIMESTAMP,
    creado_por INTEGER,
    modificado_por INTEGER,
    creado_en TIMESTAMP DEFAULT CURRENT TIMESTAMP,
    modificado_en TIMESTAMP DEFAULT CURRENT TIMESTAMP,
    PRIMARY KEY (id_transaccion),
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario),
    FOREIGN KEY (id_presupuesto) REFERENCES presupuesto(id_presupuesto),
    FOREIGN KEY (id_subcategoria) REFERENCES subcategoria(id_subcategoria),
    FOREIGN KEY (id_obligacion) REFERENCES obligacion_fija(id_obligacion)
);


CREATE INDEX idx_transaccion_anio_mes ON transaccion(anio, mes);
CREATE INDEX idx_transaccion_subcat ON transaccion(id_subcategoria);

ALTER TABLE categoria ADD CONSTRAINT chk_tipo_categoria
	CHECK(tipo_categoria IN ('ingreso','gasto','ahorro'));

ALTER TABLE transaccion ADD CONSTRAINT chk_tipo_transaccion
	CHECK(tipo_transaccion IN ('ingreso','gasto','ahorro'));

ALTER TABLE transaccion ADD CONSTRAINT chk_metodo_pago
	CHECK(metodo_pago IN ('efectivo','tarjeta_debito','tarjeta_credito', 'transferencia'));

ALTER TABLE usuario ADD CONSTRAINT chk_estado_usuario
	CHECK(estado IN ('activo','inactivo'));

ALTER TABLE presupuesto ADD CONSTRAINT chk_estado_presupuesto
	CHECK(estado IN ('activo','cerrado','borrador'));

ALTER TABLE presupuesto ADD CONSTRAINT chk_vigencia_presupuesto
	CHECK ((anio_fin * 12 + mes_fin) >= (anio_inicio * 12 + mes_inicio));

ALTER TABLE presupuesto_detalle
	ADD CONSTRAINT uq_presupuesto_subcategoria UNIQUE (id_presupuesto, id_subcategoria); 


ALTER TABLE usuario RENAME COLUMN nombres TO primer_nombre;
ALTER TABLE usuario RENAME COLUMN apellidos TO primer_apellido;

ALTER TABLE usuario ADD COLUMN segundo_nombre VARCHAR(50);
ALTER TABLE usuario ADD COLUMN segundo_apellido VARCHAR(50);



