-- =========================================================
-- Script de Generación de Datos de Prueba (CORREGIDO)
-- =========================================================

-- 1. CREAR EL USUARIO PRINCIPAL (ID: 1)
INSERT INTO usuario (nombres, apellidos, correo_electronico, fecha_registro, salario_mensual_base, estado, creado_por, modificado_por)
VALUES ('Samuel', 'Vasquez', 'samuel@email.com', '2026-06-30', 25000.00, 'activo', 1, 1);


INSERT INTO usuario (nombres, apellidos, correo_electronico, fecha_registro, salario_mensual_base, estado, creado_por, modificado_por)
VALUES ('Administrador', 'Sistema', 'admin@teoriadb.com', '2026-09-23', 50000.00, 'activo',1, 1);

-- 2. CREAR CATEGORÍAS PRINCIPALES (IDs: 1 al 6)
-- (El trigger creará las subcategorías "General" ocupando los IDs del 1 al 6)
INSERT INTO categoria (nombre_categoria, descripcion, tipo_categoria, orden_presentacion, creado_por, modificado_por) VALUES
('Salario Principal', 'Ingreso recurrente', 'ingreso', 1, 1, 1),
('Vivienda', 'Gastos de techo y hogar', 'gasto', 2, 1, 1),
('Servicios Públicos', 'Agua, luz, internet', 'gasto', 3, 1, 1),
('Alimentación', 'Comida diaria', 'gasto', 4, 1, 1),
('Transporte', 'Movilización y vehículo', 'gasto', 5, 1, 1),
('Educación', 'Gastos universitarios', 'gasto', 6, 1, 1);

-- 3. CREAR SUBCATEGORÍAS ESPECÍFICAS (Ocuparán los IDs del 7 al 12)
INSERT INTO subcategoria (id_categoria, nombre_subcategoria, descripcion, esta_activa, es_por_defecto, creado_por, modificado_por) VALUES
(2, 'Alquiler', 'Renta mensual', TRUE, FALSE, 1, 1),          -- ID 7
(3, 'Energía Eléctrica', 'Recibo de luz', TRUE, FALSE, 1, 1),  -- ID 8
(3, 'Internet', 'Servicio de red', TRUE, FALSE, 1, 1),         -- ID 9
(4, 'Supermercado', 'Despensa quincenal', TRUE, FALSE, 1, 1),  -- ID 10
(4, 'Restaurantes', 'Comida fuera', TRUE, FALSE, 1, 1),        -- ID 11
(5, 'Combustible', 'Gasolina para vehículo', TRUE, FALSE, 1, 1);-- ID 12

-- 4. DEFINIR OBLIGACIONES FIJAS (Ocuparán IDs del 1 al 3)
INSERT INTO obligacion_fija (id_usuario, id_subcategoria, nombre_obligacion, descripcion, monto_fijo_mensual, dia_vencimiento, esta_vigente, fecha_inicio, creado_por, modificado_por) VALUES
(1, 7, 'Renta Casa', 'Pago al arrendador', 6000.00, 5, TRUE, '2026-01-01', 1, 1),
(1, 8, 'Recibo Luz', 'ENEE', 900.00, 15, TRUE, '2026-01-01', 1, 1),
(1, 9, 'Internet Casa', 'Plan residencial', 1200.00, 20, TRUE, '2026-01-01', 1, 1);

-- 5. CREAR PRESUPUESTO (ID: 1)
INSERT INTO presupuesto (id_usuario, nombre_descriptivo, anio_inicio, mes_inicio, anio_fin, mes_fin, total_ingresos_planificados, total_gastos_planificados, total_ahorro_planificado, estado, creado_por, modificado_por)
VALUES (1, 'Presupuesto Trimestre 3', 2026, 7, 2026, 8, 25000.00, 20000.00, 5000.00, 'activo', 1, 1);

-- 6. ASIGNAR DETALLES AL PRESUPUESTO
INSERT INTO presupuesto_detalle (id_presupuesto, id_subcategoria, monto_mensual, creado_por, modificado_por) VALUES
(1, 7, 6000.00, 1, 1), -- Alquiler
(1, 8, 900.00, 1, 1),  -- Energía
(1, 9, 1200.00, 1, 1), -- Internet
(1, 10, 4500.00, 1, 1),-- Supermercado
(1, 11, 1500.00, 1, 1),-- Restaurantes
(1, 12, 2000.00, 1, 1);-- Combustible

-- 7. TRANSACCIONES MES 1 (JULIO 2026)
INSERT INTO transaccion (id_usuario, id_presupuesto, anio, mes, id_subcategoria, tipo_transaccion, descripcion, monto, fecha_movimiento, metodo_pago, creado_por, modificado_por)
VALUES (1, 1, 2026, 7, 1, 'ingreso', 'Pago quincena 1 y 2', 25000.00, '2026-07-01', 'transferencia', 1, 1);

INSERT INTO transaccion (id_usuario, id_presupuesto, anio, mes, id_subcategoria, id_obligacion, tipo_transaccion, descripcion, monto, fecha_movimiento, metodo_pago, creado_por, modificado_por) VALUES
(1, 1, 2026, 7, 7, 1, 'gasto', 'Pago Renta Julio', 6000.00, '2026-07-03', 'transferencia', 1, 1),
(1, 1, 2026, 7, 8, 2, 'gasto', 'Pago Luz Julio', 915.50, '2026-07-14', 'tarjeta_debito', 1, 1),
(1, 1, 2026, 7, 9, 3, 'gasto', 'Pago Internet Julio', 1200.00, '2026-07-19', 'tarjeta_credito', 1, 1);

INSERT INTO transaccion (id_usuario, id_presupuesto, anio, mes, id_subcategoria, tipo_transaccion, descripcion, monto, fecha_movimiento, metodo_pago, creado_por, modificado_por) VALUES
(1, 1, 2026, 7, 10, 'gasto', 'Compra Quincena 1', 2300.00, '2026-07-02', 'tarjeta_debito', 1, 1),
(1, 1, 2026, 7, 12, 'gasto', 'Gasolina tanque lleno', 950.00, '2026-07-10', 'efectivo', 1, 1),
(1, 1, 2026, 7, 11, 'gasto', 'Cena fin de semana', 450.00, '2026-07-12', 'tarjeta_debito', 1, 1),
(1, 1, 2026, 7, 10, 'gasto', 'Compra Quincena 2', 2150.00, '2026-07-16', 'tarjeta_debito', 1, 1),
(1, 1, 2026, 7, 12, 'gasto', 'Gasolina recarga', 800.00, '2026-07-22', 'efectivo', 1, 1),
(1, 1, 2026, 7, 11, 'gasto', 'Almuerzo Universidad', 250.00, '2026-07-25', 'efectivo', 1, 1);

-- 8. TRANSACCIONES MES 2 (AGOSTO 2026)
INSERT INTO transaccion (id_usuario, id_presupuesto, anio, mes, id_subcategoria, tipo_transaccion, descripcion, monto, fecha_movimiento, metodo_pago, creado_por, modificado_por)
VALUES (1, 1, 2026, 8, 1, 'ingreso', 'Pago quincena 1 y 2', 25000.00, '2026-08-01', 'transferencia', 1, 1);

INSERT INTO transaccion (id_usuario, id_presupuesto, anio, mes, id_subcategoria, id_obligacion, tipo_transaccion, descripcion, monto, fecha_movimiento, metodo_pago, creado_por, modificado_por) VALUES
(1, 1, 2026, 8, 7, 1, 'gasto', 'Pago Renta Agosto', 6000.00, '2026-08-04', 'transferencia', 1, 1),
(1, 1, 2026, 8, 8, 2, 'gasto', 'Pago Luz Agosto', 880.00, '2026-08-16', 'tarjeta_debito', 1, 1),
(1, 1, 2026, 8, 9, 3, 'gasto', 'Pago Internet Agosto', 1200.00, '2026-08-20', 'tarjeta_credito', 1, 1);

INSERT INTO transaccion (id_usuario, id_presupuesto, anio, mes, id_subcategoria, tipo_transaccion, descripcion, monto, fecha_movimiento, metodo_pago, creado_por, modificado_por) VALUES
(1, 1, 2026, 8, 10, 'gasto', 'Compra Despensa Fuerte', 3100.00, '2026-08-03', 'tarjeta_debito', 1, 1),
(1, 1, 2026, 8, 12, 'gasto', 'Gasolina viaje largo', 1200.00, '2026-08-08', 'efectivo', 1, 1),
(1, 1, 2026, 8, 11, 'gasto', 'Cumpleaños amigo', 850.00, '2026-08-14', 'tarjeta_credito', 1, 1),
(1, 1, 2026, 8, 10, 'gasto', 'Reabastecimiento', 1500.00, '2026-08-18', 'tarjeta_debito', 1, 1),
(1, 1, 2026, 8, 12, 'gasto', 'Gasolina rutinaria', 750.00, '2026-08-25', 'efectivo', 1, 1);