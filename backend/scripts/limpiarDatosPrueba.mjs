/**
 * MediTurno AI - Limpieza controlada antes de una demostracion o publicar codigo.
 * Mantiene users y doctors (perfiles vinculados a las cuentas medicas).
 * No elimina archivos en disco ni archivos de Google Drive.
 * Ejecute desde backend: node scripts/limpiarDatosPrueba.mjs
 * Para ejecutar realmente: node scripts/limpiarDatosPrueba.mjs --confirmar-borrado --db=NOMBRE_DE_LA_BASE
 */
import 'dotenv/config';
import mongoose from 'mongoose';

const WIPE_MODELS = [
  'AiSummary', 'Announcement', 'Appointment', 'AvailabilityBlock',
  'ClinicSite', 'ClinicalEncounter', 'ConsultationNote', 'Consultorio72',
  'DoctorShift', 'ExamOrder', 'LabBooking73', 'LabExamCatalog74',
  'LabSlot73', 'LiveRecording', 'TreatmentPlan'
];
const KEEP_MODELS = ['User', 'Doctor'];
const args = process.argv.slice(2);
const execute = args.includes('--confirmar-borrado');
const expectedDbName = args.find(x => x.startsWith('--db='))?.slice(5);
const dangerous = args.some(x => x.startsWith('--') && x !== '--confirmar-borrado' && !x.startsWith('--db='));
if (dangerous) throw new Error('Argumento desconocido; revisa los comandos del README.');

// No guardar ni imprimir el URI: puede contener credenciales.
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error('No se encontro MONGODB_URI en backend/.env');
if (execute && !expectedDbName) throw new Error('Para borrar, especifica --db=NOMBRE_EXACTO_DE_LA_BASE.');

let connected = false;
try {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  connected = true;
  const db = mongoose.connection.db;
  const dbName = db.databaseName;
  if (['admin','local','config'].includes(dbName)) throw new Error('Base reservada; limpieza bloqueada.');
  const collectionNames = new Set((await db.listCollections({}, { nameOnly: true }).toArray()).map(c=>c.name));
  const collectionName = name => mongoose.pluralize()(name.toLowerCase());
  const wipeNames = WIPE_MODELS.map(collectionName);
  const keepNames = KEEP_MODELS.map(collectionName);
  const unknown = [...collectionNames].filter(x => !wipeNames.includes(x) && !keepNames.includes(x) && !x.startsWith('system.'));
  const counts = [];
  for (const name of wipeNames) {
    counts.push({ collection:name, documents:collectionNames.has(name) ? await db.collection(name).countDocuments({}) : 0 });
  }
  const preserved = [];
  for (const name of keepNames) {
    preserved.push({ collection:name, documents:collectionNames.has(name) ? await db.collection(name).countDocuments({}) : 0 });
  }
  console.log(`\nBase seleccionada: ${dbName}`);
  console.log('\nSe conservaran estas colecciones:');
  console.table(preserved);
  console.log('\nColecciones operativas para limpiar:');
  console.table(counts);
  if (unknown.length) console.warn('\nATENCION: colecciones desconocidas NO se borraran:', unknown.join(', '));
  if (!execute) {
    console.log('\nSIMULACION: no se borro ningun documento.');
    console.log(`Tras realizar un respaldo, ejecuta: node scripts/limpiarDatosPrueba.mjs --confirmar-borrado --db=${dbName}`);
    process.exitCode = 0;
  } else {
    if (expectedDbName !== dbName) throw new Error(`La base actual (${dbName}) no coincide con --db=${expectedDbName}. Abortado.`);
    if (process.env.NODE_ENV === 'production') throw new Error('NODE_ENV=production: borrado bloqueado. Realiza esta limpieza en una base de demostracion.');
    if (unknown.length) throw new Error('Hay colecciones desconocidas: revisar manualmente antes de borrar.');
    console.log('\nEJECUTANDO BORRADO EN BASE DE DEMOSTRACION. Esta accion es irreversible sin backup.');
    // deleteMany mantiene colecciones e indices, a diferencia de dropDatabase().
    for (const { collection } of counts) {
      if (!collectionNames.has(collection)) continue;
      const result = await db.collection(collection).deleteMany({});
      console.log(`${collection}: ${result.deletedCount} documentos eliminados`);
    }
    console.log('\nLimpieza completada. Se conservaron users y doctors.');
    console.log('Las grabaciones locales, documentos de Drive y copias en el navegador NO se eliminaron.');
  }
} catch (err) {
  console.error('\nERROR:', err.message);
  process.exitCode = 1;
} finally {
  if (connected) await mongoose.disconnect();
}
