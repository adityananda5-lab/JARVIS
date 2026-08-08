"use client";

import { useEffect, useRef, useState } from "react";

const BOOT_LINES = [
  { text: "INITIALIZING J.A.R.V.I.S. CORE...", dim: false },
  { text: "LOADING NEURAL INTERFACE", dim: true },
  { text: "CALIBRATING VOICE SYSTEM", dim: true },
  { text: "ENERGY CORE ONLINE", dim: false },
  { text: "ALL SYSTEMS NOMINAL", dim: false },
];

/* =========================================================
   HOLOGRAPHIC JARVIS CORE
   Canvas renderer — no external libraries required
========================================================= */

function JarvisCore({ thinking }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const stateRef = useRef({
    width: 0,
    height: 0,
    dpr: 1,
    time: 0,
    particles: [],
    stars: [],
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", {
      alpha: true,
      desynchronized: true,
    });

    if (!ctx) return;

    const state = stateRef.current;

    /* -----------------------------
       deterministic random
    ----------------------------- */

    let seed = 938472;

    function random() {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    }

    /* -----------------------------
       resize
    ----------------------------- */

    function resize() {
      const rect = canvas.getBoundingClientRect();

      state.dpr = Math.min(window.devicePixelRatio || 1, 2);
      state.width = rect.width;
      state.height = rect.height;

      canvas.width = Math.floor(rect.width * state.dpr);
      canvas.height = Math.floor(rect.height * state.dpr);

      ctx.setTransform(
        state.dpr,
        0,
        0,
        state.dpr,
        0,
        0
      );
    }

    resize();

    window.addEventListener("resize", resize);

    /* -----------------------------
       particle creation
    ----------------------------- */

    const PARTICLE_COUNT = 950;
    const STAR_COUNT = 160;

    state.particles = [];
    state.stars = [];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const theta = random() * Math.PI * 2;
      const phi = Math.acos(2 * random() - 1);

      const radius =
        0.18 +
        Math.pow(random(), 0.55) * 0.82;

      state.particles.push({
        theta,
        phi,
        radius,

        size:
          0.35 +
          Math.pow(random(), 2) * 1.7,

        alpha:
          0.12 +
          random() * 0.72,

        speed:
          0.08 +
          random() * 0.5,

        drift:
          (random() - 0.5) * 0.8,

        phase: random() * Math.PI * 2,

        layer: random(),
      });
    }

    for (let i = 0; i < STAR_COUNT; i++) {
      state.stars.push({
        angle: random() * Math.PI * 2,
        distance: 0.85 + random() * 0.65,
        size: 0.4 + random() * 1.3,
        alpha: 0.15 + random() * 0.5,
        speed: (random() - 0.5) * 0.15,
      });
    }

    /* -----------------------------
       helpers
    ----------------------------- */

    function projectParticle(p, t) {
      const spin = t * (thinking ? 0.0009 : 0.00025);

      let theta = p.theta + spin * p.speed;

      const x3 =
        Math.sin(p.phi) *
        Math.cos(theta) *
        p.radius;

      const y3 =
        Math.cos(p.phi) *
        p.radius;

      const z3 =
        Math.sin(p.phi) *
        Math.sin(theta) *
        p.radius;

      // tilt the sphere
      const tilt = -0.25;

      const y =
        y3 * Math.cos(tilt) -
        z3 * Math.sin(tilt);

      const z =
        y3 * Math.sin(tilt) +
        z3 * Math.cos(tilt);

      const perspective =
        1 / (1.7 - z * 0.65);

      return {
        x: x3 * perspective,
        y: y * perspective,
        z,
        scale: perspective,
      };
    }

    function drawGlowCircle(x, y, radius, color, alpha) {
      const gradient = ctx.createRadialGradient(
        x,
        y,
        0,
        x,
        y,
        radius
      );

      gradient.addColorStop(
        0,
        `rgba(${color},${alpha})`
      );

      gradient.addColorStop(
        0.25,
        `rgba(${color},${alpha * 0.65})`
      );

      gradient.addColorStop(
        0.65,
        `rgba(${color},${alpha * 0.12})`
      );

      gradient.addColorStop(
        1,
        `rgba(${color},0)`
      );

      ctx.fillStyle = gradient;

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    /* -----------------------------
       main animation
    ----------------------------- */

    function render(timestamp) {
      state.time = timestamp;

      const w = state.width;
      const h = state.height;

      if (!w || !h) {
        animationRef.current =
          requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;

      /*
        Core size.

        This is deliberately large.
        It is what makes the interface resemble
        the reference images instead of a small
        circular UI icon.
      */

      const base =
        Math.min(w, h) *
        (thinking ? 0.39 : 0.33);

      /* -----------------------------
         global glow
      ----------------------------- */

      ctx.save();

      ctx.globalCompositeOperation = "lighter";

      drawGlowCircle(
        cx,
        cy,
        base * 1.65,
        "255,92,8",
        thinking ? 0.18 : 0.10
      );

      drawGlowCircle(
        cx,
        cy,
        base * 1.05,
        "255,153,45",
        thinking ? 0.23 : 0.14
      );

      /* -----------------------------
         radial energy beams
      ----------------------------- */

      const rayCount = thinking ? 110 : 58;

      for (let i = 0; i < rayCount; i++) {
        const angle =
          (i / rayCount) *
            Math.PI *
            2 +
          Math.sin(i * 7.31) * 0.18;

        const inner =
          base *
          (0.45 + Math.sin(i * 3.7) * 0.08);

        const outer =
          base *
          (1.15 +
            Math.sin(i * 8.11) *
              0.55 +
            Math.random() * 0.03);

        const x1 =
          cx + Math.cos(angle) * inner;

        const y1 =
          cy + Math.sin(angle) * inner;

        const x2 =
          cx + Math.cos(angle) * outer;

        const y2 =
          cy + Math.sin(angle) * outer;

        const gradient =
          ctx.createLinearGradient(
            x1,
            y1,
            x2,
            y2
          );

        gradient.addColorStop(
          0,
          "rgba(255,255,210,0.55)"
        );

        gradient.addColorStop(
          0.2,
          "rgba(255,180,65,0.28)"
        );

        gradient.addColorStop(
          1,
          "rgba(255,80,0,0)"
        );

        ctx.strokeStyle = gradient;

        ctx.lineWidth =
          thinking
            ? 0.6 + Math.random() * 1.5
            : 0.35 + Math.random() * 0.8;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      /* -----------------------------
         orbital rings
      ----------------------------- */

      const ringRotation =
        timestamp *
        (thinking ? 0.00035 : 0.00008);

      for (let ring = 0; ring < 7; ring++) {
        const radius =
          base *
          (0.48 + ring * 0.105);

        ctx.save();

        ctx.translate(cx, cy);

        ctx.rotate(
          ringRotation *
            (ring % 2 === 0 ? 1 : -1)
        );

        ctx.rotate(
          ring * 0.45
        );

        ctx.scale(
          1,
          0.35 + ring * 0.055
        );

        ctx.beginPath();

        ctx.arc(
          0,
          0,
          radius,
          0,
          Math.PI * 2
        );

        ctx.strokeStyle =
          ring % 2 === 0
            ? "rgba(255,170,65,0.38)"
            : "rgba(255,210,125,0.22)";

        ctx.lineWidth =
          ring === 0
            ? 1.4
            : 0.65;

        ctx.setLineDash(
          ring % 3 === 0
            ? [2, 8]
            : [1, 4]
        );

        ctx.stroke();

        ctx.restore();
      }

      /* -----------------------------
         dense particle sphere
      ----------------------------- */

      const projected = [];

      for (const p of state.particles) {
        const point =
          projectParticle(
            p,
            timestamp
          );

        const px =
          cx +
          point.x * base;

        const py =
          cy +
          point.y * base;

        projected.push({
          ...p,
          ...point,
          px,
          py,
        });
      }

      projected.sort(
        (a, b) => a.z - b.z
      );

      for (const p of projected) {
        const depth =
          (p.z + 1) / 2;

        const pulse =
          0.75 +
          Math.sin(
            timestamp * 0.0025 +
              p.phase
          ) *
            0.25;

        const alpha =
          p.alpha *
          (0.25 + depth * 0.9) *
          pulse;

        if (alpha <= 0.01) continue;

        const size =
          p.size *
          p.scale *
          (thinking ? 1.35 : 1);

        ctx.fillStyle =
          `rgba(255,${
            120 +
            Math.floor(
              depth * 100
            )
          },${
            35 +
            Math.floor(
              depth * 60
            )
          },${alpha})`;

        ctx.beginPath();

        ctx.arc(
          p.px,
          p.py,
          size,
          0,
          Math.PI * 2
        );

        ctx.fill();
      }

      /* -----------------------------
         random orbit fragments
      ----------------------------- */

      const fragments =
        thinking ? 80 : 42;

      for (
        let i = 0;
        i < fragments;
        i++
      ) {
        const angle =
          i * 2.39996 +
          timestamp *
            0.00015 *
            (i % 2 ? -1 : 1);

        const distance =
          base *
          (0.7 +
            Math.sin(i * 8.2) *
              0.35 +
            ((i * 17) % 100) /
              160);

        const x =
          cx +
          Math.cos(angle) *
            distance;

        const y =
          cy +
          Math.sin(angle) *
            distance *
            (0.55 +
              Math.sin(i) * 0.15);

        const length =
          4 +
          ((i * 13) % 24);

        ctx.strokeStyle =
          `rgba(255,${140 + (i % 90)},55,${
            0.12 +
            (i % 5) * 0.06
          })`;

        ctx.lineWidth =
          0.5 +
          (i % 3) * 0.4;

        ctx.beginPath();

        ctx.moveTo(
          x - Math.cos(angle) * length,
          y - Math.sin(angle) * length
        );

        ctx.lineTo(
          x + Math.cos(angle) * length,
          y + Math.sin(angle) * length
        );

        ctx.stroke();
      }

      /* -----------------------------
         hot center
      ----------------------------- */

      drawGlowCircle(
        cx,
        cy,
        base * 0.48,
        "255,80,0",
        thinking ? 0.45 : 0.30
      );

      drawGlowCircle(
        cx,
        cy,
        base * 0.31,
        "255,170,60",
        thinking ? 0.75 : 0.55
      );

      const coreGradient =
        ctx.createRadialGradient(
          cx,
          cy,
          0,
          cx,
          cy,
          base * 0.24
        );

      coreGradient.addColorStop(
        0,
        "rgba(255,255,255,1)"
      );

      coreGradient.addColorStop(
        0.16,
        "rgba(255,248,210,1)"
      );

      coreGradient.addColorStop(
        0.42,
        "rgba(255,214,125,0.98)"
      );

      coreGradient.addColorStop(
        0.72,
        "rgba(255,130,20,0.65)"
      );

      coreGradient.addColorStop(
        1,
        "rgba(255,50,0,0)"
      );

      ctx.fillStyle =
        coreGradient;

      ctx.beginPath();

      ctx.arc(
        cx,
        cy,
        base * 0.24,
        0,
        Math.PI * 2
      );

      ctx.fill();

      /* bright central nucleus */

      ctx.fillStyle =
        "rgba(255,255,245,0.98)";

      ctx.shadowBlur =
        thinking ? 45 : 30;

      ctx.shadowColor =
        "rgba(255,150,50,0.95)";

      ctx.beginPath();

      ctx.arc(
        cx,
        cy,
        base *
          (thinking ? 0.075 : 0.065),
        0,
        Math.PI * 2
      );

      ctx.fill();

      ctx.shadowBlur = 0;

      ctx.restore();

      animationRef.current =
        requestAnimationFrame(render);
    }

    animationRef.current =
      requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(
        animationRef.current
      );

      window.removeEventListener(
        "resize",
        resize
      );
    };
  }, [thinking]);

  return (
    <canvas
      ref={canvasRef}
      className={`jarvis-canvas ${
        thinking ? "thinking" : ""
      }`}
      aria-hidden="true"
    />
  );
}

/* =========================================================
   MAIN APP
========================================================= */

export default function Home() {
  const [booted, setBooted] =
    useState(false);

  const [visibleBootLines, setVisibleBootLines] =
    useState(0);

  const [messages, setMessages] =
    useState([
      {
        role: "assistant",
        content:
          "Good to see you. Systems are online — how can I help?",
      },
    ]);

  const [input, setInput] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [voiceOn, setVoiceOn] =
    useState(false);

  const [listening, setListening] =
    useState(false);

  const logRef =
    useRef(null);

  const recognitionRef =
    useRef(null);

  const audioRef =
    useRef(null);

  /* -----------------------------
     boot
  ----------------------------- */

  useEffect(() => {
    if (
      visibleBootLines <
      BOOT_LINES.length
    ) {
      const timer =
        setTimeout(() => {
          setVisibleBootLines(
            (n) => n + 1
          );
        }, 300);

      return () =>
        clearTimeout(timer);
    }

    const timer =
      setTimeout(
        () => setBooted(true),
        450
      );

    return () =>
      clearTimeout(timer);
  }, [visibleBootLines]);

  /* -----------------------------
     chat scrolling
  ----------------------------- */

  useEffect(() => {
    if (!logRef.current) return;

    logRef.current.scrollTo({
      top:
        logRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  /* -----------------------------
     speech recognition
  ----------------------------- */

  useEffect(() => {
    if (
      typeof window ===
      "undefined"
    ) {
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return;
    }

    const recognition =
      new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onresult = (event) => {
      const transcript =
        event.results[0][0]
          .transcript;

      setInput(transcript);
    };

    recognition.onerror = (event) => {
      setListening(false);

      if (
        event.error ===
          "not-allowed" ||
        event.error ===
          "service-not-allowed"
      ) {
        alert(
          "Microphone access was blocked. Allow microphone access for this website and try again."
        );
      }
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current =
      recognition;

    return () => {
      try {
        recognition.stop();
      } catch {}
    };
  }, []);

  /* -----------------------------
     microphone
  ----------------------------- */

  function toggleMic() {
    const recognition =
      recognitionRef.current;

    if (!recognition) {
      alert(
        "Voice input is not supported by this browser. Try Chrome or Edge."
      );

      return;
    }

    if (listening) {
      try {
        recognition.stop();
      } catch {}

      setListening(false);
      return;
    }

    try {
      recognition.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  }

  /* -----------------------------
     voice output
  ----------------------------- */

  async function speak(text) {
    if (!voiceOn) return;

    try {
      if (audioRef.current) {
        try {
          audioRef.current.pause();
        } catch {}

        audioRef.current = null;
      }

      const response =
        await fetch(
          "/api/speak",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              text,
            }),
          }
        );

      if (!response.ok) {
        const data =
          await response
            .json()
            .catch(() => null);

        console.error(
          "Voice playback failed:",
          data?.error ||
            response.status
        );

        return;
      }

      const blob =
        await response.blob();

      const url =
        URL.createObjectURL(blob);

      const audio =
        new Audio(url);

      audioRef.current = audio;

      audio.onended = () => {
        URL.revokeObjectURL(url);

        if (
          audioRef.current ===
          audio
        ) {
          audioRef.current = null;
        }
      };

      await audio.play();
    } catch (error) {
      console.error(
        "Voice playback failed:",
        error
      );
    }
  }

  /* -----------------------------
     send message
  ----------------------------- */

  async function sendMessage() {
    const text =
      input.trim();

    if (!text || loading) {
      return;
    }

    const nextMessages = [
      ...messages,
      {
        role: "user",
        content: text,
      },
    ];

    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const response =
        await fetch(
          "/api/chat",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              messages:
                nextMessages,
            }),
          }
        );

      const data =
        await response
          .json()
          .catch(() => null);

      if (!response.ok) {
        setMessages(
          (current) => [
            ...current,
            {
              role: "assistant",
              content:
                data?.error ||
                "Something went wrong.",
              error: true,
            },
          ]
        );

        return;
      }

      const reply =
        data?.reply ||
        "I received your request, but no response was returned.";

      setMessages(
        (current) => [
          ...current,
          {
            role: "assistant",
            content: reply,
          },
        ]
      );

      await speak(reply);
    } catch (error) {
      console.error(error);

      setMessages(
        (current) => [
          ...current,
          {
            role: "assistant",
            content:
              "I couldn't reach the server. Check your connection and try again.",
            error: true,
          },
        ]
      );
    } finally {
      setLoading(false);
    }
  }

  /* -----------------------------
     keyboard
  ----------------------------- */

  function handleKeyDown(event) {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      sendMessage();
    }
  }

  /* -----------------------------
     boot screen
  ----------------------------- */

  if (!booted) {
    return (
      <main className="boot-screen">
        <div className="boot-core">
          <div className="boot-core-dot" />
        </div>

        <div className="boot-lines">
          {BOOT_LINES.slice(
            0,
            visibleBootLines
          ).map((line, index) => (
            <div
              key={index}
              className={`boot-line ${
                line.dim
                  ? "dim"
                  : ""
              }`}
            >
              {line.text}
            </div>
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="jarvis-app">
      {/* --------------------------------
          HEADER
      -------------------------------- */}

      <header className="jarvis-header">
        <div className="brand">
          <div className="wordmark">
            J.A.R.V.I.S.
          </div>

          <div className="system-status">
            <span
              className={`status-dot ${
                loading
                  ? "processing"
                  : ""
              }`}
            />

            {loading
              ? "PROCESSING"
              : "ONLINE"}
          </div>
        </div>

        <button
          type="button"
          className={`voice-button ${
            voiceOn
              ? "active"
              : ""
          }`}
          onClick={() =>
            setVoiceOn(
              (value) =>
                !value
            )
          }
        >
          <span className="voice-indicator" />
          VOICE{" "}
          {voiceOn
            ? "ON"
            : "OFF"}
        </button>
      </header>

      {/* --------------------------------
          ENERGY CORE
      -------------------------------- */}

      <section className="core-container">
        <JarvisCore
          thinking={loading}
        />
      </section>

      {/* --------------------------------
          CHAT
      -------------------------------- */}

      <section
        className="chat-log"
        ref={logRef}
        aria-live="polite"
      >
        {messages.map(
          (message, index) => (
            <article
              key={index}
              className={`message ${
                message.role
              } ${
                message.error
                  ? "error"
                  : ""
              }`}
            >
              <div className="message-label">
                {message.role ===
                "user"
                  ? "YOU"
                  : "JARVIS"}
              </div>

              <div className="message-content">
                {message.content}
              </div>
            </article>
          )
        )}

        {loading && (
          <article className="message assistant">
            <div className="message-label">
              JARVIS
            </div>

            <div className="thinking-indicator">
              <span />
              <span />
              <span />
              <span />
            </div>
          </article>
        )}
      </section>

      {/* --------------------------------
          INPUT
      -------------------------------- */}

      <footer className="input-area">
        <button
          type="button"
          className={`control-button microphone ${
            listening
              ? "listening"
              : ""
          }`}
          onClick={toggleMic}
          aria-label="Voice input"
          title="Voice input"
        >
          <span className="mic-icon">
            🎙
          </span>
        </button>

        <div className="input-wrapper">
          <input
            type="text"
            value={input}
            onChange={(event) =>
              setInput(
                event.target.value
              )
            }
            onKeyDown={
              handleKeyDown
            }
            placeholder={
              listening
                ? "Listening..."
                : "Speak, and I shall listen..."
            }
            disabled={loading}
            autoComplete="off"
            spellCheck="false"
          />
        </div>

        <button
          type="button"
          className="control-button send-button"
          onClick={sendMessage}
          disabled={
            loading ||
            !input.trim()
          }
          aria-label="Send message"
          title="Send message"
        >
          ➤
        </button>
      </footer>
    </main>
  );
}
