# Auth Feature

## Proposito
Modulo responsable del login y del acceso inicial a la aplicacion.

## Estado
Implementado.

## Alcance actual
- Pantalla de login con formulario reactivo.
- Consumo del backend para autenticacion.
- Persistencia de token mediante servicios de `core`.
- Redireccion segun estado de sesion.

## Mejoras futuras
- Recuperacion de password si el backend incorpora el flujo.
- Mensajes de error mas especificos por causa.
- Evaluar sesion con cookies `HttpOnly` si la arquitectura backend lo permite.
