"use client";

import { useEffect, useRef, useState } from "react";

/* =========================================================
   BOOT
========================================================= */

const BOOT_LINES = [
  { text: "INITIALIZING J.A.R.V.I.S. CORE...", dim: false },
  { text: "loading language subsystem", dim: true },
  { text: "calibrating voice interface", dim: true },
  { text: "ALL SYSTEMS NOMINAL", dim: false },
];

/* =========================================================
   ENERGY REACTOR
   Canvas is used instead of SVG because the reference is
   intentionally chaotic and organic.
========================================================= */

function EnergyCore({ thinking }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const stateRef = useRef({
    width: 0,
    height: 0,
    dpr: 1,
    filaments: [],
    particles: [],
    sparks: [],
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let mounted = true;

    const state = stateRef.current;

    /* -----------------------------------------------------
       Utilities
    ----------------------------------------------------- */

    const random = (min, max) => Math.random() * (max - min) + min;

    const clamp = (value, min, max) =>
      Math.max(min, Math.min(max, value));

    /* -----------------------------------------------------
       Create the reactor structure
    ----------------------------------------------------- */

    function createWorld() {
      const base = Math.min(state.width, state.height);

      /*
        The reactor deliberately has no circular orbital
        structure.

        Instead we create:
        - angular filaments
        - fragmented energy trails
        - particles
        - small sparks
      */

      const filamentCount = Math.floor(
        clamp(base / 2.6, 130, 250)
      );

      const particleCount = Math.floor(
        clamp(base * 1.35, 700, 1800)
      );

      const sparkCount = Math.floor(
        clamp(base / 2.5, 120, 260)
      );

      state.filaments = [];
      state.particles = [];
      state.sparks = [];

      /* ---------------------------------------------------
         FILAMENTS
      --------------------------------------------------- */

      for (let i = 0; i < filamentCount; i++) {
        const angle = random(0, Math.PI * 2);

        const startRadius = random(
          base * 0.055,
          base * 0.15
        );

        const length = random(
          base * 0.10,
          base * 0.43
        );

        const points = [];

        let x = Math.cos(angle) * startRadius;
        let y = Math.sin(angle) * startRadius;

        let direction = angle + random(-0.7, 0.7);

        const steps = Math.floor(random(4, 14));

        for (let p = 0; p < steps; p++) {
          /*
            Angular movement rather than smooth curves.
            This is what prevents the "solar system" look.
          */

          direction += random(-0.65, 0.65);

          const stepLength =
            length / steps * random(0.45, 1.25);

          x += Math.cos(direction) * stepLength;
          y += Math.sin(direction) * stepLength;

          points.push({
            x,
            y,
          });
        }

        state.filaments.push({
          points,
          angle,
          speed: random(-0.0009, 0.0009),
          rotation: random(-0.0015, 0.0015),
          opacity: random(0.16, 0.62),
          width: random(0.35, 1.35),
          phase: random(0, Math.PI * 2),
          flicker: random(0.6, 2.2),
        });
      }

      /* ---------------------------------------------------
         PARTICLE CLOUD
      --------------------------------------------------- */

      for (let i = 0; i < particleCount; i++) {
        const angle = random(0, Math.PI * 2);

        /*
          sqrt creates a more natural area distribution.
          We intentionally make the cloud irregular.
        */

        const radius =
          Math.pow(Math.random(), 0.62) *
          base *
          random(0.16, 0.46);

        const irregularity =
          1 +
          Math.sin(angle * random(3, 9)) *
            random(0.04, 0.24);

        state.particles.push({
          angle,
          radius: radius * irregularity,
          size: random(0.35, 1.65),
          opacity: random(0.12, 0.75),
          speed: random(-0.002, 0.002),
          drift: random(-0.18, 0.18),
          phase: random(0, Math.PI * 2),
        });
      }

      /* ---------------------------------------------------
         SMALL ENERGY SPARKS
      --------------------------------------------------- */

      for (let i = 0; i < sparkCount; i++) {
        const angle = random(0, Math.PI * 2);

        const radius =
          random(base * 0.12, base * 0.48);

        state.sparks.push({
          angle,
          radius,
          length: random(3, 22),
          width: random(0.4, 1.1),
          opacity: random(0.12, 0.65),
          speed: random(-0.004, 0.004),
          phase: random(0, Math.PI * 2),
        });
      }
    }

    /* -----------------------------------------------------
       RESIZE
    ----------------------------------------------------- */

    function resize() {
      const rect = canvas.getBoundingClientRect();

      state.width = rect.width;
      state.height = rect.height;

      state.dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = rect.width * state.dpr;
      canvas.height = rect.height * state.dpr;

      ctx.setTransform(
        state.dpr,
        0,
        0,
        state.dpr,
        0,
        0
      );

      createWorld();
    }

    resize();

    window.addEventListener("resize", resize);

    /* -----------------------------------------------------
       DRAW
    ----------------------------------------------------- */

    let time = 0;

    function draw() {
      if (!mounted) return;

      time += thinking ? 1.9 : 0.72;

      const width = state.width;
      const height = state.height;

      const cx = width / 2;
      const cy = height / 2;

      const base = Math.min(width, height);

      /* ---------------------------------------------------
         BACKGROUND
      --------------------------------------------------- */

      ctx.clearRect(0, 0, width, height);

      /*
        Large soft orange haze.
        This is deliberately subtle.
      */

      const ambient = ctx.createRadialGradient(
        cx,
        cy,
        0,
        cx,
        cy,
        base * 0.48
      );

      ambient.addColorStop(
        0,
        thinking
          ? "rgba(255,125,24,0.22)"
          : "rgba(255,115,20,0.13)"
      );

      ambient.addColorStop(
        0.22,
        "rgba(255,86,10,0.09)"
      );

      ambient.addColorStop(
        0.55,
        "rgba(255,50,0,0.025)"
      );

      ambient.addColorStop(
        1,
        "rgba(0,0,0,0)"
      );

      ctx.fillStyle = ambient;

      ctx.fillRect(
        cx - base * 0.5,
        cy - base * 0.5,
        base,
        base
      );

      /* ---------------------------------------------------
         PARTICLES
      --------------------------------------------------- */

      ctx.save();
      ctx.globalCompositeOperation = "lighter";

      for (const p of state.particles) {
        p.angle +=
          p.speed *
          (thinking ? 3.0 : 1.0);

        const breathing =
          Math.sin(
            time * 0.012 +
              p.phase
          ) * p.drift;

        const r =
          p.radius *
          (1 + breathing * 0.07);

        /*
          Add asymmetric distortion.
          This prevents a clean circular cloud.
        */

        const distortionX =
          Math.sin(
            p.angle * 3.7 +
              time * 0.004
          ) *
          base *
          0.012;

        const distortionY =
          Math.cos(
            p.angle * 5.1 -
              time * 0.003
          ) *
          base *
          0.012;

        const x =
          cx +
          Math.cos(p.angle) * r +
          distortionX;

        const y =
          cy +
          Math.sin(p.angle) *
            r *
            0.91 +
          distortionY;

        const flicker =
          0.65 +
          Math.sin(
            time * 0.025 +
              p.phase
          ) *
            0.35;

        ctx.beginPath();

        ctx.arc(
          x,
          y,
          p.size *
            (thinking ? 1.15 : 1),
          0,
          Math.PI * 2
        );

        ctx.fillStyle = `rgba(255, ${
          random(145, 215).toFixed(0)
        }, 55, ${
          (p.opacity * flicker).toFixed(3)
        })`;

        ctx.fill();
      }

      ctx.restore();

      /* ---------------------------------------------------
         ANGULAR ENERGY FILAMENTS
      --------------------------------------------------- */

      ctx.save();

      ctx.translate(cx, cy);

      for (const f of state.filaments) {
        /*
          Slow rotation normally.
          Fast chaotic movement while thinking.
        */

        f.angle +=
          f.speed *
          (thinking ? 7 : 1);

        const pulse =
          0.72 +
          Math.sin(
            time * 0.018 * f.flicker +
              f.phase
          ) *
            0.28;

        const opacity =
          f.opacity *
          pulse *
          (thinking ? 1.18 : 1);

        ctx.save();

        ctx.rotate(f.angle);

        ctx.beginPath();

        for (let i = 0; i < f.points.length; i++) {
          const point = f.points[i];

          /*
            Distort each point independently.
            This produces the hand-drawn / unstable
            energy-network appearance.
          */

          const wobbleX =
            Math.sin(
              time * 0.008 +
                i * 2.1 +
                f.phase
            ) *
            base *
            0.008;

          const wobbleY =
            Math.cos(
              time * 0.009 +
                i * 1.7 +
                f.phase
            ) *
            base *
            0.008;

          const x = point.x + wobbleX;
          const y = point.y + wobbleY;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.strokeStyle = `rgba(255, ${
          thinking ? 115 : 145
        }, 35, ${opacity.toFixed(3)})`;

        ctx.lineWidth =
          f.width *
          (thinking ? 1.18 : 1);

        ctx.shadowBlur =
          thinking ? 8 : 3;

        ctx.shadowColor =
          "rgba(255,100,20,0.7)";

        ctx.stroke();

        ctx.restore();
      }

      ctx.restore();

      /* ---------------------------------------------------
         EXTRA MICRO-FILAMENTS
      --------------------------------------------------- */

      ctx.save();
      ctx.translate(cx, cy);
      ctx.globalCompositeOperation = "lighter";

      const microCount = thinking ? 180 : 85;

      for (let i = 0; i < microCount; i++) {
        const angle =
          i * 2.399 +
          Math.sin(time * 0.002 + i) * 0.12;

        const radius =
          base *
          (0.055 +
            ((i * 37) % 100) / 100 *
              0.43);

        const len =
          random(5, 32) *
          (thinking ? 1.15 : 1);

        const x1 =
          Math.cos(angle) * radius;

        const y1 =
          Math.sin(angle) *
          radius *
          random(0.78, 1.1);

        const x2 =
          x1 +
          Math.cos(
            angle +
              random(-1.1, 1.1)
          ) *
            len;

        const y2 =
          y1 +
          Math.sin(
            angle +
              random(-1.1, 1.1)
          ) *
            len;

        ctx.beginPath();

        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);

        ctx.strokeStyle =
          `rgba(255, ${
            thinking ? 125 : 155
          }, 45, ${
            random(0.08, 0.38)
          })`;

        ctx.lineWidth =
          random(0.25, 0.8);

        ctx.stroke();
      }

      ctx.restore();

      /* ---------------------------------------------------
         SPARKS
      --------------------------------------------------- */

      ctx.save();
      ctx.translate(cx, cy);
      ctx.globalCompositeOperation = "lighter";

      for (const s of state.sparks) {
        s.angle +=
          s.speed *
          (thinking ? 5 : 1);

        const pulse =
          0.5 +
          Math.sin(
            time * 0.035 +
              s.phase
          ) *
            0.5;

        const r = s.radius;

        const x =
          Math.cos(s.angle) * r;

        const y =
          Math.sin(s.angle) *
          r *
          0.92;

        const x2 =
          x +
          Math.cos(
            s.angle +
              random(-0.5, 0.5)
          ) *
            s.length;

        const y2 =
          y +
          Math.sin(
            s.angle +
              random(-0.5, 0.5)
          ) *
            s.length;

        ctx.beginPath();

        ctx.moveTo(x, y);
        ctx.lineTo(x2, y2);

        ctx.strokeStyle =
          `rgba(255, 174, 70, ${
            (s.opacity * pulse).toFixed(3)
          })`;

        ctx.lineWidth =
          s.width *
          (thinking ? 1.2 : 1);

        ctx.stroke();
      }

      ctx.restore();

      /* ---------------------------------------------------
         CENTRAL ENERGY CORE
      --------------------------------------------------- */

      const coreSize =
        base *
        (thinking ? 0.048 : 0.040);

      /*
        Large blurred energy field.
      */

      ctx.save();

      ctx.globalCompositeOperation = "lighter";

      const glow = ctx.createRadialGradient(
        cx,
        cy,
        0,
        cx,
        cy,
        base *
          (thinking ? 0.22 : 0.17)
      );

      glow.addColorStop(
        0,
        "rgba(255,255,245,0.98)"
      );

      glow.addColorStop(
        0.025,
        "rgba(255,245,205,0.98)"
      );

      glow.addColorStop(
        0.07,
        "rgba(255,185,75,0.85)"
      );

      glow.addColorStop(
        0.19,
        "rgba(255,104,18,0.45)"
      );

      glow.addColorStop(
        0.42,
        "rgba(255,55,5,0.14)"
      );

      glow.addColorStop(
        1,
        "rgba(255,40,0,0)"
      );

      ctx.fillStyle = glow;

      ctx.beginPath();

      ctx.arc(
        cx,
        cy,
        base *
          (thinking ? 0.22 : 0.17),
        0,
        Math.PI * 2
      );

      ctx.fill();

      /* ---------------------------------------------------
         WHITE-HOT CORE
      --------------------------------------------------- */

      const coreGradient =
        ctx.createRadialGradient(
          cx - coreSize * 0.2,
          cy - coreSize * 0.2,
          0,
          cx,
          cy,
          coreSize
        );

      coreGradient.addColorStop(
        0,
        "#ffffff"
      );

      coreGradient.addColorStop(
        0.38,
        "#fff8df"
      );

      coreGradient.addColorStop(
        0.72,
        "#ffbd57"
      );

      coreGradient.addColorStop(
        1,
        "rgba(255,105,20,0)"
      );

      ctx.fillStyle = coreGradient;

      ctx.beginPath();

      ctx.arc(
        cx,
        cy,
        coreSize,
        0,
        Math.PI * 2
      );

      ctx.fill();

      ctx.restore();

      /* ---------------------------------------------------
         CENTRAL FLICKERING PARTICLES
      --------------------------------------------------- */

      ctx.save();

      ctx.globalCompositeOperation = "lighter";

      const centralParticles =
        thinking ? 120 : 65;

      for (let i = 0; i < centralParticles; i++) {
        const angle =
          Math.random() *
          Math.PI *
          2;

        const radius =
          Math.random() *
          base *
          (thinking ? 0.13 : 0.10);

        const x =
          cx +
          Math.cos(angle) * radius;

        const y =
          cy +
          Math.sin(angle) * radius;

        ctx.beginPath();

        ctx.arc(
          x,
          y,
          random(0.25, 1.15),
          0,
          Math.PI * 2
        );

        ctx.fillStyle =
          `rgba(255, ${
            random(170, 240)
          }, 90, ${
            random(0.15, 0.8)
          })`;

        ctx.fill();
      }

      ctx.restore();

      animationRef.current =
        requestAnimationFrame(draw);
    }

    draw();

    return () => {
      mounted = false;

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
    <div
      className={`energy-core ${
        thinking ? "thinking" : ""
      }`}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}

/* =========================================================
   MAIN APP
========================================================= */

export default function Home() {
  const [booted, setBooted] = useState(false);
  const [visibleBootLines, setVisibleBootLines] =
    useState(0);

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Good to see you. Systems are online — how can I help?",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [voiceOn, setVoiceOn] = useState(false);
  const [listening, setListening] = useState(false);

  const logRef = useRef(null);
  const recognitionRef = useRef(null);

  /* =======================================================
     BOOT SEQUENCE
  ======================================================= */

  useEffect(() => {
    if (
      visibleBootLines <
      BOOT_LINES.length
    ) {
      const timer = setTimeout(() => {
        setVisibleBootLines(
          (n) => n + 1
        );
      }, 380);

      return () =>
        clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      setBooted(true);
    }, 500);

    return () =>
      clearTimeout(timer);
  }, [visibleBootLines]);

  /* =======================================================
     CHAT AUTO SCROLL
  ======================================================= */

  useEffect(() => {
    const log = logRef.current;

    if (!log) return;

    log.scrollTo({
      top: log.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  /* =======================================================
     SPEECH RECOGNITION
  ======================================================= */

  useEffect(() => {
    if (typeof window === "undefined") {
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
        event.results?.[0]?.[0]?.transcript ||
        "";

      setInput(transcript);
    };

    recognition.onerror = (event) => {
      setListening(false);

      if (
        event.error === "not-allowed" ||
        event.error ===
          "service-not-allowed"
      ) {
        alert(
          "Microphone access was blocked. Allow microphone access for this site."
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
    const recognition =
      recognitionRef.current;

    if (!recognition) {
      alert(
        "Voice input isn't supported in this browser. Try Chrome or Edge."
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

      const audioBlob =
        await response.blob();

      const audioUrl =
        URL.createObjectURL(
          audioBlob
        );

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
        await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            messages:
              nextMessages,
          }),
        });

      const data =
        await response
          .json()
          .catch(() => ({}));

      if (!response.ok) {
        setMessages((current) => [
          ...current,
          {
            role: "assistant",
            content:
              data.error ||
              "Something went wrong.",
            error: true,
          },
        ]);

        return;
      }

      const reply =
        data.reply ||
        "I received your message.";

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: reply,
        },
      ]);

      await speak(reply);
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
    );
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <main className="app">
      {/* HEADER */}

      <header className="header">
        <div className="title-block">
          <div className="wordmark">
            J.A.R.V.I.S.
          </div>

          <div className="status-line">
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
          className={`voice-toggle ${
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
          VOICE{" "}
          {voiceOn
            ? "ON"
            : "OFF"}
        </button>
      </header>

      {/* ENERGY CORE */}

      <div className="core-stage">
        <EnergyCore
          thinking={loading}
        />
      </div>

      {/* CHAT */}

      <section
        className="log"
        ref={logRef}
        aria-live="polite"
      >
        {messages.map(
          (message, index) => (
            <div
              key={index}
              className={`msg-row ${
                message.role
              }`}
            >
              <div className="msg-label">
                {message.role ===
                "user"
                  ? "YOU"
                  : "JARVIS"}
              </div>

              <div
                className={`bubble ${
                  message.error
                    ? "error"
                    : ""
                }`}
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

      {/* INPUT */}

      <footer className="input-bar">
        <button
          type="button"
          className={`icon-btn mic ${
            listening
              ? "listening"
              : ""
          }`}
          onClick={toggleMic}
          title="Voice input"
          aria-label="Voice input"
        >
          🎙
        </button>

        <input
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
          aria-label="Message JARVIS"
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
