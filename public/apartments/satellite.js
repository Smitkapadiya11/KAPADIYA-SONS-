export function satellite(dialog, data) {
  dialog.classList.add('gps-view');
  const center = [data.latitude, data.longitude];
  const projectAngle = 49;
  const initialZoom = () => innerWidth < 700 ? 17.9 : 18.5;
  const map = L.map('satellite', {
    rotate: true, bearing: -projectAngle, rotateControl: false, zoomControl: false,
    zoomSnap: 0.1, minZoom: 12, maxZoom: 21, zoomAnimation: false
  }).setView(center, initialZoom());
  const tiles = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Imagery © Esri, Maxar, Earthstar Geographics', maxNativeZoom: 19, maxZoom: 21
  }).addTo(map);

  const icon = L.divIcon({
    className: 'project-anchor', iconSize: [0, 0], iconAnchor: [0, 0],
    html: '<img class="project-art" src="site-plan.webp" alt=""><div class="project-pin"><b>K<span>&amp;</span>S</b><strong>PinYourSite</strong></div>'
  });
  const marker = L.marker(center, {icon, interactive: false, keyboard: false}).addTo(map);
  const anchor = marker.getElement();
  function positionArt() {
    const metresPerPixel = 156543.033928 * Math.cos(center[0] * Math.PI / 180) / 2 ** map.getZoom();
    const width = 355 / metresPerPixel;
    anchor.style.setProperty('--width', width + 'px');
    anchor.style.setProperty('--angle', (projectAngle + map.getBearing()) + 'deg');
    anchor.style.setProperty('--pin-y', -width * 0.29 + 'px');
  }
  positionArt();
  map.on('zoom rotate', positionArt);
  const actions = {
    reset() { map.setBearing(-projectAngle); map.setView(center, initialZoom()); },
    center() { map.panTo(center); },
    north() { map.setBearing(0); },
    plus() { map.zoomIn(); },
    minus() { map.zoomOut(); }
  };
  for (const button of dialog.querySelectorAll('[data-map-action]')) {
    button.onclick = actions[button.dataset.mapAction];
  }
  const status = dialog.querySelector('#tile-status');
  tiles.on('tileerror', () => { status.textContent = 'Some satellite imagery is unavailable.'; });
  const url = new URL(location.href);
  url.searchParams.set('map','true');
  history.replaceState(null,'',url);
  dialog.addEventListener('close', () => {
    map.remove();
    dialog.classList.remove('gps-view');
    const current = new URL(location.href);
    current.searchParams.delete('map');
    history.replaceState(null,'',current);
  }, {once:true});
}
