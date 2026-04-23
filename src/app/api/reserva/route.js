export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const dni = searchParams.get('dni')?.trim().toUpperCase();

  if (!dni) {
    return Response.json({ error: 'DNI requerido' }, { status: 400 });
  }

  try {
    const csvUrl = `https://docs.google.com/spreadsheets/d/1zUnmMzaxoYI4jwfRBJ3vfvzjo5_dPPnML5L_XIRvMFA/export?format=csv&gid=1569558318`;
    
    const res = await fetch(csvUrl, { cache: 'no-store' });
    if (!res.ok) throw new Error('No se pudo leer el Sheet');
    
    const text = await res.text();
    const rows = text.split('\n').map(r => r.split(','));
    const headers = rows[0].map(h => h.trim().replace(/"/g, ''));

    const codigoCol = headers.findIndex(h => 
      h.toUpperCase().includes('CODIGO') || h.toUpperCase().includes('DNI')
    );

    const match = rows.slice(1).find(row => {
      const val = (row[codigoCol] || '').trim().replace(/"/g, '').toUpperCase();
      return val === dni;
    });

    if (!match) {
      return Response.json({ encontrado: false });
    }

    const reserva = {};
    headers.forEach((h, i) => {
      reserva[h] = (match[i] || '').trim().replace(/"/g, '');
    });

    return Response.json({ encontrado: true, reserva });

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
