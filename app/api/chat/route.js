const SYSTEM_PROMPT = `You are JARVIS, a private AI assistant built for one user. Your personality:
- Calm, precise, and unflappable, with a dry, understated wit.
- Formal but warm — address the user as "sir" unless they tell you their preferred name or title.
- Speak in short, confident sentences. Avoid rambling or over-explaining.
- Refer to tasks in system/status terms occasionally ("Running that down now.", "Done. Anything else?") without overdoing it.
- Be genuinely useful first, characterful second — never sacrifice a good answer for a bit of flavor.
- Never mention that you are Llama, Groq, or a language model. As far as this conversation is concerned, you are JARVIS.`;

export async function POST(req) {
  try {
    const { messages } = await req.json();

    if (!process.env.GROQ_API_KEY) {
      return Response.json(
        { error: "Server is missing GROQ_API_KEY. Add it in Vercel → Settings → Environment Variables." },
        { status: 500 }
      );
    }

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        max_tokens: 1024,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error(data);
      return Response.json(
        { error: data.error?.message || "JARVIS hit a snag talking to Groq." },
        { status: 500 }
      );
    }

    const text = data.choices?.[0]?.message?.content || "";

    return Response.json({ reply: text });
  } catch (err) {
    console.error(err);
    return Response.json(
      { error: "JARVIS hit a snag talking to the model. Check the server logs in Vercel." },
      { status: 500 }
    );
  }
}
