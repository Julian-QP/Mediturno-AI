// Parche de compatibilidad para Fase 8.1. No inspecciona los retornos de Gemini.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const root = process.cwd();
const rel = 'backend/src/services/aiServices.js';
const target = path.join(root, rel);
const helper = path.join(root, 'backend/src/services/summaryFormat81.js');
const signature = 'MEDITURNO_FASE81_WRAPPER_UNIVERSAL';
try {
  if (!fs.existsSync(target)) throw new Error(`No encuentro ${rel}. Ejecuta el instalador desde la raíz de mediturno.`);
  if (!fs.existsSync(helper)) throw new Error('Primero copia backend/src/services/summaryFormat81.js incluido en este ZIP.');
  const original = fs.readFileSync(target, 'utf8');
  if (original.includes(signature)) {
    console.log('✅ El parche universal ya está instalado. No se aplicaron cambios.');
    process.exit(0);
  }
  const draftDecl = /\bexport\s+async\s+function\s+draftSummary\s*\(/g;
  const pdfDecl = /\bexport\s+async\s+function\s+generatePdf\s*\(/g;
  const count = (regex) => [...original.matchAll(regex)].length;
  if (count(draftDecl) !== 1 || count(pdfDecl) !== 1) {
    throw new Error('No se reconocieron las dos funciones exportadas draftSummary y generatePdf exactamente una vez. No se modificó nada. Comparte aiServices.js para adaptarlo a tu versión.');
  }
  const next = `import {formatSummary as _fase81FormatSummary, renderStructuredPdf as _fase81RenderPdf} from './summaryFormat81.js'; // ${signature}\n`+
    original
      .replace(draftDecl, 'async function _fase81OriginalDraftSummary(')
      .replace(pdfDecl, 'async function _fase81OriginalGeneratePdf(') +
    `\n// Fase 8.1: conserva la lógica original (modelos, timeout y errores) y normaliza solo el resultado.\nexport async function draftSummary(...args) {\n  const result = await _fase81OriginalDraftSummary(...args);\n  return _fase81FormatSummary(result);\n}\n// PDF con encabezados tipográficos reales; la subida a Drive original no cambia.\nexport async function generatePdf(details) {\n  return _fase81RenderPdf(details);\n}\n`;
  // Validación completa ANTES de escribir el archivo original.
  const checkFile = target + '.fase81-check.mjs';
  try {
    fs.writeFileSync(checkFile, next);
    const syntax = spawnSync(process.execPath, ['--check', checkFile], {encoding:'utf8'});
    if (syntax.status !== 0) throw new Error(`La modificación no pasó la validación de sintaxis:\n${syntax.stderr}`);
    const helperSyntax = spawnSync(process.execPath, ['--check', helper], {encoding:'utf8'});
    if (helperSyntax.status !== 0) throw new Error(`El formateador contiene errores:\n${helperSyntax.stderr}`);
  } finally { fs.rmSync(checkFile, {force:true}); }
  const backup = target + '.bak-fase81-universal';
  if (fs.existsSync(backup)) throw new Error('Ya existe un respaldo .bak-fase81-universal. No sobrescribiré un respaldo anterior.');
  fs.copyFileSync(target, backup);
  try { fs.writeFileSync(target, next); }
  catch (error) { fs.copyFileSync(backup, target); throw error; }
  console.log('✅ Instalado: Gemini mantiene sus reintentos, el resumen se normaliza y PDFKit dibuja los encabezados.');
  console.log(`✅ Respaldo: ${rel}.bak-fase81-universal`);
  console.log('Reinicia el backend y genera un resumen NUEVO de prueba.');
} catch (error) {
  console.error(`❌ ${error.message}`);
  process.exitCode = 1;
}
