
# Sistema de Gestión Financiera y Presupuestal

Plataforma full-stack de nivel empresarial diseñada para la gestión centralizada de presupuestos, categorización de gastos y control de obligaciones financieras. La arquitectura del sistema está estrictamente orientada a la base de datos, delegando la lógica de negocio transaccional, la integridad referencial y la generación de estructuras de datos al motor relacional.

## Arquitectura Tecnológica

*   **Base de Datos (Capa Lógica):** IBM Db2 ejecutado en contenedores Docker. Implementa Primera Forma Normal (1NF), procedimientos almacenados exclusivos para operaciones CRUD, funciones escalares para cálculos financieros y manejo de excepciones mediante `SIGNAL SQLSTATE`.
*   **Backend (Capa de Middleware):** Node.js con Express y TypeScript. Utiliza el controlador ODBC `ibm_db` para la parametrización segura de consultas y el manejo de parámetros de salida (`OUT`) y variables autogeneradas (`IDENTITY_VAL_LOCAL()`).
*   **Frontend (Capa de Presentación):** React empaquetado con Vite. Implementa Control de Acceso Basado en Roles (RBAC), gráficos dinámicos con Recharts renderizados a partir de JSON nativo de Db2, y exportación de reportes ejecutivos con html2pdf.js.

## Módulos Principales

1.  **Seguridad y Accesos (RBAC):** Aislamiento de módulos operativos y catálogos globales según el rol del usuario (Ej. `ADMIN` vs. Estándar).
2.  **Gestión de Usuarios:** Estructura de datos 1NF atómica (primer nombre, segundo nombre, primer apellido, segundo apellido) con auditoría de creación y modificación.
3.  **Planificación Presupuestal:** Creación de presupuestos mensuales con asignación de límites por subcategoría.
4.  **Ejecución y Obligaciones:** Registro de transacciones financieras limitadas por la vigencia del presupuesto y cálculo asíncrono de vencimientos de recibos.
5.  **Dashboard Analítico:** Visualización híbrida (PieChart y BarChart) con indicadores de ejecución en tiempo real y exportación en formato PDF.

## Requisitos Previos

*   **Docker Desktop** (Para levantar la imagen de IBM Db2).
*   **Node.js** (v18 o superior).
*   **DBeaver** o Data Studio (Para la ejecución inicial de scripts).

## Instrucciones de Instalación y Despliegue

### 1. Configuración de la Base de Datos (Db2)
1. Desplegar el contenedor de IBM Db2 y exponer el puerto `50000`.
2. Conectar DBeaver a la base de datos utilizando las credenciales de administrador.
3. Ejecutar los scripts SQL en el siguiente orden estricto para mantener la integridad referencial:
   * `tablas.sql` (Esquema principal)
   * `funciones.sql` (Cálculos matemáticos y de fechas)
   * `cruds_categorias.sql` y `cruds_subcategorias.sql` (Catálogos)
   * `cruds_usuarios.sql` (Gestión de perfiles)
   * `logica_negocio.sql` (Cierre de presupuestos, JSON y alertas)

### 2. Configuración del Backend (Node.js)
1. Abrir una terminal en la carpeta del backend.
2. Instalar las dependencias del proyecto:
   ```bash
   npm install

```

3. Configurar la cadena de conexión ODBC en el archivo `server.ts` con los parámetros del contenedor Db2.
4. Iniciar el servidor de desarrollo utilizando `tsx`:
```bash
npx tsx server.ts

```

*El servidor quedará en escucha en `http://localhost:3000`.*

### 3. Configuración del Frontend (React + Vite)

1. Abrir una nueva terminal en la carpeta del frontend.
2. Instalar las dependencias de la interfaz:
```bash
npm install

```


3. Ejecutar el entorno de desarrollo:
```bash
npm run dev

```

4. Acceder a la aplicación a través de `http://localhost:5173`.

## Normativas de Seguridad

* **Prevención de Inyección SQL:** Todas las peticiones al backend utilizan sentencias preparadas (Prepared Statements) sin concatenación directa de cadenas.
* **Protección de Eliminación en Cascada:** La base de datos rechaza bloqueos de integridad referencial (Error SQL0532N), propagando el error hacia la interfaz gráfica de forma controlada mediante un mensaje 400.
* **Restricción de Manipulación de Vistas:** El estado persistente en React bloquea las fugas de memoria, forzando la redirección al componente principal al detectar cambios de sesión o desajustes de roles.
