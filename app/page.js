"use client";

import { useEffect, useRef, useState } from "react";

/* =========================================================
   J.A.R.V.I.S. — MAIN INTERFACE
   ========================================================= */

const BOOT_LINES = [
  { text: "INITIALIZING J.A.R.V.I.S. CORE...", dim: false },
  { text: "loading cognitive subsystem", dim: true },
  { text: "calibrating neural interface", dim: true },
  { text: "ALL SYSTEMS NOMINAL", dim: false },
];

/* =========================================================
   SEEDED RANDOM
   Keeps the visual structure stable instead of changing
   completely every frame.
   ========================================================= */

function seededRandom(seed) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

/* =========================================================
   ENERGY FIELD CANVAS
   ========================================================= */

function JarvisCore({ thinking }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const stateRef = useRef({
    width: 0,
    height: 0,
    dpr: 1,
    time: 0,
    filaments: [],
    particles: [],
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const state = stateRef.current;

    /* -------------------------------------------------------
       RESIZE
       ------------------------------------------------------- */

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

      createField();
    }

    /* -------------------------------------------------------
       CREATE IRREGULAR ENERGY NETWORK
       ------------------------------------------------------- */

    function createField() {
      state.filaments = [];
      state.particles = [];

      /*
        IMPORTANT:

        This deliberately does NOT create:
        - circles
        - ellipses
        - radial spokes
        - orbital rings

        Instead, every filament is an irregular wandering
        polyline. The result is a tangled energy cloud.
      */

      const minDimension = Math.min(
        state.width,
        state.height
      );

      const fieldRadius = minDimension * 0.27;

      /* Main tangled filaments */

      const filamentCount =
        state.width < 600 ? 135 : 210;

      for (let i = 0; i < filamentCount; i++) {
        const seed = i * 17.371;

        const startAngle =
          seededRandom(seed) * Math.PI * 2;

        const startRadius =
          fieldRadius *
          (0.15 + seededRandom(seed + 1) * 0.72);

        let x =
          Math.cos(startAngle) * startRadius;

        let y =
          Math.sin(startAngle) * startRadius;

        const points = [];

        /*
          Each filament performs a random walk.

          This is what prevents the "sun ray" appearance.
        */

        const steps =
          18 + Math.floor(seededRandom(seed + 2) * 35);

        let angle =
          startAngle +
          (seededRandom(seed + 3) - 0.5) * 2.4;

        let radius = Math.sqrt(x * x + y * y);

        for (let s = 0; s < steps; s++) {
          const t = s / steps;

          const noiseA =
            Math.sin(
              seed * 0.37 +
                s * 0.91 +
                Math.sin(s * 0.31)
            );

          const noiseB =
            Math.cos(
              seed * 0.21 +
                s * 1.17
            );

          /*
            The path bends constantly instead of traveling
            in a straight line.
          */

          angle +=
            noiseA * 0.28 +
            noiseB * 0.13 +
            (seededRandom(seed + s * 5.1) - 0.5) *
              0.35;

          /*
            Slight inward/outward movement creates the
            messy 3D-energy-cloud feeling.
          */

          radius +=
            Math.sin(
              seed * 0.7 +
                s * 0.52
            ) *
              fieldRadius *
              0.035;

          radius +=
            (seededRandom(seed + s * 8.2) - 0.5) *
            fieldRadius *
            0.035;

          radius = Math.max(
            fieldRadius * 0.025,
            Math.min(fieldRadius * 1.18, radius)
          );

          x =
            Math.cos(angle) * radius;

          y =
            Math.sin(angle) * radius;

          /*
            Add local distortion so the field doesn't
            become a perfect radial structure.
          */

          const distortion =
            Math.sin(
              s * 1.9 +
                seed
            ) *
            fieldRadius *
            0.035;

          x +=
            Math.cos(angle + Math.PI / 2) *
            distortion;

          y +=
            Math.sin(angle + Math.PI / 2) *
            distortion;

          points.push({
            x,
            y,
          });
        }

        state.filaments.push({
          points,
          seed,
          width:
            0.45 +
            seededRandom(seed + 20) * 1.15,
          alpha:
            0.18 +
            seededRandom(seed + 30) * 0.62,
          phase:
            seededRandom(seed + 40) *
            Math.PI *
            2,
        });
      }

      /* -----------------------------------------------------
         SHORTER SECONDARY FILAMENTS

         These create the dense tangled structure around
         the main network.
         ----------------------------------------------------- */

      const secondaryCount =
        state.width < 600 ? 170 : 280;

      for (let i = 0; i < secondaryCount; i++) {
        const seed = 5000 + i * 31.77;

        const points = [];

        let angle =
          seededRandom(seed) *
          Math.PI *
          2;

        let radius =
          fieldRadius *
          (0.2 +
            seededRandom(seed + 1) *
              0.9);

        const steps =
          7 +
          Math.floor(
            seededRandom(seed + 2) * 18
          );

        for (let s = 0; s < steps; s++) {
          angle +=
            (seededRandom(seed + s * 2.1) - 0.5) *
            0.85;

          radius +=
            (seededRandom(seed + s * 4.3) - 0.5) *
            fieldRadius *
            0.08;

          radius = Math.max(
            fieldRadius * 0.04,
            Math.min(
              fieldRadius * 1.3,
              radius
            )
          );

          const x =
            Math.cos(angle) * radius;

          const y =
            Math.sin(angle) * radius;

          points.push({
            x,
            y,
          });
        }

        state.filaments.push({
          points,
          seed,
          width:
            0.25 +
            seededRandom(seed + 50) * 0.75,
          alpha:
            0.08 +
            seededRandom(seed + 60) * 0.38,
          phase:
            seededRandom(seed + 70) *
            Math.PI *
            2,
        });
      }

      /* -----------------------------------------------------
         PARTICLES
         ----------------------------------------------------- */

      const particleCount =
        state.width < 600 ? 190 : 340;

      for (let i = 0; i < particleCount; i++) {
        const seed = 9000 + i * 11.93;

        const angle =
          seededRandom(seed) *
          Math.PI *
          2;

        const radius =
          fieldRadius *
          Math.pow(
            seededRandom(seed + 1),
            0.72
          ) *
          1.18;

        state.particles.push({
          x:
            Math.cos(angle) * radius,
          y:
            Math.sin(angle) * radius,

          size:
            0.35 +
            seededRandom(seed + 2) *
              1.65,

          alpha:
            0.15 +
            seededRandom(seed + 3) *
              0.75,

          phase:
            seededRandom(seed + 4) *
            Math.PI *
            2,

          speed:
            0.3 +
            seededRandom(seed + 5) *
              1.2,
        });
      }
    }

    /* -------------------------------------------------------
       DRAW FILAMENT
       ------------------------------------------------------- */

    function drawFilament(filament, time, intensity) {
      const cx = state.width / 2;
      const cy = state.height / 2;

      const points = filament.points;

      if (!points.length) return;

      ctx.beginPath();

      for (let i = 0; i < points.length; i++) {
        const p = points[i];

        /*
          Small animated distortion.
        */

        const wave =
          Math.sin(
            time * 0.0012 +
              filament.phase +
              i * 0.43
          ) *
          intensity *
          2.5;

        const nx =
          -p.y /
          Math.max(
            Math.sqrt(
              p.x * p.x +
                p.y * p.y
            ),
            1
          );

        const ny =
          p.x /
          Math.max(
            Math.sqrt(
              p.x * p.x +
                p.y * p.y
            ),
            1
          );

        const x =
          cx +
          p.x +
          nx * wave;

        const y =
          cy +
          p.y +
          ny * wave;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      const glow =
        filament.alpha *
        (0.55 + intensity * 0.7);

      ctx.strokeStyle =
        `rgba(255, ${130 + Math.floor(intensity * 40)}, 35, ${glow})`;

      ctx.lineWidth =
        filament.width *
        (1 + intensity * 0.45);

      ctx.shadowColor =
        "rgba(255, 105, 20, 0.8)";

      ctx.shadowBlur =
        filament.width > 0.8
          ? 4 + intensity * 6
          : 2;

      ctx.stroke();

      ctx.shadowBlur = 0;
    }

    /* -------------------------------------------------------
       DRAW
       ------------------------------------------------------- */

    function draw(time) {
      state.time = time;

      const intensity = thinking ? 1 : 0.25;

      /*
        Completely clear the canvas.

        No background circle is drawn.
        This is important.
      */

      ctx.clearRect(
        0,
        0,
        state.width,
        state.height
      );

      const cx = state.width / 2;
      const cy = state.height / 2;

      const minDimension = Math.min(
        state.width,
        state.height
      );

      const radius =
        minDimension * 0.27;

      /* -----------------------------------------------------
         VERY SUBTLE AMBIENT GLOW

         Not a giant orange sphere.
         Just atmospheric illumination.
         ----------------------------------------------------- */

      const ambient =
        ctx.createRadialGradient(
          cx,
          cy,
          0,
          cx,
          cy,
          radius * 1.25
        );

      ambient.addColorStop(
        0,
        `rgba(255, 100, 15, ${
          0.08 + intensity * 0.08
        })`
      );

      ambient.addColorStop(
        0.25,
        `rgba(255, 80, 10, ${
          0.035 + intensity * 0.04
        })`
      );

      ambient.addColorStop(
        1,
        "rgba(255, 60, 0, 0)"
      );

      ctx.fillStyle = ambient;

      ctx.fillRect(
        cx - radius * 1.4,
        cy - radius * 1.4,
        radius * 2.8,
        radius * 2.8
      );

      /* -----------------------------------------------------
         FILAMENT NETWORK
         ----------------------------------------------------- */

      for (const filament of state.filaments) {
        drawFilament(
          filament,
          time,
          intensity
        );
      }

      /* -----------------------------------------------------
         PARTICLES
         ----------------------------------------------------- */

      for (const particle of state.particles) {
        const pulse =
          0.55 +
          Math.sin(
            time *
              0.001 *
              particle.speed +
              particle.phase
          ) *
            0.45;

        const drift =
          Math.sin(
            time * 0.00025 +
              particle.phase
          ) *
          intensity *
          4;

        const x =
          cx +
          particle.x +
          drift;

        const y =
          cy +
          particle.y;

        ctx.beginPath();

        ctx.arc(
          x,
          y,
          particle.size *
            (0.7 + pulse * 0.5),
          0,
          Math.PI * 2
        );

        ctx.fillStyle =
          `rgba(255, ${
            155 +
            Math.floor(pulse * 75)
          }, ${
            65 +
            Math.floor(pulse * 35)
          }, ${
            particle.alpha *
            (0.65 + pulse * 0.35)
          })`;

        ctx.shadowColor =
          "rgba(255, 120, 30, 0.9)";

        ctx.shadowBlur =
          particle.size > 1
            ? 5
            : 2;

        ctx.fill();

        ctx.shadowBlur = 0;
      }

      /* -----------------------------------------------------
         CENTRAL ENERGY CORE

         SMALL.

         This is deliberately NOT a giant sun.
         ----------------------------------------------------- */

      const corePulse =
        1 +
        Math.sin(
          time *
            (thinking ? 0.008 : 0.003)
        ) *
          (thinking ? 0.16 : 0.08);

      const coreRadius =
        Math.max(
          7,
          minDimension *
            0.018 *
            corePulse
        );

      /* outer glow */

      const coreGlow =
        ctx.createRadialGradient(
          cx,
          cy,
          0,
          cx,
          cy,
          coreRadius * 5
        );

      coreGlow.addColorStop(
        0,
        "rgba(255,255,230,0.95)"
      );

      coreGlow.addColorStop(
        0.12,
        "rgba(255,220,120,0.9)"
      );

      coreGlow.addColorStop(
        0.3,
        "rgba(255,125,25,0.55)"
      );

      coreGlow.addColorStop(
        0.65,
        "rgba(255,75,10,0.12)"
      );

      coreGlow.addColorStop(
        1,
        "rgba(255,50,0,0)"
      );

      ctx.fillStyle = coreGlow;

      ctx.beginPath();

      ctx.arc(
        cx,
        cy,
        coreRadius * 5,
        0,
        Math.PI * 2
      );

      ctx.fill();

      /* actual core */

      const core =
        ctx.createRadialGradient(
          cx - coreRadius * 0.25,
          cy - coreRadius * 0.25,
          0,
          cx,
          cy,
          coreRadius
        );

      core.addColorStop(
        0,
        "#ffffff"
      );

      core.addColorStop(
        0.4,
        "#fff4c9"
      );

      core.addColorStop(
        0.75,
        "#ffbd4a"
      );

      core.addColorStop(
        1,
        "#ff5b12"
      );

      ctx.fillStyle = core;

      ctx.shadowColor =
        "rgba(255, 110, 20, 1)";

      ctx.shadowBlur =
        thinking ? 28 : 18;

      ctx.beginPath();

      ctx.arc(
        cx,
        cy,
        coreRadius,
        0,
        Math.PI * 2
      );

      ctx.fill();

      ctx.shadowBlur = 0;

      animationRef.current =
        requestAnimationFrame(draw);
    }

    resize();

    window.addEventListener(
      "resize",
      resize
    );

    animationRef.current =
      requestAnimationFrame(draw);

    return () => {
      window.removeEventListener(
        "resize",
        resize
      );

      if (animationRef.current) {
        cancelAnimationFrame(
          animationRef.current
        );
      }
    };
  }, [thinking]);

  return (
    <div className="jarvis-core">
      <canvas
        ref={canvasRef}
        aria-hidden="true"
      />
    </div>
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

  /* =======================================================
     BOOT
     ======================================================= */

  useEffect(() => {
    if (
      visibleBootLines <
      BOOT_LINES.length
    ) {
      const timer =
        setTimeout(() => {
          setVisibleBootLines(
            (value) => value + 1
          );
        }, 300);

      return () =>
        clearTimeout(timer);
    }

    const timer =
      setTimeout(() => {
        setBooted(true);
      }, 500);

    return () =>
      clearTimeout(timer);
  }, [visibleBootLines]);

  /* =======================================================
     AUTO SCROLL
     ======================================================= */

  useEffect(() => {
    if (!logRef.current) return;

    logRef.current.scrollTo({
      top:
        logRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  /* =======================================================
     SPEECH RECOGNITION
     ======================================================= */

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
          "Microphone access was blocked. Allow microphone access for this website."
        );
      } else if (
        event.error !==
        "no-speech"
      ) {
        alert(
          "Voice input error: " +
            event.error
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

  /* =======================================================
     MICROPHONE
     ======================================================= */

  function toggleMic() {
    if (
      !recognitionRef.current
    ) {
      alert(
        "Voice input is not supported by this browser. Try Chrome or Edge."
      );

      return;
    }

    if (listening) {
      try {
        recognitionRef.current.stop();
      } catch {}

      setListening(false);

      return;
    }

    try {
      recognitionRef.current.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  }

  /* =======================================================
     TEXT TO SPEECH
     ======================================================= */

  async function speak(text) {
    if (!voiceOn) return;

    try {
      const response =
        await fetch("/api/speak", {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            text,
          }),
        });

      if (!response.ok) {
        const data =
          await response
            .json()
            .catch(() => null);

        alert(
          "Voice playback failed: " +
            (data?.error ||
              `HTTP ${response.status}`)
        );

        return;
      }

      const blob =
        await response.blob();

      const audioUrl =
        URL.createObjectURL(blob);

      const audio =
        new Audio(audioUrl);

      audio.onended = () => {
        URL.revokeObjectURL(
          audioUrl
        );
      };

      await audio.play();
    } catch (error) {
      alert(
        "Voice playback failed: " +
          error.message
      );
    }
  }

  /* =======================================================
     SEND MESSAGE
     ======================================================= */

  async function sendMessage() {
    const text =
      input.trim();

    if (
      !text ||
      loading
    ) {
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
          .json();

      if (!response.ok) {
        setMessages((current) => [
          ...current,
          {
            role: "assistant",
            content:
              data?.error ||
              "Something went wrong.",
            error: true,
          },
        ]);

        return;
      }

      const reply =
        data?.reply ||
        "I received your request.";

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: reply,
        },
      ]);

      speak(reply);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            "I couldn't reach the server. Check your connection.",
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  /* =======================================================
     BOOT SCREEN
     ======================================================= */

  if (!booted) {
    return (
      <div className="boot-screen">
        {BOOT_LINES.slice(
          0,
          visibleBootLines
        ).map((line, index) => (
          <div
            key={index}
            className={
              "boot-line" +
              (line.dim
                ? " dim"
                : "")
            }
          >
            {line.text}
          </div>
        ))}
      </div>
    );
  }

  /* =======================================================
     UI
     ======================================================= */

  return (
    <main className="app">
      {/* ================================================
          HEADER
          ================================================ */}

      <header className="header">
        <div className="title-block">
          <div className="wordmark">
            J.A.R.V.I.S.
          </div>

          <div className="status-line">
            <span
              className={
                "status-dot" +
                (loading
                  ? " processing"
                  : "")
              }
            />

            {loading
              ? "PROCESSING"
              : "ONLINE"}
          </div>
        </div>

        <button
          type="button"
          className={
            "voice-toggle" +
            (voiceOn
              ? " active"
              : "")
          }
          onClick={() =>
            setVoiceOn(
              (value) =>
                !value
            )
          }
        >
          VOICE{" "}
          {voiceOn
            ? "ON"
            : "OFF"}
        </button>
      </header>

      {/* ================================================
          ENERGY FIELD
          ================================================ */}

      <div className="core-stage">
        <JarvisCore
          thinking={loading}
        />
      </div>

      {/* ================================================
          CHAT
          ================================================ */}

      <section
        className="log"
        ref={logRef}
      >
        {messages.map(
          (message, index) => (
            <div
              key={index}
              className={
                "msg-row " +
                message.role
              }
            >
              <div className="msg-label">
                {message.role ===
                "user"
                  ? "YOU"
                  : "JARVIS"}
              </div>

              <div
                className={
                  "bubble" +
                  (message.error
                    ? " error"
                    : "")
                }
              >
                {message.content}
              </div>
            </div>
          )
        )}

        {loading && (
          <div className="msg-row assistant">
            <div className="msg-label">
              JARVIS
            </div>

            <div className="bubble thinking-row">
              <span />
              <span />
              <span />
            </div>
          </div>
        )}
      </section>

      {/* ================================================
          INPUT
          ================================================ */}

      <footer className="input-bar">
        <button
          type="button"
          className={
            "icon-btn mic" +
            (listening
              ? " listening"
              : "")
          }
          onClick={toggleMic}
          title="Voice input"
          aria-label="Voice input"
        >
          🎙
        </button>

        <input
          type="text"
          value={input}
          onChange={(event) =>
            setInput(
              event.target.value
            )
          }
          onKeyDown={(event) => {
            if (
              event.key ===
              "Enter"
            ) {
              event.preventDefault();
              sendMessage();
            }
          }}
          placeholder="Speak, and I shall listen..."
          disabled={loading}
          autoComplete="off"
        />

        <button
          type="button"
          className="icon-btn send"
          onClick={sendMessage}
          disabled={
            loading ||
            !input.trim()
          }
          title="Send"
          aria-label="Send"
        >
          ➤
        </button>
      </footer>
    </main>
  );
}
