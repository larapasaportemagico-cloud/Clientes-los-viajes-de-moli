export async function POST(request) {
  const { csv, dni } = await request.json();
  
  try {
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
