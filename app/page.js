"use client";

import { useEffect, useRef, useState } from "react";

const BOOT_LINES = [
  { text: "INITIALIZING J.A.R.V.I.S. CORE...", dim: false },
  { text: "loading language subsystem", dim: true },
  { text: "calibrating voice interface", dim: true },
  { text: "ALL SYSTEMS NOMINAL", dim: false },
];

function Core({ thinking }) {
  return (
    <div className={`core${thinking ? " thinking" : ""}`}>
      <svg viewBox="0 0 100 100">
        <defs>
          <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff4e0" />
            <stop offset="35%" stopColor="var(--gold-bright)" />
            <stop offset="70%" stopColor="var(--ember)" />
            <stop offset="100%" stopColor="var(--ember)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle className="ring-outer" cx="50" cy="50" r="46" fill="none" stroke="var(--ember)" strokeWidth="0.6" strokeDasharray="0.5 3" opacity="0.45" />
        <circle className="ring-mid" cx="50" cy="50" r="40" fill="none" stroke="var(--gold)" strokeWidth="0.8" strokeDasharray="6 3 1 3" opacity="0.5" />
        <circle className="ring-inner" cx="50" cy="50" r="30" fill="none" stroke="var(--gold-bright)" strokeWidth="1" strokeDasharray="2 4" opacity="0.65" />
        <g className="streaks">
          {Array.from({ length: 10 }).map((_, i) => (
            <line
              key={i}
              x1="50"
              y1="50"
              x2={50 + 44 * Math.cos((i * Math.PI * 2) / 10)}
              y2={50 + 44 * Math.sin((i * Math.PI * 2) / 10)}
              stroke="var(--ember)"
              strokeWidth="0.4"
              opacity="0.25"
            />
          ))}
        </g>
        <g className="core-glow">
          <circle cx="50" cy="50" r="20" fill="url(#coreGlow)" />
          <circle cx="50" cy="50" r="5" fill="#fff8ec" />
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

  // Some browsers load their voice list asynchronously — this makes sure it's ready
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
  }, []);

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

  function speak(text) {
    if (!voiceOn || typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);

    // Look for well-known British male voice names first (varies by browser/OS),
    // then fall back to any British voice, then any English voice.
    const voices = window.speechSynthesis.getVoices();
    const knownMaleNames = ["Daniel", "Google UK English Male", "Microsoft George", "Microsoft Ryan", "Arthur", "Oliver"];
    const britishVoice =
      voices.find((v) => knownMaleNames.some((name) => v.name.includes(name))) ||
      voices.find((v) => v.lang === "en-GB" && /male/i.test(v.name)) ||
      voices.find((v) => v.lang === "en-GB") ||
      voices.find((v) => v.lang && v.lang.startsWith("en-GB"));
    if (britishVoice) utterance.voice = britishVoice;

    utterance.lang = "en-GB";
    utterance.rate = 0.95;
    utterance.pitch = 0.8;
    utterance.volume = 1;
    window.speechSynthesis.speak(utterance);
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
