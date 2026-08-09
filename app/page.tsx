"use client";

import { useEffect, useRef, useState } from "react";

const BOOT_LINES = [
  { text: "INITIALIZING J.A.R.V.I.S. CORE...", dim: false },
  { text: "loading language subsystem", dim: true },
  { text: "calibrating voice interface", dim: true },
  { text: "ALL SYSTEMS NOMINAL", dim: false },
];

function rand(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

const PARTICLES = Array.from({ length: 80 }).map((_, i) => {
  const angle = i * 137.508 * (Math.PI / 180);
  const radius = 26 + rand(i * 12.9898) * 34;
  const size = 0.4 + rand(i * 7.233) * 0.7;
  const opacity = 0.3 + rand(i * 3.71) * 0.7;
  return {
    x: 50 + radius * Math.cos(angle),
    y: 50 + radius * Math.sin(angle),
    size,
    opacity,
    delay: (i % 10) * 0.25,
  };
});

const RAYS = Array.from({ length: 24 }).map((_, i) => {
  const angle = rand(i * 91.7) * 360;
  const length = 40 + rand(i * 4.51) * 35;
  return { angle, length };
});

function makeMesh(count: number, seedOffset: number) {
  return Array.from({ length: count }).map((_, i) => {
    const s = i + seedOffset;
    const a1 = rand(s * 12.9898) * 360;
    const spread = 80 + rand(s * 78.233) * 260;
    const a2 = a1 + spread;
    const r1 = 20 + rand(s * 45.164) * 26;
    const r2 = 20 + rand(s * 91.345) * 26;
    const x1 = 50 + r1 * Math.cos((a1 * Math.PI) / 180);
    const y1 = 50 + r1 * Math.sin((a1 * Math.PI) / 180);
    const x2 = 50 + r2 * Math.cos((a2 * Math.PI) / 180);
    const y2 = 50 + r2 * Math.sin((a2 * Math.PI) / 180);

    const c1Angle = rand(s * 17.91) * 360;
    const c1Radius = 6 + rand(s * 61.3) * 45;
    const c2Angle = rand(s * 29.44) * 360;
    const c2Radius = 6 + rand(s * 8.77) * 45;
    const c1x = 50 + c1Radius * Math.cos((c1Angle * Math.PI) / 180);
    const c1y = 50 + c1Radius * Math.sin((c1Angle * Math.PI) / 180);
    const c2x = 50 + c2Radius * Math.cos((c2Angle * Math.PI) / 180);
    const c2y = 50 + c2Radius * Math.sin((c2Angle * Math.PI) / 180);

    return {
      d: `M${x1.toFixed(2)},${y1.toFixed(2)} C${c1x.toFixed(
        2
      )},${c1y.toFixed(2)} ${c2x.toFixed(2)},${c2y.toFixed(
        2
      )} ${x2.toFixed(2)},${y2.toFixed(2)}`,
      opacity: 0.4 + rand(s * 17.34) * 0.5,
      width: 0.7 + rand(s * 3.14) * 0.7,
    };
  });
}

const MESH_A = makeMesh(60, 1);
const MESH_B = makeMesh(60, 500);

function Core({ thinking }: { thinking: boolean }) {
  return (
    <div className={`core${thinking ? " thinking" : ""}`}>
      <svg viewBox="0 0 100 100">
        <defs>
          <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="20%" stopColor="#fff8e5" />
            <stop offset="45%" stopColor="#ffd27a" />
            <stop offset="70%" stopColor="#ff9b2f" />
            <stop offset="100%" stopColor="#ff7a18" stopOpacity="0" />
          </radialGradient>
          <filter id="softBlur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.4" />
          </filter>
        </defs>

        <g className="particles">
          {PARTICLES.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={p.size}
              fill="var(--gold-bright)"
              opacity={p.opacity}
              style={{ animationDelay: `${p.delay}s` }}
              className="particle"
            />
          ))}
        </g>

        <g className="mesh-a">
          {MESH_A.map((m, i) => (
            <path
              key={i}
              d={m.d}
              fill="none"
              stroke="var(--ember)"
              strokeWidth={m.width}
              opacity={m.opacity}
              strokeLinecap="round"
            />
          ))}
        </g>

        <g className="mesh-b">
          {MESH_B.map((m, i) => (
            <path
              key={i}
              d={m.d}
              fill="none"
              stroke="var(--gold-bright)"
              strokeWidth={m.width}
              opacity={m.opacity}
              strokeLinecap="round"
            />
          ))}
        </g>

        <g className="streaks">
          {RAYS.map((r, i) => (
            <line
              key={i}
              x1="50"
              y1="50"
              x2={50 + r.length * Math.cos((r.angle * Math.PI) / 180)}
              y2={50 + r.length * Math.sin((r.angle * Math.PI) / 180)}
              stroke="var(--gold-bright)"
              strokeWidth="0.7"
              opacity="0.65"
              strokeLinecap="round"
            />
          ))}
        </g>

        <g className="core-glow">
          <circle cx="50" cy="50" r="23" fill="url(#coreGlow)" />
          <circle
            cx="50"
            cy="50"
            r="5"
            fill="#ffffff"
            filter="url(#softBlur)"
          />
        </g>
      </svg>
    </div>
  );
}

type Msg = { role: "user" | "assistant"; content: string; error?: boolean };

export default function Home() {
  const [booted, setBooted] = useState(false);
  const [visibleBootLines, setVisibleBootLines] = useState(0);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content: "Good to see you. Systems are online — how can I help?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [voiceOn, setVoiceOn] = useState(false);
  const [listening, setListening] = useState(false);
  const logRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (visibleBootLines < BOOT_LINES.length) {
      const t = setTimeout(
        () => setVisibleBootLines((n) => n + 1),
        380
      );
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setBooted(true), 600);
    return () => clearTimeout(t);
  }, [visibleBootLines]);

  useEffect(() => {
    logRef.current?.scrollTo({
      top: logRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  useEffect(() => {
    const SpeechRecognition =
      typeof window !== "undefined" &&
      ((window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition);
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
    };
    recognition.onerror = (e: any) => {
      setListening(false);
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
  }, []);

  function toggleMic() {
    if (!recognitionRef.current) {
      alert(
        "Voice input isn't supported in this browser. Try Chrome or Edge."
      );
      return;
    }
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setListening(true);
      } catch {
        setListening(false);
      }
    }
  }

  async function speak(text: string) {
    if (!voiceOn) return;
    try {
      const res = await fetch("/api/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) return;
      const audioBlob = await res.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
    } catch {
      // ignore
    }
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;
    const nextMessages: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const data = await res.json();

      if (!res.ok || !data.reply) {
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content: data.error || "Something went wrong.",
            error: true,
          },
        ]);
      } else {
        setMessages((m) => [
          ...m,
          { role: "assistant", content: data.reply },
        ]);
        speak(data.reply);
      }
    } catch (err) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: "I couldn't reach the server. Check your connection.",
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  if (!booted) {
    return (
      <div className="boot-screen">
        {BOOT_LINES.slice(0, visibleBootLines).map((line, i) => (
          <div
            key={i}
            className={`boot-line${line.dim ? " dim" : ""}`}
          >
            {line.text}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="app">
      <div className="header">
        <div className="title-block">
          <div className="wordmark">J.A.R.V.I.S.</div>
          <div className="status-line">
            <span className="status-dot" />
            {loading ? "PROCESSING" : "ONLINE"}
          </div>
        </div>
        <button
          className={`voice-toggle${voiceOn ? " active" : ""}`}
          onClick={() => setVoiceOn((v) => !v)}
        >
          VOICE {voiceOn ? "ON" : "OFF"}
        </button>
      </div>

      <div className="core-stage">
        <Core thinking={loading} />
      </div>

      <div className="log" ref={logRef}>
        {messages.map((m, i) => (
          <div
            key={i}
            className={`msg-row ${m.role}`}
          >
            <div className="msg-label">
              {m.role === "user" ? "YOU" : "JARVIS"}
            </div>
            <div className={`bubble${m.error ? " error" : ""}`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="msg-row assistant">
            <div className="msg-label">JARVIS</div>
            <div className="bubble thinking-row">
              <span />
              <span />
              <span />
            </div>
          </div>
        )}
      </div>

      <div className="input-bar">
        <button
          className={`icon-btn mic${listening ? " listening" : ""}`}
          onClick={toggleMic}
          title="Voice input"
        >
          🎙
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Speak, and I shall listen..."
          disabled={loading}
        />
        <button
          className="icon-btn send"
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          title="Send"
        >
          ➤
        </button>
      </div>
    </div>
  );
}
