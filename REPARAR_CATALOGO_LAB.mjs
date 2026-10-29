import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const rel = 'frontend/src/pages/shared/laboratorios73.js';
const file = path.join(root, rel);
const catalogFile = path.join(root, 'frontend/src/pages/shared/catalogo74.js');
if (!fs.existsSync(file) || !fs.existsSync(catalogFile)) {
  console.error('Faltan laboratorios73.js o catalogo74.js. No se modificó nada.');
  process.exit(1);
}
const previous = fs.readFileSync(file, 'utf8');
let src = previous;
const importLine = "import {catalogAdmin74,attachCatalogAdmin74,examCatalogOptions74} from './catalogo74.js'; // fix-lab-catalog-v1";
if (!src.includes("from './catalogo74.js'")) src = importLine + '\n' + src;
else {
  // A previous update might import only part of the required functions.
  src = src.replace(/^import\s*\{[^\n}]*\}\s*from\s*['"]\.\/catalogo74\.js['"];?[^\n]*$/m, importLine);
}
// Resolve the list inside the admin branch only; do not add overhead to patient/doctor views.
const adminMarker = "if(role==='admin'){";
if (!src.includes(adminMarker)) throw new Error('No se encontró el bloque del administrador; no se modificó nada.');
const start = src.indexOf(adminMarker);
const end = src.indexOf("} else if(role==='patient')", start);
if (end < 0) throw new Error('Estructura de panel incompatible: falta el bloque de paciente.');
let adminBody = src.slice(start, end);
if (!adminBody.includes('const catalog=await examCatalogOptions74();')) {
  adminBody = adminBody.replace(adminMarker, adminMarker + '\n  const catalog=await examCatalogOptions74();');
}
const oldInput = /<label>Nombre del examen<input\s+name="examType"[^>]*><\/label>/;
const newInput = `<label>Tipo de examen del catálogo<select name="examType" required><option value="">Seleccionar un examen activo</option>\${catalog.map(x=>\`<option value="\${esc(x.name)}">\${esc(x.name)}</option>\`).join('')}</select></label>`;
if (oldInput.test(adminBody)) adminBody = adminBody.replace(oldInput, newInput);
else if (!adminBody.includes('name="examType"') || !adminBody.includes('<select name="examType"')) {
  throw new Error('No se pudo identificar el campo del examen en el formulario de laboratorio. No se modificó nada.');
}
// Restore catalogue editor above scheduling card, even when later phases replaced the UI.
if (!adminBody.includes('catalogAdmin74()')) {
  if (adminBody.includes("body=card('Crear horario de laboratorio',")) {
    adminBody = adminBody.replace("body=card('Crear horario de laboratorio',", "body=(await catalogAdmin74())+card('Crear horario de laboratorio',");
  } else if (adminBody.includes("body=(await catalogAdmin74())+card('Crear horario de laboratorio',")) {
    // already installed
  } else throw new Error('No se encontró la tarjeta Crear horario de laboratorio; no se modificó nada.');
}
src = src.slice(0, start) + adminBody + src.slice(end);
const attachMarker = "export async function lab73Attach(role){";
if (!src.includes(attachMarker)) throw new Error('No se encuentra lab73Attach. No se modificó nada.');
const attachStart = src.indexOf(attachMarker);
const attachNext = src.slice(attachStart);
if (!attachNext.includes("attachCatalogAdmin74();")) {
  // The fragment is safe to execute after the host is established; attach function exits when host is missing.
  src = src.replace(attachMarker, attachMarker + "\n if(role==='admin')attachCatalogAdmin74();");
}
if (src === previous) {
  console.log('El catálogo y el formulario ya están integrados. No se hicieron cambios.');
  process.exit(0);
}
const scratch = file + '.tmp-labcat.mjs';
fs.writeFileSync(scratch, src);
const checked = spawnSync(process.execPath, ['--check', scratch], { encoding: 'utf8' });
if (checked.status !== 0) {
  fs.unlinkSync(scratch);
  console.error(checked.stderr || 'Error sintáctico');
  process.exit(1);
}
if (!process.argv.includes('--aplicar')) {
  fs.unlinkSync(scratch);
  console.log('SIMULACIÓN OK. Se restaurarán el catálogo y el selector de tipos de examen en la pantalla administrativa.');
  console.log('Archivo:', rel);
  console.log('Ejecuta: node REPARAR_CATALOGO_LAB.mjs --aplicar');
  process.exit(0);
}
const backup = file + '.bak-catalogo-lab';
if (!fs.existsSync(backup)) fs.copyFileSync(file, backup);
fs.renameSync(scratch, file);
console.log('CORREGIDO:', rel);
console.log('Respaldo:', path.relative(root, backup));
console.log('Reinicia Vite, prueba el administrador y sube los cambios a GitHub.');
