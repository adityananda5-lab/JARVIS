"use client";

import { useEffect, useRef, useState } from "react";

const BOOT_LINES = [
  { text: "INITIALIZING J.A.R.V.I.S. CORE...", dim: false },
  { text: "loading language subsystem", dim: true },
  { text: "calibrating voice interface", dim: true },
  { text: "ALL SYSTEMS NOMINAL", dim: false },
];

/* =========================================================
   ENERGY CORE
   ========================================================= */

function EnergyCore({ thinking }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    let animationFrame;

    const particles = [];
    const filaments = [];
    const arcs = [];

    const TAU = Math.PI * 2;

    /*
      Deterministic pseudo-random generator.
      This gives us a chaotic-looking field without
      changing unpredictably between renders.
    */
    let seed = 928371;

    function random() {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    }

    function resize() {
      width = canvas.clientWidth;
      height = canvas.clientHeight;

      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = width * dpr;
      canvas.height = height * dpr;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    /*
      Particle field
    */
    function createParticles() {
      particles.length = 0;

      const count = 900;

      for (let i = 0; i < count; i++) {
        const angle = random() * TAU;

        /*
          Most particles stay close to the energy core,
          while some are thrown much farther away.
        */
        const distance =
          Math.pow(random(), 0.72) *
          Math.min(width, height) *
          0.43;

        particles.push({
          angle,
          distance,

          size: 0.25 + random() * 1.7,

          speed:
            (0.0007 + random() * 0.0025) *
            (random() > 0.5 ? 1 : -1),

          drift:
            (random() - 0.5) *
            0.035,

          alpha: 0.18 + random() * 0.72,

          phase: random() * TAU,

          warm: random(),

          radial:
            (random() - 0.5) *
            0.5,
        });
      }
    }

    /*
      Chaotic energy filaments.
      These are NOT clean radial rays.
    */
    function createFilaments() {
      filaments.length = 0;

      const count = 85;

      for (let i = 0; i < count; i++) {
        const points = [];

        const baseAngle = random() * TAU;

        const length =
          Math.min(width, height) *
          (0.18 + random() * 0.38);

        const segments = 12 + Math.floor(random() * 15);

        for (let j = 0; j <= segments; j++) {
          const progress = j / segments;

          const radius =
            progress *
            length *
            (0.65 + random() * 0.5);

          const wobble =
            Math.sin(progress * 11 + random() * 5) *
            (10 + random() * 20);

          const angle =
            baseAngle +
            wobble * 0.008 +
            (random() - 0.5) * 0.08;

          points.push({
            radius,
            angle,
            progress,
          });
        }

        filaments.push({
          points,

          width:
            0.3 + random() * 1.2,

          alpha:
            0.08 + random() * 0.35,

          speed:
            0.002 + random() * 0.006,

          phase: random() * TAU,
        });
      }
    }

    /*
      Broken irregular arcs.
      These create the fragmented JARVIS-machine look.
    */
    function createArcs() {
      arcs.length = 0;

      const count = 42;

      for (let i = 0; i < count; i++) {
        arcs.push({
          radius:
            Math.min(width, height) *
            (0.13 + random() * 0.32),

          start:
            random() * TAU,

          length:
            0.12 + random() * 0.7,

          width:
            0.4 + random() * 1.4,

          alpha:
            0.1 + random() * 0.5,

          speed:
            (random() - 0.5) * 0.006,

          phase:
            random() * TAU,
        });
      }
    }

    function initialize() {
      seed = 928371;

      createParticles();
      createFilaments();
      createArcs();
    }

    function drawGlow(cx, cy, radius, alpha) {
      const gradient = ctx.createRadialGradient(
        cx,
        cy,
        0,
        cx,
        cy,
        radius
      );

      gradient.addColorStop(
        0,
        `rgba(255,255,245,${alpha})`
      );

      gradient.addColorStop(
        0.08,
        `rgba(255,242,195,${alpha * 0.95})`
      );

      gradient.addColorStop(
        0.25,
        `rgba(255,180,65,${alpha * 0.75})`
      );

      gradient.addColorStop(
        0.5,
        `rgba(255,105,15,${alpha * 0.32})`
      );

      gradient.addColorStop(
        1,
        "rgba(255,70,0,0)"
      );

      ctx.fillStyle = gradient;

      ctx.beginPath();

      ctx.arc(cx, cy, radius, 0, TAU);

      ctx.fill();
    }

    function draw(timestamp) {
      const time = timestamp * 0.001;

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      /*
        Slightly off-center energy makes it feel less
        like a perfect astronomical object.
      */
      const coreX =
        cx +
        Math.sin(time * 0.4) * width * 0.006;

      const coreY =
        cy +
        Math.cos(time * 0.31) * height * 0.006;

      const minSize = Math.min(width, height);

      /*
        Processing mode dramatically increases energy.
      */
      const intensity = thinking ? 1.8 : 1;

      /*
        Large ambient glow.
      */
      drawGlow(
        coreX,
        coreY,
        minSize * (thinking ? 0.32 : 0.25),
        thinking ? 0.24 : 0.16
      );

      /*
        ---------------------------------------------------
        BROKEN ENERGY ARCS
        ---------------------------------------------------
      */

      ctx.save();

      arcs.forEach((arc, index) => {
        arc.start += arc.speed * intensity;

        const pulse =
          0.65 +
          Math.sin(time * 2 + arc.phase) * 0.35;

        ctx.beginPath();

        ctx.arc(
          coreX,
          coreY,
          arc.radius *
            (thinking
              ? 1.08 + Math.sin(time + index) * 0.03
              : 1),
          arc.start,
          arc.start + arc.length
        );

        ctx.strokeStyle = `rgba(
          ${255},
          ${145 + Math.floor(pulse * 80)},
          ${40 + Math.floor(pulse * 40)},
          ${arc.alpha * pulse * intensity}
        )`;

        ctx.lineWidth =
          arc.width *
          (thinking ? 1.3 : 1);

        ctx.shadowBlur = thinking ? 10 : 4;
        ctx.shadowColor = "rgba(255,110,20,0.7)";

        ctx.stroke();
      });

      ctx.restore();

      /*
        ---------------------------------------------------
        CHAOTIC FILAMENTS
        ---------------------------------------------------
      */

      ctx.save();

      filaments.forEach((filament, index) => {
        const rotation =
          Math.sin(
            time * filament.speed * 35 +
              filament.phase
          ) *
          0.08;

        ctx.beginPath();

        filament.points.forEach((point, pIndex) => {
          const wobble =
            Math.sin(
              time * 3 +
                pIndex * 0.9 +
                filament.phase
            ) *
            (thinking ? 7 : 3);

          const angle =
            point.angle +
            rotation +
            wobble * 0.003;

          const radius =
            point.radius *
            (thinking
              ? 1.08 + Math.sin(time * 2 + index) * 0.04
              : 1);

          const x =
            coreX +
            Math.cos(angle) * radius;

          const y =
            coreY +
            Math.sin(angle) * radius;

          if (pIndex === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });

        const flicker =
          0.55 +
          Math.sin(time * 5 + filament.phase) *
            0.45;

        ctx.strokeStyle = `rgba(
          255,
          ${105 + Math.floor(flicker * 100)},
          ${20 + Math.floor(flicker * 50)},
          ${filament.alpha *
            flicker *
            intensity}
        )`;

        ctx.lineWidth =
          filament.width *
          (thinking ? 1.5 : 1);

        ctx.shadowBlur = thinking ? 14 : 5;
        ctx.shadowColor =
          "rgba(255,100,10,0.8)";

        ctx.stroke();
      });

      ctx.restore();

      /*
        ---------------------------------------------------
        PARTICLES
        ---------------------------------------------------
      */

      ctx.save();

      ctx.globalCompositeOperation = "lighter";

      particles.forEach((particle, index) => {
        particle.angle +=
          particle.speed *
          intensity;

        particle.distance +=
          particle.radial *
          0.015 *
          intensity;

        const breathing =
          1 +
          Math.sin(
            time * 2.2 +
              particle.phase
          ) *
            0.04;

        let radius =
          particle.distance *
          breathing;

        /*
          Processing throws particles outward.
        */
        if (thinking) {
          radius *=
            1 +
            Math.sin(
              time * 1.8 +
                particle.phase
            ) *
              0.08;
        }

        const x =
          coreX +
          Math.cos(particle.angle) *
            radius;

        const y =
          coreY +
          Math.sin(particle.angle) *
            radius;

        const flicker =
          0.55 +
          Math.sin(
            time * 3 +
              particle.phase
          ) *
            0.45;

        const alpha =
          particle.alpha *
          flicker *
          intensity;

        const size =
          particle.size *
          (thinking ? 1.2 : 1);

        /*
          Tiny particle.
        */
        ctx.beginPath();

        ctx.arc(
          x,
          y,
          size,
          0,
          TAU
        );

        ctx.fillStyle =
          particle.warm > 0.5
            ? `rgba(255,196,110,${alpha})`
            : `rgba(255,116,25,${alpha})`;

        ctx.shadowBlur =
          size > 1 ? 8 : 3;

        ctx.shadowColor =
          "rgba(255,120,25,0.8)";

        ctx.fill();

        /*
          A small percentage become streak particles.
        */
        if (
          index % 17 === 0 &&
          radius > minSize * 0.1
        ) {
          const streakLength =
            (thinking ? 20 : 9) +
            Math.sin(
              time * 4 +
                particle.phase
            ) *
              6;

          const dx =
            Math.cos(particle.angle) *
            streakLength;

          const dy =
            Math.sin(particle.angle) *
            streakLength;

          ctx.beginPath();

          ctx.moveTo(x, y);

          ctx.lineTo(
            x + dx,
            y + dy
          );

          ctx.strokeStyle =
            `rgba(255,145,50,${
              alpha * 0.5
            })`;

          ctx.lineWidth =
            size * 0.55;

          ctx.stroke();
        }
      });

      ctx.restore();

      /*
        ---------------------------------------------------
        CENTRAL ENERGY CORE
        ---------------------------------------------------
      */

      const pulse =
        1 +
        Math.sin(
          time *
            (thinking ? 8 : 3)
        ) *
          (thinking ? 0.1 : 0.045);

      /*
        Outer white-hot glow.
      */
      drawGlow(
        coreX,
        coreY,
        minSize *
          0.14 *
          pulse *
          (thinking ? 1.15 : 1),
        thinking ? 0.75 : 0.55
      );

      /*
        Orange plasma layer.
      */
      const plasma = ctx.createRadialGradient(
        coreX,
        coreY,
        0,
        coreX,
        coreY,
        minSize * 0.075
      );

      plasma.addColorStop(
        0,
        "rgba(255,255,255,1)"
      );

      plasma.addColorStop(
        0.18,
        "rgba(255,248,218,1)"
      );

      plasma.addColorStop(
        0.38,
        "rgba(255,207,111,0.98)"
      );

      plasma.addColorStop(
        0.68,
        "rgba(255,112,10,0.75)"
      );

      plasma.addColorStop(
        1,
        "rgba(255,70,0,0)"
      );

      ctx.fillStyle = plasma;

      ctx.beginPath();

      ctx.arc(
        coreX,
        coreY,
        minSize *
          0.075 *
          pulse,
        0,
        TAU
      );

      ctx.fill();

      /*
        White-hot center.
      */
      const whiteRadius =
        minSize *
        0.028 *
        pulse;

      const whiteGlow =
        ctx.createRadialGradient(
          coreX,
          coreY,
          0,
          coreX,
          coreY,
          whiteRadius
        );

      whiteGlow.addColorStop(
        0,
        "rgba(255,255,255,1)"
      );

      whiteGlow.addColorStop(
        0.5,
        "rgba(255,255,245,0.95)"
      );

      whiteGlow.addColorStop(
        1,
        "rgba(255,220,150,0)"
      );

      ctx.fillStyle = whiteGlow;

      ctx.beginPath();

      ctx.arc(
        coreX,
        coreY,
        whiteRadius,
        0,
        TAU
      );

      ctx.fill();

      /*
        ---------------------------------------------------
        RANDOM ENERGY IMPULSES
        ---------------------------------------------------
      */

      ctx.save();

      const impulseCount = thinking ? 38 : 18;

      for (let i = 0; i < impulseCount; i++) {
        const angle =
          (i / impulseCount) *
            TAU +
          Math.sin(
            time * 2 + i
          ) *
            0.15;

        const inner =
          minSize *
          (0.04 + Math.sin(i * 4.2) * 0.015);

        const outer =
          minSize *
          (0.11 +
            Math.abs(
              Math.sin(
                i * 9.31
              )
            ) *
              (thinking
                ? 0.42
                : 0.27));

        const x1 =
          coreX +
          Math.cos(angle) *
            inner;

        const y1 =
          coreY +
          Math.sin(angle) *
            inner;

        const x2 =
          coreX +
          Math.cos(angle) *
            outer;

        const y2 =
          coreY +
          Math.sin(angle) *
            outer;

        ctx.beginPath();

        ctx.moveTo(x1, y1);

        /*
          Slightly crooked impulse.
        */
        ctx.lineTo(
          (x1 + x2) / 2 +
            Math.sin(
              time * 4 + i
            ) *
              8,
          (y1 + y2) / 2 +
            Math.cos(
              time * 3 + i
            ) *
              8
        );

        ctx.lineTo(x2, y2);

        ctx.strokeStyle =
          `rgba(255,${130 + (i % 5) * 20},40,${
            thinking ? 0.4 : 0.2
          })`;

        ctx.lineWidth =
          thinking ? 1.1 : 0.7;

        ctx.shadowBlur = 12;

        ctx.shadowColor =
          "rgba(255,100,20,0.8)";

        ctx.stroke();
      }

      ctx.restore();

      animationFrame =
        requestAnimationFrame(draw);
    }

    resize();
    initialize();

    window.addEventListener(
      "resize",
      resize
    );

    animationFrame =
      requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(
        animationFrame
      );

      window.removeEventListener(
        "resize",
        resize
      );
    };
  }, [thinking]);

  return (
    <div
      className={`energy-core ${
        thinking ? "processing" : ""
      }`}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
      />
    </div>
  );
}

/* =========================================================
   MAIN APPLICATION
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

  /* Boot sequence */
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
        }, 380);

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

  /* Auto-scroll */
  useEffect(() => {
    if (!logRef.current) return;

    logRef.current.scrollTo({
      top:
        logRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  /* Speech recognition */
  useEffect(() => {
    const SpeechRecognition =
      typeof window !==
        "undefined" &&
      (window.SpeechRecognition ||
        window.webkitSpeechRecognition);

    if (!SpeechRecognition) return;

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

  function toggleMic() {
    if (!recognitionRef.current) {
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

      const url =
        URL.createObjectURL(blob);

      const audio =
        new Audio(url);

      audio.onended = () => {
        URL.revokeObjectURL(url);
      };

      await audio.play();
    } catch (error) {
      alert(
        "Voice playback failed: " +
          error.message
      );
    }
  }

  async function sendMessage() {
    const text =
      input.trim();

    if (!text || loading) return;

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

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: data.reply,
        },
      ]);

      speak(data.reply);
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
              line.dim ? "dim" : ""
            }`}
          >
            {line.text}
          </div>
        ))}
      </div>
    );
  }

  return (
    <main className="app">
      <header className="header">
        <div className="title-block">
          <div className="wordmark">
            J.A.R.V.I.S.
          </div>

          <div className="status-line">
            <span className="status-dot" />

            {loading
              ? "PROCESSING"
              : "ONLINE"}
          </div>
        </div>

        <button
          className={`voice-toggle ${
            voiceOn ? "active" : ""
          }`}
          onClick={() =>
            setVoiceOn(
              (value) => !value
            )
          }
        >
          VOICE{" "}
          {voiceOn ? "ON" : "OFF"}
        </button>
      </header>

      <section className="core-stage">
        <EnergyCore
          thinking={loading}
        />
      </section>

      <section
        className="log"
        ref={logRef}
      >
        {messages.map(
          (message, index) => (
            <div
              key={index}
              className={`msg-row ${message.role}`}
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

      <footer className="input-bar">
        <button
          className={`icon-btn mic ${
            listening
              ? "listening"
              : ""
          }`}
          onClick={toggleMic}
          title="Voice input"
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
              sendMessage();
            }
          }}
          placeholder="Speak, and I shall listen..."
          disabled={loading}
        />

        <button
          className="icon-btn send"
          onClick={sendMessage}
          disabled={
            loading ||
            !input.trim()
          }
          title="Send"
        >
          ➤
        </button>
      </footer>
    </main>
  );
}
