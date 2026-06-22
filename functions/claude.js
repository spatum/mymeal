export async function onRequest(context) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };

  // Gestione preflight CORS
  if (context.request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // Accetta solo POST
  if (context.request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Metodo non consentito" }), {
      status: 405, headers: corsHeaders
    });
  }

  try {
    const body = await context.request.json();
    const prompt = body.prompt;

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt mancante" }), {
        status: 400, headers: corsHeaders
      });
    }

    const apiKey = context.env.MYMEAL_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API Key non configurata" }), {
        status: 500, headers: corsHeaders
      });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: 200, headers: corsHeaders
    });

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: corsHeaders
    });
  }
}
