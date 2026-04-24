# Core

## Proposito
`core` agrupa servicios y piezas transversales que deben existir una sola vez en la aplicacion.

## Contenido actual
- `api/`: contratos comunes de respuesta.
- `auth/`: servicio de autenticacion, autorizacion y modelos de sesion.
- `guards/`: proteccion por autenticacion, rol, permiso y usuario invitado.
- `interceptors/`: inyeccion de JWT y manejo global de errores.
- `services/`: feedback visual y servicios globales.
- `storage/`: persistencia local de sesion.

## Criterio de uso
Agregar aqui solo infraestructura compartida. La logica especifica de un modulo debe permanecer dentro de `features/`.
