
import 'dotenv/config';
import { google } from 'googleapis';

const LINEA = '========================================';

function variable(nombre) {
  return (process.env[nombre] || '').trim();
}

function mostrarError(servicio, error) {
  console.log(`❌ ${servicio}: error de conexión`);

  const codigo =
    error.response?.status ||
    error.status ||
    error.code ||
    'Desconocido';

  console.log('Código:', codigo);

  const mensaje =
    error.response?.data?.error?.message ||
    error.message ||
    'Error desconocido';

  console.log('Detalle:', mensaje);
}

// ========================================
// 1. VERIFICAR CONFIGURACIÓN
// ========================================

function verificarConfiguracion() {
  console.log('\n📋 VERIFICANDO VARIABLES DEL .env');
  console.log(LINEA);

  const variables = [
    'GEMINI_API_KEY',
    'GEMINI_MODEL',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GOOGLE_DRIVE_REFRESH_TOKEN'
  ];

  for (const nombre of variables) {
    const valor = variable(nombre);

    if (valor) {
      console.log(`✅ ${nombre}: configurada`);
    } else {
      console.log(`❌ ${nombre}: no configurada`);
    }
  }

  console.log(
    '\nModelo seleccionado:',
    variable('GEMINI_MODEL') || 'gemini-2.5-flash (predeterminado)'
  );
}

// ========================================
// 2. VERIFICAR GOOGLE GEMINI
// ========================================

async function verificarGemini() {
  console.log('\n🤖 VERIFICANDO GOOGLE GEMINI');
  console.log(LINEA);

  try {
    const apiKey = variable('GEMINI_API_KEY');

    const modelo = (
      variable('GEMINI_MODEL') || 'gemini-2.5-flash'
    ).replace(/^models\//, '');

    if (!apiKey) {
      throw new Error(
        'Falta GEMINI_API_KEY en el archivo .env'
      );
    }

    console.log('Modelo utilizado:', modelo);
    console.log('Conectando con Gemini...');

    const url =
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelo)}:generateContent`;

    const respuesta = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: 'Responde solamente: MediTurno AI conectado correctamente'
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0,
          maxOutputTokens: 100
        }
      })
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
      const mensaje =
        datos.error?.message ||
        'La API devolvió un error desconocido';

      throw new Error(
        `HTTP ${respuesta.status}: ${mensaje}`
      );
    }

    const texto = (
      datos.candidates?.[0]?.content?.parts || []
    )
      .map(parte => parte.text || '')
      .join('')
      .trim();

    if (!texto) {
      throw new Error(
        'Gemini respondió, pero no devolvió texto. ' +
        `Motivo: ${datos.candidates?.[0]?.finishReason || 'desconocido'}`
      );
    }

    console.log('✅ GEMINI CONECTADO CORRECTAMENTE');
    console.log('Respuesta:', texto);

    return true;

  } catch (error) {
    mostrarError('Gemini', error);

    console.log(
      'Sugerencia: verifica GEMINI_API_KEY y GEMINI_MODEL.'
    );

    return false;
  }
}

// ========================================
// 3. VERIFICAR GOOGLE DRIVE
// ========================================

async function verificarDrive() {
  console.log('\n☁️ VERIFICANDO GOOGLE DRIVE');
  console.log(LINEA);

  try {
    const clientId = variable('GOOGLE_CLIENT_ID');
    const clientSecret = variable('GOOGLE_CLIENT_SECRET');
    const refreshToken = variable('GOOGLE_DRIVE_REFRESH_TOKEN');

    if (!clientId || !clientSecret || !refreshToken) {
      throw new Error(
        'Faltan credenciales OAuth de Google Drive en el .env'
      );
    }

    const auth = new google.auth.OAuth2(
      clientId,
      clientSecret
    );

    auth.setCredentials({
      refresh_token: refreshToken
    });

    console.log('Verificando autenticación OAuth...');

    // Verifica que Google pueda renovar el token.
    const token = await auth.getAccessToken();

    if (!token.token) {
      throw new Error(
        'Google no devolvió un token de acceso'
      );
    }

    console.log('✅ Autenticación OAuth correcta');

    const drive = google.drive({
      version: 'v3',
      auth
    });

    const resultado = await drive.about.get({
      fields: 'user(displayName)'
    });

    console.log('✅ GOOGLE DRIVE CONECTADO CORRECTAMENTE');
    console.log(
      'Cuenta autorizada:',
      resultado.data.user?.displayName || 'Cuenta verificada'
    );

    console.log(
      'ℹ️ La subida de archivos PDF todavía debe probarse.'
    );

    return true;

  } catch (error) {
    mostrarError('Google Drive', error);

    console.log(
      'Sugerencia: revisa Client ID, Client Secret, ' +
      'Refresh Token y permisos OAuth.'
    );

    return false;
  }
}

// ========================================
// 4. EJECUTAR TODAS LAS VERIFICACIONES
// ========================================

async function main() {
  console.log('\n' + LINEA);
  console.log(' MEDI TURNO AI - PRUEBA DE APIS GOOGLE ');
  console.log(LINEA);

  verificarConfiguracion();

  const [geminiOK, driveOK] = await Promise.all([
    verificarGemini(),
    verificarDrive()
  ]);

  console.log('\n' + LINEA);
  console.log(' RESUMEN FINAL ');
  console.log(LINEA);

  console.log(
    `Google Gemini: ${geminiOK ? '✅ FUNCIONANDO' : '❌ ERROR'}`
  );

  console.log(
    `Google Drive:  ${driveOK ? '✅ FUNCIONANDO' : '❌ ERROR'}`
  );

  if (geminiOK && driveOK) {
    console.log('\n🎉 ¡LAS DOS CONEXIONES FUNCIONAN!');
    console.log(
      'Puedes continuar con las pruebas del asistente MediTurno AI.'
    );
  } else {
    console.log(
      '\n⚠️ Hay servicios que necesitan corrección.'
    );
  }

  console.log(LINEA);

  if (!geminiOK || !driveOK) {
    process.exitCode = 1;
  }
}

main().catch(error => {
  console.error('Error inesperado:', error.message);
  process.exitCode = 1;
});
