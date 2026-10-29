// Las claves privadas solo deben almacenarse en backend/.env.
export const externalApis = Object.freeze({
  assemblyAI: { apiKey: process.env.ASSEMBLYAI_API_KEY || '' },
  gemini: { apiKey: process.env.GEMINI_API_KEY || '' },
  googleDrive: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    redirectUri: process.env.GOOGLE_REDIRECT_URI || ''
  }
});
