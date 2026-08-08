"use client";

import { useEffect, useRef, useState } from "react";

const BOOT_LINES = [
  { text: "INITIALIZING J.A.R.V.I.S. CORE...", dim: false },
  { text: "loading language subsystem", dim: true },
  { text: "calibrating voice interface", dim: true },
  { text: "ALL SYSTEMS NOMINAL", dim: false },
];

// Deterministic pseudo-random generator — same output every render, client and server,
// so nothing shifts or mismatches after the page loads
function rand(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Scattered dust particles floating around the sphere
const PARTICLES = Array.from({ length: 50 }).map((_, i) => {
  const angle = i * 137.508 * (Math.PI / 180);
  const radius = 28 + rand(i * 12.9898) * 32;
  const size = 0.3 + rand(i * 7.233) * 0.5;
  const opacity = 0.2 + rand(i * 3.71) * 0.6;
  return {
    x: 50 + radius * Math.cos(angle),
    y: 50 + radius * Math.sin(angle),
    size,
    opacity,
    delay: (i % 10) * 0.3,
  };
});

// Long straight spikes radiating outward, some poking past the sphere's edge
const RAYS = Array.from({ length: 20 }).map((_, i) => {
  const angle = rand(i * 91.7) * 360;
  const length = 34 + rand(i * 4.51) * 26;
  return { angle, length };
});

// Dense tangle of curved chords crossing through the sphere — this is what
// gives it that chaotic "scribbled energy ball" texture instead of clean rings
function makeMesh(count, seedOffset) {
  return Array.from({ length: count }).map((_, i) => {
    const s = i + seedOffset;
    const a1 = rand(s * 12.9898) * 360;
    const spread = 70 + rand(s * 78.233) * 220;
    const a2 = a1 + spread;
    const r1 = 24 + rand(s * 45.164) * 22;
    const r2 = 24 + rand(s * 91.345) * 22;
    const curveAngle = rand(s * 33.71) * 360;
    const curveRadius = rand(s * 5.23) * 24;
    const x1 = 50 + r1 * Math.cos((a1 * Math.PI) / 180);
    const y1 = 50 + r1 * Math.sin((a1 * Math.PI) / 180);
    const x2 = 50 + r2 * Math.cos((a2 * Math.PI) / 180);
    const y2 = 50 + r2 * Math.sin((a2 * Math.PI) / 180);
    const cx = 50 + curveRadius * Math.cos((curveAngle * Math.PI) / 180);
    const cy = 50 + curveRadius * Math.sin((curveAngle * Math.PI) / 180);
    return {
      d: `M${x1.toFixed(2)},${y1.toFixed(2)} Q${cx.toFixed(2)},${cy.toFixed(2)} ${x2.toFixed(2)},${y2.toFixed(2)}`,
      opacity: 0.15 + rand(s * 17.34) * 0.35,
      width: 0.25 + rand(s * 3.14) * 0.3,
    };
  });
}

const MESH_A = makeMesh(30, 1);
const MESH_B = makeMesh(30, 500);

function Core({ thinking }) {
  return (
    <div className={`core${thinking ? " thinking" : ""}`}>
      <svg viewBox="0 0 100 100">
        <defs>
          <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="25%" stopColor="#fff4e0" />
            <stop offset="50%" stopColor="var(--gold-bright)" />
            <stop offset="80%" stopColor="var(--ember)" />
            <stop offset="100%" stopColor="var(--ember)" stopOpacity="0" />
          </radialGradient>
          <filter id="softBlur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.2" />
          </filter>
          <filter id="meshBlur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="0.5" />
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

        <g className="mesh-a" filter="url(#meshBlur)">
          {MESH_A.map((m, i) => (
            <path key={i} d={m.d} fill="none" stroke="var(--ember)" strokeWidth={m.width} opacity={m.opacity} />
          ))}
        </g>

        <g className="mesh-b" filter="url(#meshBlur)">
          {MESH_B.map((m, i) => (
            <path key={i} d={m.d} fill="none" stroke="var(--gold)" strokeWidth={m.width} opacity={m.opacity} />
          ))}
        </g>

        <g className="streaks" filter="url(#softBlur)">
          {RAYS.map((r, i) => (
            <line
              key={i}
              x1="50"
              y1="50"
              x2={50 + r.length * Math.cos((r.angle * Math.PI) / 180)}
              y2={50 + r.length * Math.sin((r.angle * Math.PI) / 180)}
              stroke="var(--ember)"
              strokeWidth="0.3"
              opacity="0.3"
            />
          ))}
        </g>

        <g className="core-glow">
          <circle cx="50" cy="50" r="16" fill="url(#coreGlow)" />
          <circle cx="50" cy="50" r="4" fill="#ffffff" filter="url(#softBlur)" />
        </g>
      </svg>
    </div>
  );
}

export default function Home() {
  const [booted, setBooted] = useState(false);
  const [visibleBootLines, setVisibleBootLines] = useState(0);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Good to see you. Systems are online — how can I help?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [voiceOn, setVoiceOn] = useState(false);
  const [listening, setListening] = useState(false);
  const logRef = useRef(null);
  const recognitionRef = useRef(null);

  // Boot sequence
  useEffect(() => {
    if (visibleBootLines < BOOT_LINES.length) {
      const t = setTimeout(() => setVisibleBootLines((n) => n + 1), 380);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setBooted(true), 500);
    return () => clearTimeout(t);
  }, [visibleBootLines]);

  // Auto-scroll chat log
  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  // Set up speech recognition if the browser supports it
  useEffect(() => {
    const SpeechRecognition = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
    };
    recognition.onerror = (e) => {
      setListening(false);
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        alert("Microphone access was blocked. Check your browser's site settings and allow the microphone for this page.");
      } else if (e.error === "no-speech") {
        // silently ignore — user just didn't say anything
      } else {
        alert("Voice input hit an error: " + e.error);
      }
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
  }, []);

  function toggleMic() {
    if (!recognitionRef.current) {
      alert(
        "Voice input isn't supported in this browser. Safari (Mac and iPhone) doesn't support it yet — try Chrome or Edge instead."
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
      } catch (err) {
        setListening(false);
      }
    }
  }

  async function speak(text) {
    if (!voiceOn) return;
    try {
      const res = await fetch("/api/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alert("Voice playback failed: " + (data?.error || `HTTP ${res.status}`));
        return; // text reply is already shown either way
      }
      const audioBlob = await res.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
    } catch (err) {
      alert("Voice playback failed: " + err.message);
    }
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages = [...messages, { role: "user", content: text }];
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

      if (!res.ok) {
        setMessages((m) => [...m, { role: "assistant", content: data.error || "Something went wrong.", error: true }]);
      } else {
        setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
        speak(data.reply);
      }
    } catch (err) {
      setMessages((m) => [...m, { role: "assistant", content: "I couldn't reach the server. Check your connection.", error: true }]);
    } finally {
      setLoading(false);
    }
  }

  if (!booted) {
    return (
      <div className="boot-screen">
        {BOOT_LINES.slice(0, visibleBootLines).map((line, i) => (
          <div key={i} className={`boot-line${line.dim ? " dim" : ""}`}>
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
          <div key={i} className={`msg-row ${m.role}`}>
            <div className="msg-label">{m.role === "user" ? "YOU" : "JARVIS"}</div>
            <div className={`bubble${m.error ? " error" : ""}`}>{m.content}</div>
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
        <button className={`icon-btn mic${listening ? " listening" : ""}`} onClick={toggleMic} title="Voice input">
          🎙
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Speak, and I shall listen..."
          disabled={loading}
        />
        <button className="icon-btn send" onClick={sendMessage} disabled={loading || !input.trim()} title="Send">
          ➤
        </button>
      </div>
    </div>
  );
}
