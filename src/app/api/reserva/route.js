export async function POST(request) {
  const { dni } = await request.json();
  
  const SHEET_ID = "1zUnmMzaxoYI4jwfRBJ3vfvzjo5_dPPnML5L_XIRvMFA";
  const GID = "1569558318";
  
  try {
    const url = `https://corsproxy.io/?https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`;
    const res = await fetch(url);
    const csv = await res.text();
    
    const rows = csv.split("\n").map(row => {
      const result = [];
      let inQuotes = false;
      let current = "";
      for (const char of row) {
        if (char === '"') { inQuotes = !inQuotes; }
        else if (char === "," && !inQuotes) { result.push(current.trim()); current = ""; }
        else { current += char; }
      }
      result.push(current.trim());
      return result;
    });
    
    if (rows.length < 2) return Response.json({ encontrado: false });
    
    const headers = rows[0];
    const clienteRow = rows.find((row, i) => {
      if (i === 0) return false;
      return row[0]?.toString().toUpperCase().trim() === dni.toUpperCase().trim();
    });
    
    if (!clienteRow) return Response.json({ encontrado: false });
    
    const cliente = {};
    headers.forEach((header, i) => {
      cliente[header] = clienteRow[i] || "";
    });
    
    return Response.json({ encontrado: true, datos: cliente });
  } catch (e) {
    return Response.json({ encontrado: false, error: e.message });
  }
}
