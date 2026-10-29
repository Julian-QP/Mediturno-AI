import {heading,searchBar,empty} from '../../components/layout/DashboardLayout.js';
import {escapeHtml} from '../../utils/format.js';
const sections={
 followup:['Seguimiento médico','Consultas relacionadas, evolución y próximos controles','Buscar tratamiento, paciente o estado'],
 tests:['Exámenes y resultados','Solicitudes, programación y resultados autorizados','Buscar examen, sede o estado'],
 locations:['Sedes y ubicación','Ubicación de hospitales, consultorios y laboratorios','Buscar sede o consultorio'],
 history:['Historial y documentos','Citas atendidas y resúmenes aprobados por un médico','Buscar fecha, médico o documento'],
 announcements:['Comunicados institucionales','Avisos oficiales, suspensiones y fechas de atención','Buscar comunicado o fecha'],
 profile:['Mi perfil','Datos de la cuenta y seguridad',''],
 agenda:['Mi agenda','Agenda de consultas del profesional','Buscar cita o paciente'],
 pending:['Citas pendientes','Atenciones que requieren intervención','Buscar paciente o fecha'],
 reviews:['Resúmenes por revisar','Documentos que requieren aprobación médica','Buscar paciente o resumen'],
 patients:['Pacientes','Directorio administrativo sin información clínica','Buscar paciente'],
 services:['Servicios y especialidades','Catálogo de servicios del centro','Buscar servicio'],
 blocks:['Bloqueos de atención','Restricciones de reserva por fechas y sedes','Buscar bloqueo'],
 reports:['Reportes','Estadísticas operativas agregadas','Buscar reporte'],
 permissions:['Usuarios y permisos','Gestión de roles y auditoría','Buscar usuario'],
 doctors:['Médicos','Directorio de profesionales y asignaciones','Buscar médico'],
 appointments:['Gestión de citas','Programación y reprogramación administrativa','Buscar cita']
};
export function placeholder(page,role){const [title,desc,search]=sections[page]||['Módulo en desarrollo','Disponible en una próxima fase',''];return heading(title,desc)+(search?searchBar(search):'')+empty('Módulo pendiente de integración',`Esta sección está preparada visualmente para el rol ${role}. Todavía no tiene endpoints ni datos reales. No se han modificado MongoDB ni las rutas existentes.`)}
