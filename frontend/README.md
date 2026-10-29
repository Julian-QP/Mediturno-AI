# MediTurno AI — Frontend Fase 1

Estructura real de frontend en **JavaScript + Vite**. Conservar backend existente sin modificar nada de MongoDB.

## Instalación

1. Haz una **copia de seguridad** de tu carpeta `frontend` actual.
2. Sustituye únicamente la carpeta `frontend` existente por esta, o copia sus archivos a la tuya. Conserva tu `.env` anterior.
3. Dentro de `frontend`, ejecuta `npm install` y `npm run dev`.
4. Mantén en otra terminal el backend funcionando en el puerto 3000.
5. Si utilizas `.env`, configura `VITE_API_URL=http://localhost:3000/api`.
6. Si aparece un error de CORS y Vite abre `127.0.0.1:5173`, utiliza `http://localhost:5173` o conserva la lista de orígenes admitidos por tu backend.

## ¿Qué funciona?

- Inicio de sesión y registro con endpoints existentes `/auth/login`, `/auth/register`, `/auth/me`.
- Sesiones en `sessionStorage`, cierre de sesión y navegación basada en rol recibido del backend.
- Panel del paciente: próxima cita real, médicos reales, reservas y cancelaciones vía backend.
- Filtro local por nombre o especialidad en lista de médicos, y citas ya cargadas.
- Header, sidebar de tamaño accesible, diseño responsive y comunicados prioritarios **sin avisos ficticios presentados como reales**.

## ¿Qué no funciona todavía?

- Directorios, datos, avisos y bloqueos de administrador; agenda médica; seguimiento; IA; PDF; mapas. Sus pantallas son estados de diseño preparados, no integraciones falsas.
- Los roles `doctor` y `admin` requieren usuarios configurados y endpoints nuevos en el backend. El registro público solo crea pacientes.
- Búsquedas globales de datos que no han sido cargados al frontend y búsquedas de clínicas en un servidor: requieren rutas de backend adicionales.
- Las fechas/horarios de reserva usan temporalmente la lógica básica del backend existente.

## Organización

- `src/api`: peticiones al backend actual.
- `src/components/layout`: sidebar, header y menú por rol.
- `src/components/ui`: tarjetas e información prioritaria.
- `src/pages/auth`, `patient`, `doctor`, `admin`: interfaces separadas.
- `src/styles`: paleta, estilo base y responsive.

La conexión con MongoDB Atlas y las variables `JWT_SECRET` y `MONGODB_URI` **permanecen exclusivamente en `backend/.env`**.
