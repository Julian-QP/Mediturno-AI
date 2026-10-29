// MediTurno Fase 7.1: selector de coordenadas en el formulario de sedes existente.
import '../../styles/admin-map-picker71.css';

let mapsLoader;
function loadMaps(key) {
  if (window.google?.maps?.Map && window.google?.maps?.Geocoder) return Promise.resolve(window.google.maps);
  if (mapsLoader) return mapsLoader;
  mapsLoader = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&language=es&region=PE&loading=async&callback=__mediturnoMapsReady71`;
    s.async = true;
    window.__mediturnoMapsReady71 = () => { delete window.__mediturnoMapsReady71; resolve(window.google.maps); };
    s.onerror = () => { mapsLoader = null; reject(new Error('No se pudo cargar Google Maps. Revisa la clave y las APIs habilitadas.')); };
    document.head.appendChild(s);
  });
  return mapsLoader;
}

export async function attachAdminSiteMap71() {
  const form = document.getElementById('site-create-form');
  if (!form || form.dataset.map71 === 'attached') return;
  form.dataset.map71 = 'attached';
  const address = form.querySelector('[name="address"]');
  const district = form.querySelector('[name="district"]');
  if (!address) return;
  const area = document.createElement('section');
  area.className = 'site-map-picker71';
  area.innerHTML = `<div class="site-map-picker71-head"><strong>Elegir dirección en Google Maps</strong><small>Busca un lugar o pulsa sobre el mapa para seleccionar su ubicación.</small></div>
    <div class="site-map-picker71-search"><input type="search" placeholder="Ej. Av. Cusco 293, Cusco, Perú" aria-label="Buscar dirección en el mapa"><button class="btn-outline" type="button" data-map-search>Buscar en mapa</button></div>
    <div class="site-map-picker71-canvas" aria-label="Selector de ubicación en mapa"></div>
    <p class="site-map-picker71-state" role="status">Cargando selector de ubicación…</p>
    <div class="site-map-picker71-coords"><label>Latitud <input name="latitude" readonly placeholder="—"></label><label>Longitud <input name="longitude" readonly placeholder="—"></label></div>
    <button class="btn-outline" type="button" data-map-clear>Quitar ubicación seleccionada</button>`;
  const actions = form.querySelector('.modal-actions');
  if (actions) actions.before(area); else form.appendChild(area);
  const state = area.querySelector('.site-map-picker71-state');
  const search = area.querySelector('input[type="search"]');
  const latitude = area.querySelector('[name="latitude"]');
  const longitude = area.querySelector('[name="longitude"]');
  const setStatus = msg => { if (area.isConnected) state.textContent = msg; };
  const key = (import.meta.env.VITE_GOOGLE_MAPS_JS_KEY || '').trim();
  if (!key) {
    area.querySelector('.site-map-picker71-canvas').hidden = true;
    setStatus('Para seleccionar en el mapa, configura VITE_GOOGLE_MAPS_JS_KEY en frontend/.env. Puedes seguir escribiendo la dirección manualmente.');
    return;
  }
  try {
    const maps = await loadMaps(key);
    if (!form.isConnected) return;
    const center = {lat: -13.53195, lng: -71.96746};
    const map = new maps.Map(area.querySelector('.site-map-picker71-canvas'), {center, zoom: 13, mapTypeControl: false, streetViewControl: false});
    const marker = new maps.Marker({map, position: center, visible: false, draggable: true});
    const geocoder = new maps.Geocoder();
    function choose(pos, label) {
      const lat = typeof pos.lat === 'function' ? pos.lat() : pos.lat;
      const lng = typeof pos.lng === 'function' ? pos.lng() : pos.lng;
      latitude.value = Number(lat).toFixed(7);
      longitude.value = Number(lng).toFixed(7);
      marker.setPosition({lat, lng}); marker.setVisible(true);
      map.panTo({lat, lng});
      if (label) address.value = label.slice(0, 250);
      setStatus('Ubicación seleccionada. Comprueba la dirección antes de guardar la sede.');
    }
    async function reverse(location) {
      choose(location, '');
      setStatus('Buscando dirección del punto…');
      try {
        const response = await geocoder.geocode({location});
        if (response.results?.[0]) choose(location, response.results[0].formatted_address);
        else setStatus('Punto seleccionado, pero no se encontró dirección. Escríbela manualmente.');
      } catch (err) { setStatus('Punto seleccionado. No se pudo obtener la dirección: '+(err.message||err)); }
    }
    map.addListener('click', e => { if (e.latLng) void reverse(e.latLng); });
    marker.addListener('dragend', e => { if (e.latLng) void reverse(e.latLng); });
    async function lookup() {
      const query = (search.value || address.value || '').trim();
      if (!query) { setStatus('Escribe una dirección antes de buscar.'); return; }
      setStatus('Buscando dirección…');
      try {
        const response = await geocoder.geocode({address: query, region: 'pe'});
        if (!response.results?.[0]) { setStatus('Dirección no encontrada. Prueba una dirección más completa.'); return; }
        const found = response.results[0];
        choose(found.geometry.location, found.formatted_address);
        map.setZoom(17);
      } catch (err) { setStatus('Error de búsqueda: '+(err.message||err)); }
    }
    area.querySelector('[data-map-search]').addEventListener('click', () => void lookup());
    search.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); void lookup(); } });
    area.querySelector('[data-map-clear]').addEventListener('click', () => {
      latitude.value=''; longitude.value=''; marker.setVisible(false);
      setStatus('Coordenadas eliminadas. Puedes guardar la sede solamente con la dirección escrita.');
    });
    if (address.value) { search.value = address.value; void lookup(); }
    else setStatus('Mapa listo. Busca una dirección o haz clic para colocar el marcador.');
  } catch(err) { setStatus(err.message || 'Error al cargar el mapa.'); }
}
