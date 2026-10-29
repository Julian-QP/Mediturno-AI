
import 'dotenv/config';

async function listarModelos() {
  const respuesta = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models',
    {
      headers: {
        'x-goog-api-key': process.env.GEMINI_API_KEY
      }
    }
  );

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    console.error('Error:', respuesta.status, datos.error?.message);
    return;
  }

  console.log('MODELOS DISPONIBLES PARA GEMINI:');

  const modelos = (datos.models || []).filter(
    modelo => modelo.supportedGenerationMethods?.includes('generateContent')
  );

  modelos.forEach(modelo => console.log(modelo.name));

  if (!modelos.length) {
    console.log('No se encontraron modelos compatibles.');
  }
}

listarModelos();
