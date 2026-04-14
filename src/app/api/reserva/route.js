export async function POST(request) {
  const { dni } = await request.json();
  
  const SHEET_ID = "1zUnmMzaxoYI4jwfRBJ3vfvzjo5_dPPnML5L_XIRvMFA";
  const API_KEY = process.env.GOOGLE_API_KEY;
  
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/A:X?key=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    
    if (!data.values) {
      return Response.json({ encontrado: false });
    }
    
    const rows = data.values;
    const headers = rows[0];
    
    const clienteRow = rows.find((row, i) => {
      if (i === 0) return false;
      return row[0]?.toString().toUpperCase().trim() === dni.toUpperCase().trim();
    });
    
    if (!clienteRow) {
      return Response.json({ encontrado: false });
    }
    
    const cliente = {};
    headers.forEach((header, i) => {
      cliente[header] = clienteRow[i] || "";
    });
    
    return Response.json({ encontrado: true, datos: cliente });
  } catch (e) {
    return Response.json({ encontrado: false, error: e.message });
  }
}
