export async function POST(request) {
  const { dni } = await request.json();
  
  try {
    const res = await fetch("https://n8n-production-23c3.up.railway.app/webhook/a2684f59-a8ad-4c5c-8a0b-2be1b2dfda69", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dni }),
    });
    
    const data = await res.json();
    
    if (!data || (Array.isArray(data) && data.length === 0)) {
      return Response.json({ encontrado: false });
    }
    
    // n8n puede devolver array o objeto directo
    const raw = Array.isArray(data) ? data[0] : data;
    // Los datos pueden estar en raw.json o directamente en raw
    const cliente = raw?.json || raw;
    
    return Response.json({ encontrado: true, datos: cliente });
  } catch (e) {
    return Response.json({ encontrado: false, error: e.message });
  }
}
