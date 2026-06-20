# Domus App

## Descripcion
Frontend web/mobile-first para Domus, una aplicacion de administracion residencial construida con Ionic y Angular. Permite operar modulos de conserjeria, visitas, encomiendas, residentes, unidades, estacionamientos, bodegas, mensajeria, notificaciones y auditoria desde una interfaz protegida por autenticacion.

## Repositorios relacionados
- Backend/API: [Cristianlr95/domus-server](https://github.com/Cristianlr95/domus-server)

## Problema que resuelve
Los equipos de administracion y conserjeria necesitan registrar eventos, consultar informacion y responder rapido sin depender de herramientas dispersas. Domus App entrega una interfaz centralizada para ejecutar tareas operativas y consumir una API backend con permisos y trazabilidad.

## Funcionalidades principales
- Login con formularios reactivos y persistencia de sesion.
- Rutas protegidas por autenticacion, roles y permisos.
- Dashboard principal y panel de conserjeria.
- Listados, formularios y vistas detalle para visitas, encomiendas, residentes, unidades, estacionamientos y bodegas.
- Mensajeria interna, notificaciones y auditoria.
- Interceptores para JWT y manejo de errores `401`.
- Build web servido como SPA estatica con Nginx.

## Stack tecnico
- Angular 20
- Ionic 8
- Capacitor 8
- TypeScript 5.9
- RxJS 7
- Angular Router con lazy loading
- Formularios reactivos
- Karma/Jasmine para unit tests
- Playwright configurado para E2E
- Docker + Nginx

## Arquitectura / Estructura
La aplicacion usa una organizacion por capas y features lazy-loaded. `core` contiene servicios singleton, guards e interceptores; `features` agrupa los modulos funcionales; `shared` existe como espacio de reutilizacion, aunque hoy tiene poca implementacion real.

```text
domus-app/
  src/app/
    core/
      api/
      auth/
      guards/
      interceptors/
      services/
      storage/
    features/
      auth/
      dashboard/
      concierge/
      visits/
      packages/
      residents/
      units/
      parking/
      storages/
      messaging/
      notifications/
      audit/
      bookings/      # reservas de espacios comunes
      properties/    # propiedades/comunidades
      users/         # administracion de usuarios
    resident/        # portal privado del residente
    shared/
  docs/
  scripts/
```

## Instalacion y ejecucion local
Requisitos:

- Node.js 20 o superior
- npm
- Backend Domus disponible, por defecto en `http://localhost:8080/api/v1`

```bash
npm ci
```

Configurar entorno:

```bash
cp .env.example .env
```

En Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Ejecutar en desarrollo:

```bash
npm start
```

Comandos utiles:

```bash
npm run build
npm run build:dev
npm run lint
npm run test
npm run e2e
```

## Estado del proyecto
Proyecto funcional para el alcance MVP definido. Los modulos administrativos, operativos y de residente cuentan con rutas, servicios API, pantallas protegidas y validacion automatizada.

Avance funcional del alcance MVP: `100%`.

## Funcionalidades implementadas
- Login y restauracion de sesion.
- Guards de acceso por autenticacion, rol y permiso.
- Dashboard y panel de conserjeria.
- Gestion de visitas, encomiendas, residentes, unidades, estacionamientos y bodegas.
- Mensajeria, notificaciones y auditoria.
- Reservas, propiedades y usuarios conectados al routing principal.
- Portal privado para residentes con sus reservas, visitas, encomiendas, mensajes y notificaciones.
- Preferencias configurables de notificaciones.
- Shell autenticado con navegacion persistente desktop/mobile y accesos filtrados por permisos.
- Navegacion movil compacta con menu de opciones adicionales.
- Configuracion por `.env` para builds reproducibles.
- Flujos E2E de autenticacion, portal residente y preferencias de notificacion.

## Proximas mejoras
- Extraer componentes reutilizables adicionales para reducir duplicacion.
- Ampliar cobertura E2E hacia operaciones CRUD secundarias.
- Integrar mapas y notificaciones push nativas en una fase posterior.
- Evaluar almacenamiento de token fuera de `localStorage` si el backend lo permite.

## Valor profesional del proyecto
Este frontend demuestra construccion de aplicaciones Angular/Ionic de dominio empresarial: modularizacion por features, guards e interceptores, consumo tipado de APIs REST, formularios reactivos, manejo de sesion, preparacion para despliegue SPA y criterio para documentar brechas reales sin sobredimensionar el alcance.

## Que conviene revisar primero
- Autenticacion y rutas protegidas por rol/permiso.
- Dashboard y panel de conserjeria.
- CRUD operativos de visitas, encomiendas, residentes, unidades y estacionamientos.
- Integracion con la API propia de Domus y configuracion de despliegue.
