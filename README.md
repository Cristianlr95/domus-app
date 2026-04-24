# Domus Frontend

Base frontend de `Domus` construida con el mismo stack principal de `Atleta`:

- Ionic 8
- Angular 20
- Capacitor 8
- TypeScript
- Playwright para E2E

## Scripts

- `Copy-Item .env.example .env`
- `npm ci`
- `npm start`
- `npm run build`
- `npm run test`
- `npm run lint`
- `npm run e2e`

## Notas

- La configuracion de despliegue ahora se prepara con `.env` + `scripts/prepare-env.mjs`.
- El backend esperado por defecto es `http://localhost:8080/api/v1`.
- La documentacion operativa esta en `docs/deployment.md`.
