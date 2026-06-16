export async function POST(request) {
  try {
    const { messages, system } = await request.json();
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 2000,
        system,
        messages,
      }),
    });
    const data = await response.json();
    if (data.error) {
      console.error("Anthropic API error:", JSON.stringify(data.error));
      return Response.json({ content: [{ text: "Lo siento, ha habido un error temporal. Por favor, escribe tu pregunta directamente y te responderé enseguida 🪄" }] });
    }
    return Response.json(data);
  } catch (err) {
    console.error("Chat route error:", err);
    return Response.json({ content: [{ text: "Error de conexión. Escribe tu pregunta y lo intentamos de nuevo." }] });
  }
}
