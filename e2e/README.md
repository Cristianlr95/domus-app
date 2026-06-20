# Pruebas E2E

Playwright valida flujos criticos mediante una API controlada y estricta.
Los endpoints o metodos no declarados fallan con `404`, evitando falsos
positivos:

- inicio de sesion y restauracion de la sesion;
- acceso privado del residente a sus operaciones;
- carga y guardado de preferencias de notificacion;
- navegacion movil sin desbordamiento horizontal.
- cierre de sesion visible para residentes;
- metodo y cuerpo del guardado de preferencias.

## Ejecucion

```bash
npm run e2e
npm run e2e:headed
```

El runner compila la aplicacion, levanta temporalmente la SPA en
`http://127.0.0.1:8100`, ejecuta la suite y libera el puerto al terminar.
