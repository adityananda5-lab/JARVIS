export async function POST(req) {
  try {
    const { text } = await req.json();

    if (!process.env.CARTESIA_API_KEY || !process.env.CARTESIA_VOICE_ID) {
      return Response.json(
        { error: "Server is missing CARTESIA_API_KEY or CARTESIA_VOICE_ID." },
        { status: 500 }
      );
    }

    const res = await fetch("https://api.cartesia.ai/tts/bytes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cartesia-Version": "2026-03-01",
        Authorization: `Bearer ${process.env.CARTESIA_API_KEY}`,
      },
      body: JSON.stringify({
        model_id: "sonic-3.5",
        transcript: text,
        voice: { mode: "id", id: process.env.CARTESIA_VOICE_ID },
        output_format: { container: "wav", encoding: "pcm_s16le", sample_rate: 44100 },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(errText);
      let detail = errText;
      try {
        const parsed = JSON.parse(errText);
        detail = parsed.message || parsed.error || errText;
      } catch {
        // errText wasn't JSON — use it as-is
      }
      return Response.json(
        { error: `Cartesia error (${res.status}): ${detail}` },
        { status: 500 }
      );
    }

    const audioBuffer = await res.arrayBuffer();

    return new Response(audioBuffer, {
      headers: { "Content-Type": "audio/wav" },
    });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Something went wrong generating speech." }, { status: 500 });
  }
}
