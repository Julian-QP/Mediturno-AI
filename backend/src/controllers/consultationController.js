// Solo endpoint informativo en esta fase: no se procesan audios ni datos clínicos.
export function consultationStatus(_req, res) {
  res.json({
    module: 'MediTurno AI',
    status: 'planned',
    requiredExternalApis: ['AssemblyAI','Gemini API','Google Drive API'],
    optionalLocalTools: ['Whisper','Ollama'],
    warning: 'Usar exclusivamente consultas ficticias durante el desarrollo.'
  });
}
