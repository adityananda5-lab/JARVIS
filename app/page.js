"use client";

import { useEffect, useRef, useState } from "react";

const BOOT_LINES = [
  { text: "INITIALIZING J.A.R.V.I.S. CORE...", dim: false },
  { text: "loading language subsystem", dim: true },
  { text: "calibrating voice interface", dim: true },
  { text: "ALL SYSTEMS NOMINAL", dim: false },
];

// Deterministic pseudo-random particle field using the golden angle —
// looks organic/scattered but never changes between server and client renders
const PARTICLES = Array.from({ length: 46 }).map((_, i) => {
  const angle = i * 137.508 * (Math.PI / 180);
  const radiusJitter = (Math.sin(i * 12.9898) * 0.5 + 0.5); // deterministic 0..1
  const radius = 34 + radiusJitter * 20;
  const size = 0.3 + (Math.cos(i * 7.233) * 0.5 + 0.5) * 0.5;
  const opacity = 0.25 + (Math.sin(i * 3.71) * 0.5 + 0.5) * 0.55;
  return {
    x: 50 + radius * Math.cos(angle),
    y: 50 + radius * Math.sin(angle),
    size,
    opacity,
    delay: (i % 10) * 0.3,
  };
});

const RAYS = Array.from({ length: 18 }).map((_, i) => {
  const angle = (i * 360) / 18;
  const lengthJitter = Math.sin(i * 4.51) * 0.5 + 0.5;
  const length = 40 + lengthJitter * 20; // some rays poke past the rings
  return { angle, length };
});

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

        <ellipse className="ring-orbit" cx="50" cy="50" rx="42" ry="18" fill="none" stroke="var(--gold)" strokeWidth="0.6" opacity="0.5" transform="rotate(-24 50 50)" />
        <circle className="ring-outer" cx="50" cy="50" r="38" fill="none" stroke="var(--ember)" strokeWidth="0.5" strokeDasharray="0.5 2.5" opacity="0.4" />
        <circle className="ring-inner" cx="50" cy="50" r="27" fill="none" stroke="var(--gold-bright)" strokeWidth="0.7" strokeDasharray="1.5 3" opacity="0.55" />

        <g className="streaks" filter="url(#softBlur)">
          {RAYS.map((r, i) => (
            <line
              key={i}
              x1="50"
              y1="50"
              x2={50 + r.length * Math.cos((r.angle * Math.PI) / 180)}
              y2={50 + r.length * Math.sin((r.angle * Math.PI) / 180)}
              stroke="var(--ember)"
              strokeWidth="0.35"
              opacity="0.35"
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
