# Features

## Proposito
`features` contiene los dominios navegables de Domus. Cada feature debe encapsular rutas, paginas, modelos y servicios API propios.

## Features implementadas
- `admin`
- `auth`
- `dashboard`
- `concierge`
- `visits`
- `packages`
- `residents`
- `units`
- `parking`
- `storages`
- `messaging`
- `notifications`
- `audit`
- `users`

## Features pendientes
- `bookings`
- `properties`

## Convencion recomendada
```text
feature/
  models/
  pages/
  services/
  feature-routing.module.ts
  feature.module.ts
```

Mantener en el README de cada feature su estado real: implementada, parcial o pendiente.
