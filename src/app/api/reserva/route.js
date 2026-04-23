cexport async function GET(request) {
  const { searchParams } = new URL(request.url);
  const dni = searchParams.get('dni')?.trim().toUpperCase();

  if (!dni) {
    return Response.json({ error: 'DNI requerido' }, { status: 400 });
  }

  try {
    const url = `https://script.google.com/macros/s/AKfycbzmGYYXhYPJeXfeqpcF6ZCRA5B4cc-_b08rJu2-7YyuZJ31d9SE4E3FXtej0Wr-tz-HiA/exec?dni=${encodeURIComponent(dni)}`;
    const res = await fetch(url, { cache: 'no-store' });
    const data = await res.json();
    return Response.json(data);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
