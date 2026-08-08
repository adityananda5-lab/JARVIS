"use client";

import { useEffect, useRef, useState } from "react";

/* =========================================================
   BOOT SEQUENCE
========================================================= */

const BOOT_LINES = [
  { text: "INITIALIZING J.A.R.V.I.S. CORE...", dim: false },
  { text: "loading language subsystem", dim: true },
  { text: "calibrating voice interface", dim: true },
  { text: "mapping cognitive pathways", dim: true },
  { text: "ALL SYSTEMS NOMINAL", dim: false },
];

/* =========================================================
   JARVIS ENERGY CORE
   Canvas-based instead of SVG.

   Important:
   There are intentionally NO clean orbital rings here.
   The visual is constructed from:
   - particles
   - irregular wire fragments
   - radial energy traces
   - broken arcs
   - depth layers
   - a central plasma core
========================================================= */

function EnergyCore({ active, listening }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", {
      alpha: true,
      desynchronized: true,
    });

    if (!ctx) return;

    let animationFrame;
    let width = 0;
    let height = 0;
    let dpr = 1;

    const TAU = Math.PI * 2;

    /*
      Deterministic random generator.
      This makes the geometry stable instead of changing
      completely every time the component renders.
    */
    let seed = 834723;

    function random() {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;

      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;

      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }

    function randomRange(min, max) {
      return min + random() * (max - min);
    }

    /* -----------------------------------------------------
       Particle field
    ----------------------------------------------------- */

    const particles = [];
    const shards = [];
    const rays = [];
    const brokenArcs = [];

    const PARTICLE_COUNT = 520;
    const SHARD_COUNT = 145;
    const RAY_COUNT = 105;
    const ARC_COUNT = 12;

    function createParticles() {
      particles.length = 0;

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const angle = random() * TAU;

        /*
          Cubic distribution keeps a lot of particles close
          to the reactor while still allowing outer particles.
        */
        const radius =
          0.08 +
          Math.pow(random(), 0.48) * 0.82;

        const depth = randomRange(-1, 1);

        particles.push({
          angle,
          radius,
          depth,

          size: randomRange(0.35, 1.65),
          alpha: randomRange(0.28, 0.95),

          speed: randomRange(0.08, 0.42) *
            (random() > 0.5 ? 1 : -1),

          wobble: randomRange(0.2, 1.5),
          phase: random() * TAU,

          warm: random() > 0.18,
        });
      }
    }

    /* -----------------------------------------------------
       Chaotic angular wireframe fragments
    ----------------------------------------------------- */

    function createShards() {
      shards.length = 0;

      for (let i = 0; i < SHARD_COUNT; i++) {
        const angle = random() * TAU;

        const startRadius = randomRange(0.15, 0.78);
        const pointCount = Math.floor(randomRange(3, 8));

        const points = [];

        let currentAngle = angle;
        let currentRadius = startRadius;

        for (let p = 0; p < pointCount; p++) {
          /*
            Angular movement deliberately jumps around.
            This creates the broken holographic geometry
            seen in the reference instead of clean spokes.
          */
          currentAngle += randomRange(-0.55, 0.55);
          currentRadius += randomRange(-0.14, 0.20);

          currentRadius = Math.max(
            0.08,
            Math.min(1.18, currentRadius)
          );

          points.push({
            angle: currentAngle,
            radius: currentRadius,
            offset: randomRange(-0.035, 0.035),
          });
        }

        shards.push({
          points,
          rotation: randomRange(-0.02, 0.02),
          speed: randomRange(-0.12, 0.12),
          alpha: randomRange(0.16, 0.68),
          width: randomRange(0.35, 1.15),
          phase: random() * TAU,
          pulse: randomRange(0.5, 2),
        });
      }
    }

    /* -----------------------------------------------------
       Irregular outward energy traces
    ----------------------------------------------------- */

    function createRays() {
      rays.length = 0;

      for (let i = 0; i < RAY_COUNT; i++) {
        const angle = random() * TAU;

        const start = randomRange(0.10, 0.32);
        const length = randomRange(0.25, 1.05);

        rays.push({
          angle,
          start,
          length,

          bend: randomRange(-0.18, 0.18),

          alpha: randomRange(0.08, 0.42),
          width: randomRange(0.25, 0.85),

          speed: randomRange(0.04, 0.20),
          phase: random() * TAU,
        });
      }
    }

    /* -----------------------------------------------------
       Broken arcs
       These are intentionally sparse and irregular.
       They are NOT orbital rings.
    ----------------------------------------------------- */

    function createBrokenArcs() {
      brokenArcs.length = 0;

      for (let i = 0; i < ARC_COUNT; i++) {
        brokenArcs.push({
          angle: random() * TAU,
          radius: randomRange(0.42, 0.95),
          start: randomRange(0, TAU),
          length: randomRange(0.20, 0.85),
          width: randomRange(0.3, 0.85),
          alpha: randomRange(0.15, 0.38),
          speed: randomRange(-0.035, 0.035),
          eccentricity: randomRange(0.72, 1.08),
        });
      }
    }

    createParticles();
    createShards();
    createRays();
    createBrokenArcs();

    /* -----------------------------------------------------
       Resize
    ----------------------------------------------------- */

    function resize() {
      const rect = canvas.getBoundingClientRect();

      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);

      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    /* -----------------------------------------------------
       Drawing helpers
    ----------------------------------------------------- */

    function pointFromPolar(angle, radius, time, depth = 0) {
      const maxRadius = Math.min(width, height) * 0.49;

      /*
        Very subtle turbulence.
        This prevents the visual from becoming a perfect circle.
      */
      const turbulence =
        Math.sin(time * 0.00055 + angle * 4.2 + depth * 3) *
        maxRadius *
        0.008;

      const r = radius * maxRadius + turbulence;

      /*
        Depth compresses the Y axis slightly.
        This gives the field a holographic 3D impression.
      */
      const depthScale = 0.88 + depth * 0.08;

      return {
        x: Math.cos(angle) * r,
        y: Math.sin(angle) * r * depthScale,
      };
    }

    function drawCore(cx, cy, time, intensity) {
      const coreSize =
        Math.min(width, height) *
        (0.038 + intensity * 0.012);

      /* Outer atmospheric glow */
      const outer = ctx.createRadialGradient(
        cx,
        cy,
        0,
        cx,
        cy,
        coreSize * 7
      );

      outer.addColorStop(0, `rgba(255, 232, 190, ${0.55 * intensity})`);
      outer.addColorStop(0.16, `rgba(255, 166, 55, ${0.42 * intensity})`);
      outer.addColorStop(0.42, `rgba(255, 100, 10, ${0.16 * intensity})`);
      outer.addColorStop(1, "rgba(255, 60, 0, 0)");

      ctx.fillStyle = outer;
      ctx.beginPath();
      ctx.arc(cx, cy, coreSize * 7, 0, TAU);
      ctx.fill();

      /* Inner orange plasma */
      const glow = ctx.createRadialGradient(
        cx - coreSize * 0.12,
        cy - coreSize * 0.12,
        0,
        cx,
        cy,
        coreSize * 1.8
      );

      glow.addColorStop(0, "#ffffff");
      glow.addColorStop(0.22, "#fff5dc");
      glow.addColorStop(0.48, "#ffc15a");
      glow.addColorStop(0.72, "#ff7a0a");
      glow.addColorStop(1, "rgba(255, 71, 0, 0)");

      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, coreSize * 1.8, 0, TAU);
      ctx.fill();

      /* White hot center */
      ctx.fillStyle = "#fffdf5";
      ctx.shadowColor = "#fff1c9";
      ctx.shadowBlur = 20 + intensity * 20;

      ctx.beginPath();
      ctx.arc(cx, cy, coreSize * 0.62, 0, TAU);
      ctx.fill();

      ctx.shadowBlur = 0;

      /*
        Small plasma tendrils around the core.
      */
      ctx.save();
      ctx.globalCompositeOperation = "lighter";

      for (let i = 0; i < 20; i++) {
        const a =
          (i / 20) * TAU +
          Math.sin(time * 0.001 + i) * 0.15;

        const innerR = coreSize * 1.15;
        const outerR =
          coreSize *
          randomRange(2.1, 3.6);

        const wobble =
          Math.sin(time * 0.002 + i * 2.4) * 3;

        ctx.strokeStyle =
          `rgba(255, ${125 + (i % 3) * 25}, 35, ${0.10 + intensity * 0.10})`;

        ctx.lineWidth = 0.45;

        ctx.beginPath();
        ctx.moveTo(
          cx + Math.cos(a) * innerR,
          cy + Math.sin(a) * innerR
        );

        ctx.lineTo(
          cx + Math.cos(a + 0.08) * outerR + wobble,
          cy + Math.sin(a + 0.08) * outerR
        );

        ctx.stroke();
      }

      ctx.restore();
    }

    /* -----------------------------------------------------
       Main render loop
    ----------------------------------------------------- */

    function render(time) {
      /*
        State intensity:
        idle       = 1
        listening  = 1.35
        processing = 1.75
      */
      const intensity = active
        ? 1.75
        : listening
        ? 1.35
        : 1;

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      /* Very faint atmospheric background */
      const atmosphere = ctx.createRadialGradient(
        cx,
        cy,
        0,
        cx,
        cy,
        Math.min(width, height) * 0.52
      );

      atmosphere.addColorStop(
        0,
        `rgba(255, 106, 20, ${0.045 * intensity})`
      );

      atmosphere.addColorStop(
        0.45,
        `rgba(255, 72, 10, ${0.018 * intensity})`
      );

      atmosphere.addColorStop(1, "rgba(0,0,0,0)");

      ctx.fillStyle = atmosphere;
      ctx.fillRect(0, 0, width, height);

      /* ---------------------------------------------------
         Irregular energy rays
      --------------------------------------------------- */

      ctx.save();
      ctx.translate(cx, cy);
      ctx.globalCompositeOperation = "lighter";

      for (let i = 0; i < rays.length; i++) {
        const r = rays[i];

        const animatedAngle =
          r.angle +
          time * 0.00002 * r.speed * intensity;

        const pulse =
          0.7 +
          Math.sin(
            time * 0.001 * (0.8 + r.speed * 4) +
              r.phase
          ) *
            0.3;

        const startPoint = pointFromPolar(
          animatedAngle,
          r.start,
          time,
          0
        );

        const endPoint = pointFromPolar(
          animatedAngle + r.bend,
          r.start + r.length * pulse,
          time,
          0
        );

        ctx.strokeStyle = `rgba(255, ${
          95 + Math.floor(r.alpha * 100)
        }, 20, ${
          r.alpha * intensity
        })`;

        ctx.lineWidth = r.width;

        ctx.beginPath();
        ctx.moveTo(startPoint.x, startPoint.y);

        /*
          A kink halfway through the line.
          This is important: straight spokes look like a sun.
        */
        const middle = pointFromPolar(
          animatedAngle + r.bend * 0.4,
          r.start + r.length * pulse * 0.48,
          time,
          0
        );

        ctx.lineTo(middle.x, middle.y);
        ctx.lineTo(endPoint.x, endPoint.y);
        ctx.stroke();
      }

      ctx.restore();

      /* ---------------------------------------------------
         Chaotic wireframe fragments
      --------------------------------------------------- */

      ctx.save();
      ctx.translate(cx, cy);
      ctx.globalCompositeOperation = "lighter";

      for (let i = 0; i < shards.length; i++) {
        const shard = shards[i];

        const rotation =
          shard.rotation +
          time * 0.00001 * shard.speed * intensity;

        const flicker =
          0.55 +
          Math.sin(
            time * 0.001 * shard.pulse +
              shard.phase
          ) *
            0.45;

        ctx.beginPath();

        for (let p = 0; p < shard.points.length; p++) {
          const point = shard.points[p];

          const angle =
            point.angle +
            rotation +
            Math.sin(
              time * 0.0005 +
                p * 1.7 +
                shard.phase
            ) *
              0.012;

          const radius =
            point.radius +
            Math.sin(
              time * 0.0008 +
                p * 2.1 +
                shard.phase
            ) *
              0.018;

          const pos = pointFromPolar(
            angle,
            radius,
            time,
            p % 2 === 0 ? 0.5 : -0.5
          );

          if (p === 0) {
            ctx.moveTo(pos.x, pos.y);
          } else {
            ctx.lineTo(pos.x, pos.y);
          }
        }

        const gold =
          i % 5 === 0
            ? "255, 206, 105"
            : "255, 135, 35";

        ctx.strokeStyle =
          `rgba(${gold}, ${
            shard.alpha * flicker * intensity
          })`;

        ctx.lineWidth =
          shard.width *
          (active ? 1.12 : 1);

        ctx.stroke();
      }

      ctx.restore();

      /* ---------------------------------------------------
         Broken arcs
      --------------------------------------------------- */

      ctx.save();
      ctx.translate(cx, cy);
      ctx.globalCompositeOperation = "lighter";

      for (let i = 0; i < brokenArcs.length; i++) {
        const arc = brokenArcs[i];

        const rotation =
          arc.angle +
          time * 0.0001 * arc.speed;

        const radius =
          arc.radius *
          Math.min(width, height) *
          0.49;

        ctx.save();
        ctx.rotate(rotation);

        ctx.beginPath();

        /*
          Elliptical, broken and incomplete.
          This prevents the "solar system" effect.
        */
        ctx.ellipse(
          0,
          0,
          radius,
          radius * arc.eccentricity,
          0,
          arc.start,
          arc.start + arc.length
        );

        ctx.strokeStyle =
          `rgba(255, 179, 71, ${
            arc.alpha * intensity
          })`;

        ctx.lineWidth = arc.width;
        ctx.stroke();

        ctx.restore();
      }

      ctx.restore();

      /* ---------------------------------------------------
         Particles
      --------------------------------------------------- */

      ctx.save();
      ctx.translate(cx, cy);
      ctx.globalCompositeOperation = "lighter";

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.angle +=
          p.speed *
          0.00002 *
          intensity;

        const animatedRadius =
          p.radius +
          Math.sin(
            time * 0.0007 * p.wobble +
              p.phase
          ) *
            0.018 *
            intensity;

        const pos = pointFromPolar(
          p.angle,
          animatedRadius,
          time,
          p.depth
        );

        /*
          Particles closer to the camera are larger.
        */
        const depthSize =
          p.size *
          (0.72 + (p.depth + 1) * 0.28);

        const flicker =
          0.55 +
          Math.sin(
            time * 0.002 +
              p.phase
          ) *
            0.45;

        const alpha =
          p.alpha *
          flicker *
          (active ? 1.22 : 1);

        ctx.fillStyle = p.warm
          ? `rgba(255, ${
              135 + Math.floor(p.depth * 25)
            }, 50, ${alpha})`
          : `rgba(255, 210, 135, ${alpha})`;

        ctx.beginPath();
        ctx.arc(
          pos.x,
          pos.y,
          depthSize,
          0,
          TAU
        );
        ctx.fill();
      }

      ctx.restore();

      /* ---------------------------------------------------
         Central core last, so it sits above everything.
      --------------------------------------------------- */

      drawCore(
        cx,
        cy,
        time,
        intensity
      );

      animationFrame =
        requestAnimationFrame(render);
    }

    animationFrame =
      requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
    };
  }, [active, listening]);

  return (
    <div
      className={`energy-core ${
        active ? "processing" : ""
      } ${listening ? "listening" : ""}`}
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
  const audioRef = useRef(null);

  /* -------------------------------------------------------
     Boot sequence
  ------------------------------------------------------- */

  useEffect(() => {
    if (
      visibleBootLines <
      BOOT_LINES.length
    ) {
      const timer = setTimeout(() => {
        setVisibleBootLines(
          (value) => value + 1
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

  /* -------------------------------------------------------
     Auto scroll
  ------------------------------------------------------- */

  useEffect(() => {
    const log = logRef.current;

    if (!log) return;

    requestAnimationFrame(() => {
      log.scrollTo({
        top: log.scrollHeight,
        behavior: "smooth",
      });
    });
  }, [messages, loading]);

  /* -------------------------------------------------------
     Speech recognition
  ------------------------------------------------------- */

  useEffect(() => {
    const SpeechRecognition =
      typeof window !== "undefined" &&
      (window.SpeechRecognition ||
        window.webkitSpeechRecognition);

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
        event.results?.[0]?.[0]?.transcript;

      if (transcript) {
        setInput(transcript);
      }
    };

    recognition.onerror = (event) => {
      setListening(false);

      if (
        event.error === "not-allowed" ||
        event.error ===
          "service-not-allowed"
      ) {
        alert(
          "Microphone access was blocked. Allow microphone access for this website and try again."
        );
      } else if (
        event.error !== "no-speech" &&
        event.error !== "aborted"
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
        recognition.abort();
      } catch {}
    };
  }, []);

  /* -------------------------------------------------------
     Microphone
  ------------------------------------------------------- */

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

  /* -------------------------------------------------------
     Voice output
  ------------------------------------------------------- */

  async function speak(text) {
    if (!voiceOn || !text) {
      return;
    }

    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }

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

        throw new Error(
          data?.error ||
            `HTTP ${response.status}`
        );
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
      };

      audio.onerror = () => {
        URL.revokeObjectURL(url);
      };

      await audio.play();
    } catch (error) {
      console.error(
        "Voice playback failed:",
        error
      );

      alert(
        "Voice playback failed: " +
          (error?.message ||
            "Unknown error")
      );
    }
  }

  /* -------------------------------------------------------
     Chat
  ------------------------------------------------------- */

  async function sendMessage() {
    const text = input.trim();

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
        await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            messages: nextMessages,
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
              data?.error ||
              "Something went wrong.",
            error: true,
          },
        ]);

        return;
      }

      const reply =
        data?.reply ||
        "I received your request, but no response was returned.";

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: reply,
        },
      ]);

      await speak(reply);
    } catch (error) {
      console.error(
        "Chat request failed:",
        error
      );

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            "I couldn't reach the server. Check your connection and try again.",
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleInputKeyDown(event) {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      sendMessage();
    }
  }

  /* -------------------------------------------------------
     Boot screen
  ------------------------------------------------------- */

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

  /* -------------------------------------------------------
     Main UI
  ------------------------------------------------------- */

  return (
    <main className="app">
      <div className="ambient-glow" />

      <header className="header">
        <div className="title-block">
          <div className="wordmark">
            J.A.R.V.I.S.
          </div>

          <div className="status-line">
            <span
              className={`status-dot ${
                loading
                  ? "processing-dot"
                  : ""
              }`}
            />

            {loading
              ? "PROCESSING"
              : listening
              ? "LISTENING"
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
          type="button"
        >
          VOICE{" "}
          {voiceOn ? "ON" : "OFF"}
        </button>
      </header>

      {/* ---------------------------------------------------
          THE NEW JARVIS REACTOR
      --------------------------------------------------- */}

      <div className="core-stage">
        <EnergyCore
          active={loading}
          listening={listening}
        />
      </div>

      {/* ---------------------------------------------------
          Chat
      --------------------------------------------------- */}

      <section
        className="log"
        ref={logRef}
        aria-live="polite"
      >
        {messages.map(
          (message, index) => (
            <div
              key={`${index}-${message.role}`}
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

      {/* ---------------------------------------------------
          Input
      --------------------------------------------------- */}

      <div className="input-bar">
        <button
          className={`icon-btn mic ${
            listening
              ? "listening"
              : ""
          }`}
          onClick={toggleMic}
          type="button"
          title="Voice input"
          aria-label="Voice input"
        >
          <span className="mic-symbol">
            🎙
          </span>
        </button>

        <input
          value={input}
          onChange={(event) =>
            setInput(event.target.value)
          }
          onKeyDown={
            handleInputKeyDown
          }
          placeholder="Speak, and I shall listen..."
          disabled={loading}
          autoComplete="off"
          spellCheck="false"
        />

        <button
          className="icon-btn send"
          onClick={sendMessage}
          disabled={
            loading ||
            !input.trim()
          }
          type="button"
          title="Send"
          aria-label="Send message"
        >
          ➤
        </button>
      </div>
    </main>
  );
}
