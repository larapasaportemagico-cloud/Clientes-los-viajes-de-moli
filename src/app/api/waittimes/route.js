// src/app/api/waittimes/route.js
// Proxy para la API pública de tiempos de espera de Disneyland Paris
// Evita problemas de CORS llamando desde el servidor de Next.js

// IDs de los parques en ThemeParks.wiki
const PARK_IDS = {
  dlp: "dae968d5-630d-4719-8b06-3d107e944401",  // Disneyland Park
  daw: "ca888437-ebb4-4d50-aed2-d227f7096968",  // Disney Adventure World (ex Walt Disney Studios)
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const parque = searchParams.get("parque") || "dlp";

  const parkId = PARK_IDS[parque] || PARK_IDS.dlp;
  const url = `https://api.themeparks.wiki/v1/entity/${parkId}/live`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 60 }, // cache 60 segundos
      headers: { "Accept": "application/json" },
    });

    if (!res.ok) {
      return Response.json({ ok: false, error: "API no disponible" }, { status: 200 });
    }

    const data = await res.json();

    // Filtrar solo atracciones y normalizar datos
    const atracciones = (data.liveData || [])
      .filter(item => item.entityType === "ATTRACTION")
      .map(item => ({
        id: item.id,
        nombre: item.name,
        status: item.status, // OPERATING, DOWN, CLOSED, REFURBISHMENT
        waitTime: item.queue?.STANDBY?.waitTime ?? null, // minutos o null
        singleRider: item.queue?.SINGLE_RIDER?.waitTime ?? null,
        ultimaActualizacion: item.lastUpdated || null,
      }));

    return Response.json({
      ok: true,
      parque,
      total: atracciones.length,
      atracciones,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    return Response.json({
      ok: false,
      error: "Error al conectar con la API",
      detalle: error.message,
    }, { status: 200 }); // 200 para que el cliente maneje el fallback
  }
}
