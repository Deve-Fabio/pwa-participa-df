/* mapa.js — módulo simples do mapa (Leaflet + Nominatim)
   - Não depende do restante do app, só de IDs do HTML
   - Exige Leaflet (L) carregado antes deste arquivo
*/
(() => {
  // utilitário local (não conflita com o $ do app.js)
  const byId = (id) => document.getElementById(id);

  let leafletMap = null;
  let leafletMarker = null;

  function setMapStatus(msg) {
    const el = byId("mapStatus");
    if (el) el.textContent = msg || "";
  }

  function fillHiddenFields({ lat, lng, endereco }) {
    const latEl = byId("localLat");
    const lngEl = byId("localLng");
    const endEl = byId("localEndereco");

    if (latEl) latEl.value = String(lat);
    if (lngEl) lngEl.value = String(lng);
    if (endEl) endEl.value = endereco || "";
  }

  function fillVisibleLocalField({ lat, lng, endereco }) {
    const localInput = byId("local");
    if (!localInput) return;

    const linha1 = endereco ? endereco : "Local selecionado no mapa";
    localInput.value = `${linha1}\nCoordenadas: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }

  async function reverseGeocodeNominatim(lat, lng) {
    const url =
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2` +
      `&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}` +
      `&accept-language=pt-BR`;

    const res = await fetch(url, { headers: { "Accept": "application/json" } });
    if (!res.ok) return "";
    const data = await res.json();
    return data?.display_name || "";
  }

  function openDialog() {
    const dlg = byId("dlgMapaLocal");
    if (!dlg) return;

    if (typeof dlg.showModal === "function") dlg.showModal();
    else dlg.setAttribute("open", "open");

    if (!leafletMap) {
      const defaultCenter = [-15.793889, -47.882778]; // Brasília
      leafletMap = L.map("map").setView(defaultCenter, 12);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap"
      }).addTo(leafletMap);

      leafletMap.on("click", async (e) => {
        const { lat, lng } = e.latlng;

        if (!leafletMarker) leafletMarker = L.marker([lat, lng]).addTo(leafletMap);
        else leafletMarker.setLatLng([lat, lng]);

        setMapStatus("Buscando endereço (se disponível)…");

        let endereco = "";
        try {
          endereco = await reverseGeocodeNominatim(lat, lng);
        } catch {
          endereco = "";
        }

        fillHiddenFields({ lat, lng, endereco });
        fillVisibleLocalField({ lat, lng, endereco });
        setMapStatus(endereco ? "Endereço aplicado." : "Coordenadas aplicadas (endereço indisponível).");

        // Dispara um evento para o app.js (opcional)
        window.dispatchEvent(new CustomEvent("mapa:selecionado", {
          detail: { lat, lng, endereco }
        }));
      });
    }

    setTimeout(() => leafletMap.invalidateSize(), 50);
    setMapStatus("Clique no mapa para selecionar o local.");
  }

  function closeDialog() {
    const dlg = byId("dlgMapaLocal");
    if (!dlg) return;
    if (typeof dlg.close === "function") dlg.close();
    else dlg.removeAttribute("open");
    setMapStatus("");
  }

  function centerOnUser() {
    if (!navigator.geolocation) {
      setMapStatus("Geolocalização não suportada.");
      return;
    }
    setMapStatus("Obtendo localização…");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        leafletMap?.setView([lat, lng], 16);
        setMapStatus("Localização centralizada. Clique no mapa para selecionar um ponto.");
      },
      () => {
        setMapStatus("Permissão negada ou indisponível.");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  // Inicializa botões (chamado pelo app.js ou automaticamente)
  function initMapUI() {
    byId("btnMapaLocal")?.addEventListener("click", openDialog);
    byId("btnFecharMapaLocal")?.addEventListener("click", closeDialog);
    byId("btnCentralizarUsuario")?.addEventListener("click", centerOnUser);
  }

  // expõe uma API pequena (se o app.js quiser chamar)
  window.MapaLocal = { initMapUI, openDialog, closeDialog, centerOnUser };
})();
