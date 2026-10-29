const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Solo insertar dentro de la ventana de una atención iniciada.
export function liveAiPanel(id,summary){
 const isSaved=!!summary?.transcript;
 return `<section class="ai-section live-ai" id="ai-section" data-appointment="${esc(id)}">
 <div class="ai-heading"><div><h3>🎙 Grabación de consulta</h3><p>El micrófono solo está disponible mientras esta atención está iniciada.</p></div><span class="tag ${isSaved?'success':'warning'}">${isSaved?'Grabación guardada':'Sin iniciar'}</span></div>
 ${isSaved?`<div class="alert"><strong>✅ Transcripción guardada.</strong> Finaliza la atención y entra a «Resúmenes por revisar» para escuchar el audio, revisar la transcripción y preparar el PDF.</div>`:
 `<div class="live-consent"><h4>Consentimiento previo</h4><label><input type="checkbox" id="live-consent-doctor"> El médico acepta grabar esta consulta ficticia</label><label><input type="checkbox" id="live-consent-patient"> El paciente dio consentimiento informado a grabar y transcribir</label><small>La grabación solo comienza tras confirmar ambos consentimientos.</small></div>
 <div class="live-recorder"><div class="live-recorder-heading"><span class="live-mic">🎤</span><div><strong>Micrófono y transcripción en directo</strong><p id="live-status" role="status">Listo para iniciar</p></div></div>
 <div class="live-buttons"><button class="btn" type="button" data-live-action="start" data-id="${esc(id)}">🎙 Iniciar grabación</button><button class="btn-outline" type="button" data-live-action="pause" disabled>⏸ Pausar</button><button class="btn-outline" type="button" data-live-action="stop" disabled>⏹ Detener y guardar</button></div><div class="live-transcript" aria-live="polite"><strong>Conversación en vivo</strong><pre id="live-final"></pre><div id="live-partial" class="live-partial">Las palabras aparecerán aquí...</div></div><button type="button" class="btn-outline" data-live-action="recover" data-id="${esc(id)}">↻ Recuperar grabación pendiente</button><small>Si la conexión se interrumpe, la copia temporal se conserva en ESTE navegador. No borres sus datos hasta sincronizarla.</small></div>`}
 </section>`;
}
