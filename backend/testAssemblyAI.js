
import 'dotenv/config';
import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

const API = 'https://api.assemblyai.com/v2';
const API_KEY = (process.env.ASSEMBLYAI_API_KEY || '').trim();

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function solicitud(ruta, opciones = {}) {
  const respuesta = await fetch(`${API}${ruta}`, {
    ...opciones,
    headers: {
      authorization: API_KEY,
      ...opciones.headers
    }
  });

  const datos = await respuesta.json().catch(() => ({}));

  if (!respuesta.ok) {
    const mensaje = datos.error || datos.message || 'Error desconocido';
    throw new Error(`HTTP ${respuesta.status}: ${mensaje}`);
  }

  return datos;
}

async function verificarClave() {
  console.log('\n1. VERIFICACIÓN DE CREDENCIALES');
  console.log('================================');

  if (!API_KEY) {
    throw new Error('Falta ASSEMBLYAI_API_KEY en backend/.env');
  }

  // Consultar la lista de transcripciones autentica la clave.
  await solicitud('/transcript?limit=1');

  console.log('✅ AssemblyAI: autenticación correcta');
}

async function transcribirArchivo(rutaAudio) {
  console.log('\n2. PRUEBA DE TRANSCRIPCIÓN');
  console.log('================================');

  const ruta = resolve(rutaAudio);
  const info = await stat(ruta);

  if (!info.isFile()) {
    throw new Error('La ruta indicada no es un archivo.');
  }

  if (info.size > 20 * 1024 * 1024) {
    throw new Error('Para esta prueba utiliza un audio menor a 20 MB.');
  }

  console.log('Subiendo audio de prueba...');

  const bytes = await readFile(ruta);

  const subida = await solicitud('/upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream'
    },
    body: bytes
  });

  if (!subida.upload_url) {
    throw new Error('No se recibió la URL del audio subido.');
  }

  console.log('✅ Audio subido correctamente');
  console.log('Solicitando transcripción en español...');

  const trabajo = await solicitud('/transcript', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      audio_url: subida.upload_url,
      language_code: 'es',
      speech_models: ['universal-3-pro', 'universal-2']
    })
  });

  if (!trabajo.id) {
    throw new Error('AssemblyAI no devolvió un identificador.');
  }

  console.log('Procesando transcripción...');

  for (let intento = 1; intento <= 40; intento++) {
    const resultado = await solicitud(`/transcript/${trabajo.id}`);

    if (resultado.status === 'completed') {
      console.log('\n✅ TRANSCRIPCIÓN COMPLETADA');
      console.log('Idioma:', resultado.language_code || 'es');
      console.log('Modelo:', resultado.speech_model_used || 'No indicado');
      console.log('\nTEXTO TRANSCRITO:');
      console.log(resultado.text || '(Sin texto detectado)');
      return;
    }

    if (resultado.status === 'error') {
      throw new Error(resultado.error || 'Falló la transcripción');
    }

    await sleep(3000);
  }

  console.log('⏳ La transcripción sigue en proceso.');
  console.log('ID de transcripción:', trabajo.id);
}

async function main() {
  console.log('================================');
  console.log(' MEDITURNO AI - TEST ASSEMBLYAI ');
  console.log('================================');

  try {
    await verificarClave();

    const audio = process.argv[2];

    if (audio) {
      await transcribirArchivo(audio);
    } else {
      console.log('\n✅ PRUEBA DE AUTENTICACIÓN SUPERADA');
      console.log('Para verificar audio, ejecuta:');
      console.log('node testAssemblyAI.js prueba.mp3');
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    process.exitCode = 1;
  }
}

main();
