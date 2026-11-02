export function satellite(dialog, data) {
  dialog.classList.add('gps-view');
  const center = [data.latitude, data.longitude];
  const map = L.map('satellite', { minZoom: 12, maxZoom: 21, zoomSnap: 0.1 }).setView(center, innerWidth < 700 ? 17.9 : 18.1);
  const tiles = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Imagery © Esri, Maxar, Earthstar Geographics', maxNativeZoom: 19, maxZoom: 21
  }).addTo(map);
  const overlay = document.createElement('img');
  overlay.className = 'site-overlay';
  overlay.alt = 'Project boundary and site plan';
  overlay.src = 'satellite.webp';
  map.getPanes().overlayPane.append(overlay);
  function position() {
    const point = map.latLngToLayerPoint(center);
    const pixelsPerMeter = Math.abs(point.y - map.latLngToLayerPoint([center[0] + 0.001, center[1]]).y) / 110.7;
    const width = 355 * pixelsPerMeter;
    Object.assign(overlay.style, { width: width+'px', left: point.x+'px', top: point.y+'px', transform:'translate(-50%,-50%) rotate(49deg)' });
  }
  position();
  map.on('zoom move viewreset', position);
  tiles.on('tileerror', () => document.querySelector('#tile-status').textContent='Some satellite tiles could not load.');
  requestAnimationFrame(()=>{map.invalidateSize();position()});
  dialog.addEventListener('close',()=>{map.remove();dialog.classList.remove('gps-view')},{once:true});
}
