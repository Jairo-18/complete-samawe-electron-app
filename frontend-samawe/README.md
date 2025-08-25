# Sistema Administrativo y Contable - Hotel Samawé

Este es el frontend del sistema administrativo y contable del Hotel Samawé, una aplicación web moderna desarrollada con Angular. El sistema permite gestionar usuarios, productos y servicios (como hospedajes y excursiones), facturas de venta y compra, balances financieros y reportes contables. 🏨💸

---

## ✨ Resumen del Proyecto

Esta aplicación fue diseñada para cubrir las operaciones administrativas de un hotel, permitiendo a los administradores y empleados controlar todos los movimientos del negocio desde una interfaz intuitiva y segura.

---

## 🚀 Características Clave

- **Control de Accesos Basado en Roles:** Super Admin, Administrador, Empleado y Usuario final. 🔐
- **Facturación Completa:** Creación, edición, descarga e impresión de facturas de venta y compra. 📋
- **Productos y Servicios:** Módulo CRUD para productos, pasadías y hospedajes. 🏠🌽🏝
- **Balances Financieros:** Registro automático de ingresos y egresos, con generación de balances diarios, semanales, mensuales y anuales. 📊
- **Reportes Dinámicos:** Consultas agregadas por período y estado de entidades. ⚖️
- **Impresión de Facturas en PDF:** Facturas descargables e imprimibles. 📄💾
- **Filtros Avanzados de Búsqueda:** Para todos los módulos con soporte de autocompletado. 🔍
- **Soporte Móvil:** Diseño responsivo adaptable a dispositivos pequeños. 📱

---

## 🛠️ Tecnologías Usadas

### Frontend

- **Angular 17+**: Framework principal de la aplicación web. ⚛️
- **RxJS**: Programación reactiva para flujos asincrónicos. ⏳
- **Angular Material**: Componentes UI modernos y accesibles. 🎨
- **SCSS / Tailwind (parcial)**: Estilos personalizados. 👗

### Backend

- **NestJS**: Estructura del backend con arquitectura limpia y modular. 🚀
- **PostgreSQL**: Base de datos principal. 📂

---

## 📆 Módulos Principales

- **Usuarios**: Registro y administración de usuarios por rol.
- **Productos y Servicios**: Gestor de stock, alojamientos, pasadías, excursiones.
- **Facturas**: CRUD completo de ventas y compras, con detalle por producto/servicio.
- **Balances**: Lógica de ingresos y egresos automáticos al facturar.
- **Reportes**: Consultas agregadas por períodos, estados y totales.

---

## 💡 Arquitectura de la Aplicación

El sistema está dividido en módulos autocontenidos, cada uno con:

- Componentes (listado, creación, edición)
- Servicios de datos
- DTOs compartidos entre frontend y backend
- Validaciones y manejo de formularios reactivos

Se sigue una estructura escalable con buenas prácticas: inyección de dependencias, separación de responsabilidades, y uso de interfaces para contratos de datos.

---

## 👨‍💼 Herramientas para Desarrollo

- **ESLint + Prettier**: Estándares de calidad de código. 🚪

---

## 🗓️ Comandos Comunes

```bash
ng s          # Ejecuta el servidor de desarrollo
npm run start           # Ejecuta el servidor de desarrollo
npm run build           # Genera la versión de producción
npm run compodoc        # Genera la documentación con Compodoc
npx compodoc -s         # Levanta servidor de documentación local
```

---

## 💮 Próximos Pasos

- Agregar pruebas unitarias con Testing Library
- Mejorar cobertura de documentación JSDoc en servicios y componentes
- Crear generador de reportes exportables en Excel y PDF

---

**Hotel Samawé** - Sistema Contable y Administrativo Web.

> "Hecho para que tu hotel trabaje por ti."
