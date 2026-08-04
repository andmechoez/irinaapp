# Propuesta Técnica y Presupuesto de Software: Aviva

## 1. Presupuesto de Software e Infraestructura

A continuación, se desglosa el costo de la inversión en desarrollo y los gastos operativos mensuales requeridos para el funcionamiento del sistema.

| Concepto | Costo / Inversión | Descripción |
| :--- | :--- | :--- |
| **Desarrollo de Software** | **$225.00** (Pago único) | Diseño, desarrollo e implementación completa de todos los módulos descritos, integración de Inteligencia Artificial y despliegue a producción. |
| **Plan Pro de Supabase** | **$25.00 / mes** | Infraestructura Backend en la nube. Incluye base de datos sin pausas, respaldos diarios automáticos, autenticación segura y almacenamiento de historiales médicos. |
| **Créditos de IA (Google Gemini)** | **$25.00 / mes** | Consumo estimado del modelo de Inteligencia Artificial para la generación personalizada de menús y recetas nutricionales. |
| **Hosting Frontend** | **$0.00 / mes** | Alojamiento de alta disponibilidad para la aplicación web, sin costo mensual gracias a plataformas de despliegue con planes gratuitos. |

### **Resumen Financiero**
*   **Inversión Única de Desarrollo:** `$225.00`
*   **Costo Operativo Mensual:** `$50.00 / mes`

---

## 2. Resumen Ejecutivo
**Aviva** es una plataforma integral de gestión clínica y nutricional que incorpora capacidades avanzadas de Inteligencia Artificial para la personalización de tratamientos. La arquitectura ha sido diseñada bajo un modelo escalable de **"Portal Dual"**, separando de manera segura la experiencia del especialista de la del paciente, asegurando privacidad, alto rendimiento y una interfaz de usuario moderna.

---

## 3. Módulos del Sistema y Funcionalidades

### Panel de Control del Especialista
Centro de mando del nutricionista o médico tratante. Presenta un resumen visual con métricas clave: número de pacientes activos, evaluaciones pendientes, gráficos de rendimiento del equipo y accesos directos a las funciones más utilizadas.

### Gestión de Pacientes
Módulo completo tipo CRM clínico que permite:
*   Registrar nuevos pacientes con su información personal y clínica.
*   Consultar la lista completa de pacientes con buscador y filtros.
*   Acceder al expediente detallado de cada paciente con todo su historial.

### Evaluación Clínica
Interfaz especializada para que el profesional de salud registre en cada consulta:
*   Métricas biométricas (peso, talla, IMC).
*   Resultados de análisis clínicos.
*   Notas de seguimiento y observaciones médicas.

### Administración Institucional
Submódulo exclusivo para administradores que incluye:
*   **Configuración de la Institución:** Personalización de datos, logo y configuración del centro médico.
*   **Gestión de Personal:** Alta, baja y asignación de roles para especialistas y doctores del equipo.
*   **Centro de Notificaciones:** Configuración centralizada de alertas y recordatorios para pacientes y staff.
*   **Gestión de Contenido:** Administración del catálogo maestro de ingredientes, guías alimenticias y material educativo.

### Generador de Recetas con Inteligencia Artificial
El corazón innovador de la plataforma. Permite al especialista:
*   Seleccionar ingredientes disponibles en un "carrito virtual".
*   Indicar las patologías del paciente (Diabetes, Hipertensión, Enfermedad Renal, etc.).
*   Generar automáticamente recetas y menús nutricionales personalizados mediante el modelo de IA **Google Gemini 2.5 Flash**, con cálculos precisos de calorías, proteínas y porciones.

### Biblioteca de Recetas
Catálogo unificado que combina las recetas base de la institución con las generadas por IA. Incluye:
*   Visualización en tarjetas con información nutricional resumida.
*   Vista detallada con ingredientes, procedimiento paso a paso y adecuación clínica.
*   Filtros avanzados por categoría, macronutrientes y tipo de patología.

### Portal del Paciente (App Móvil)
Experiencia simplificada diseñada para que el paciente lleve su seguimiento desde casa:
*   **Mi Dashboard:** Resumen diario de su plan nutricional y próximas citas.
*   **Mi Menú:** Visualización de la dieta asignada, dividida por tiempos de comida.
*   **Mi Progreso:** Gráficas interactivas que muestran la evolución del peso y el cumplimiento de objetivos a lo largo del tiempo.
*   **Guías y Recetas:** Acceso a material educativo y recetas aprobadas por su especialista.
*   **Mi Perfil:** Gestión de datos personales y preferencias de la cuenta.

### Autenticación y Seguridad
Sistema robusto de control de acceso que incluye:
*   Inicio y cierre de sesión seguro.
*   Protección de rutas por rol (Administrador, Especialista, Paciente).
*   Aislamiento de datos clínicos confidenciales a nivel de base de datos, garantizando que cada usuario solo acceda a la información que le corresponde.

### Infraestructura en la Nube
*   Base de datos PostgreSQL gestionada en la nube con respaldos automáticos diarios.
*   Almacenamiento persistente del estado de trabajo del especialista para evitar pérdida de información ante desconexiones o recargas accidentales.
*   Aplicación Web Progresiva (PWA) que permite instalar la app en el dispositivo y funcionar incluso con conectividad limitada.
