# Pruebas E2E

Playwright valida los flujos criticos del alcance MVP mediante una API
controlada:

- inicio de sesion y restauracion de la sesion;
- acceso privado del residente a sus operaciones;
- carga y guardado de preferencias de notificacion;
- navegacion movil sin desbordamiento horizontal.

## Ejecucion

```bash
npm run e2e
npm run e2e:headed
```

El runner compila la aplicacion, levanta temporalmente la SPA en
`http://127.0.0.1:8100`, ejecuta la suite y libera el puerto al terminar.
