# E2E Tests - Domus App

Esta carpeta contiene los tests E2E (End-to-End) para la aplicación Domus usando Playwright.

## Estructura

```
e2e/
├── pages/                 # Page Objects (helpers)
│   ├── bookings.page.ts   # Bookings module interactions
│   ├── properties.page.ts # Properties module interactions
│   └── users.page.ts      # Users module interactions
├── specs/                 # Test specifications
│   ├── bookings.spec.ts   # Bookings module tests
│   ├── properties.spec.ts # Properties module tests
│   └── users.spec.ts      # Users module tests
└── README.md              # This file
```

## Page Objects

### BookingsPage
Helpers para interactuar con el módulo de reservas:
- `navigateToBookings()` - Navega al listado de reservas
- `filterByStatus()` - Filtra reservas por estado
- `searchBooking()` - Busca reservas
- `clickNewBooking()` - Crea nueva reserva
- `cancelBooking()` - Cancela una reserva

### PropertiesPage
Helpers para interactuar con el módulo de propiedades:
- `navigateToProperties()` - Navega al listado de propiedades
- `verifyPropertiesGridLayout()` - Verifica layout de grid
- `filterByType()` - Filtra por tipo de propiedad
- `filterByStatus()` - Filtra por estado
- `searchProperty()` - Busca propiedades

### UsersPage
Helpers para interactuar con el módulo de usuarios:
- `navigateToUsers()` - Navega al listado de usuarios
- `filterByRole()` - Filtra por rol
- `filterByStatus()` - Filtra por estado (activo/inactivo)
- `searchUser()` - Busca usuarios
- `changeUserRole()` - Cambia el rol del usuario
- `deactivateUser()` - Desactiva usuario
- `activateUser()` - Activa usuario

## Tests

### Bookings Tests
- ✅ Display bookings list
- ✅ Filter bookings by status
- ✅ Search bookings
- ✅ Create new booking
- ✅ View booking detail
- ✅ Update booking status
- ✅ Cancel booking

### Properties Tests
- ✅ Display properties grid layout
- ✅ Filter by type
- ✅ Filter by status
- ✅ Search properties
- ✅ View property detail
- ✅ Update property status
- ✅ Multiple filter combinations

### Users Tests
- ✅ Display users list with role badges
- ✅ Filter by role
- ✅ Filter by status (active/inactive)
- ✅ Search users
- ✅ View user detail
- ✅ Change user role with confirmation
- ✅ Deactivate user
- ✅ Activate user
- ✅ Navigate between list and detail

## Ejecutar Tests

### Todos los tests
```bash
npm run test:e2e
```

### Tests específico del módulo
```bash
npm run test:e2e -- bookings.spec.ts
npm run test:e2e -- properties.spec.ts
npm run test:e2e -- users.spec.ts
```

### Con modo debug
```bash
npm run test:e2e -- --debug
```

### Con interfaz visual
```bash
npm run test:e2e -- --ui
```

### Generar reporte HTML
```bash
npm run test:e2e
npm run test:e2e:report
```

## Configuración

La configuración de Playwright se encuentra en `playwright.config.ts`:

```typescript
{
  testDir: './e2e',
  timeout: 30_000,
  baseURL: 'http://127.0.0.1:8100',
  webServer: {
    command: 'npm start -- --host=127.0.0.1 --port=8100',
    port: 8100,
    reuseExistingServer: true,
  }
}
```

- **Port**: 8100 (Ionic default)
- **Timeout**: 30 segundos por test
- **WebServer**: Auto-inicia servidor de desarrollo

## Requisitos

- Node.js 18+
- Angular 20+
- Ionic 8+
- Playwright instalado

## Instalación

```bash
npm install -D @playwright/test
```

## Buenas Prácticas

1. **Page Objects** - Usar helpers de páginas para evitar duplicación
2. **Assertions** - Verificar estados esperados después de cada acción
3. **Waits** - Usar `waitForURL()` o `waitForSelector()` para sincronización
4. **Error Handling** - Usar `.catch()` para manejar casos opcionales
5. **Test Isolation** - Cada test es independiente

## Cobertura

Los tests cubren:
- ✅ Navegación entre módulos
- ✅ CRUD operations (Create, Read, Update, Delete)
- ✅ Filtering y búsqueda
- ✅ Role-based access
- ✅ Status management
- ✅ Form submissions
- ✅ Confirmations

## Mejoras Futuras

- [ ] Agregar autenticación antes de tests
- [ ] Usar fixtures para datos de test
- [ ] Ampliar cobertura a edge cases
- [ ] Agregar performance tests
- [ ] Integración con CI/CD
- [ ] Reportes visuales mejorados
