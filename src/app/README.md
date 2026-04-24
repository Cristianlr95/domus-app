# Estructura de la aplicacion Domus

## Proposito
Esta carpeta contiene la aplicacion Angular/Ionic. La organizacion actual separa infraestructura transversal, modulos funcionales y recursos compartidos.

## Estructura
- `core/`: autenticacion, guards, interceptores, servicios singleton, modelos globales y almacenamiento de sesion.
- `features/`: modulos de dominio cargados por rutas lazy-loaded.
- `shared/`: espacio reservado para componentes, pipes, directivas y utilidades reutilizables.
- `home/`: pantalla heredada de la plantilla Ionic; no representa una funcionalidad principal.

## Estado
La aplicacion tiene modulos operativos activos, pero aun necesita consolidar un shell autenticado y componentes compartidos para reducir duplicacion entre CRUDs.
