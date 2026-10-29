# MediTurno AI — Estructura v2

Proyecto académico en JavaScript con aplicaciones **frontend** y **backend** separadas.

## Tecnología
- Frontend: JavaScript, HTML, CSS, Vite (puerto 5173).
- Backend: Node.js, Express, Mongoose y JWT (puerto 3000).
- Base de datos: MongoDB Atlas (Free/M0).
- 3 APIs externas previstas: AssemblyAI (transcripción), Gemini API (borrador de resumen), Google Drive API (archivos PDF privados).
- Herramientas locales secundarias: Whisper y Ollama (no cuentan como APIs externas).
- PDFKit se agregará al desarrollar la exportación a PDF.

## Requisitos
- Node.js 22 o compatible con las dependencias instaladas.
- Cuenta y URI de MongoDB Atlas; agregar IP y usuario de base de datos en Atlas.
- Usar datos de demostración ficticios, sin información clínica real.

## Preparar backend
```bash
cd backend
npm install
```
Copiar `backend/.env.example` a `backend/.env` y completar `MONGODB_URI` y un `JWT_SECRET` aleatorio de al menos 32 caracteres. No se requieren claves de las 3 APIs externas para iniciar esta etapa.
```bash
npm run seed
npm run dev
```
Prueba: http://localhost:3000/api/health

## Preparar frontend (otra terminal)
```bash
cd frontend
npm install
```
Copiar `frontend/.env.example` a `frontend/.env` si necesitas cambiar la URL de la API.
```bash
npm run dev
```
Abrir http://localhost:5173

## Funcional en esta fase
- Registro e inicio de sesión de pacientes.
- Ver médicos de ejemplo (primero ejecutar `npm run seed`).
- Reservar, ver y cancelar citas como paciente.
- MongoDB Atlas y JWT.
- Vista informativa de MediTurno AI y endpoint `GET /api/consultations/status`.

## Pendiente
- Paneles y permisos completos de doctor y administrador.
- Consentimiento y permisos granulares para consultas.
- Captura, subida y transcripción de audio con AssemblyAI.
- Gemini: resumen borrador (solo conversaciones ficticias), verificación del médico.
- PDFKit: documento aprobado; Google Drive API: OAuth y almacenamiento privado.
- Whisper y Ollama como opciones locales.
- Pruebas de concurrencia, seguridad, auditoría y privacidad para el módulo clínico.

## Seguridad
El `.env` no se comparte ni se sube al repositorio. Nunca colocar claves en `frontend/.env` con prefijo `VITE_`. Las credenciales privadas van en el servidor. El código no está autorizado para uso clínico real.
