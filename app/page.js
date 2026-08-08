"use client";

import { useEffect, useRef, useState } from "react";

const BOOT_LINES = [
  { text: "INITIALIZING J.A.R.V.I.S. CORE...", dim: false },
  { text: "loading language subsystem", dim: true },
  { text: "calibrating voice interface", dim: true },
  { text: "ALL SYSTEMS NOMINAL", dim: false },
];

function EnergyCore({ thinking }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const stateRef = useRef({
    width: 0,
    height: 0,
    dpr: 1,
    particles: [],
    sparks: [],
    time: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const state = stateRef.current;

    function random(min, max) {
      return Math.random() * (max - min) + min;
    }

    function createParticle() {
      const angle = Math.random() * Math.PI * 2;

      /*
       * Instead of distributing particles on a circle,
       * distribute them through a spherical-ish volume.
       */
      const radiusBias = Math.pow(Math.random(), 0.55);
      const radius = radiusBias;

      return {
        angle,
        radius,
        depth: random(-1, 1),

        speed: random(0.0007, 0.0025),
        rotationSpeed: random(-0.004, 0.004),

        size: random(0.6, 2.2),

        phase: random(0, Math.PI * 2),
        pulse: random(0.5, 1.8),

        alpha: random(0.18, 0.85),

        length: random(4, 18),

        // Irregular angular movement.
        wobble: random(0.002, 0.008),
        wobbleOffset: random(0, 1000),
      };
    }

    function createSpark() {
      return {
        angle: random(0, Math.PI * 2),
        radius: random(0.22, 1.05),
        speed: random(0.002, 0.008),
        size: random(0.5, 1.8),
        alpha: random(0.25, 0.9),
        phase: random(0, Math.PI * 2),
      };
    }

    function rebuild() {
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

      /*
       * Dense electric field.
       */
      const particleCount =
        window.innerWidth < 600 ? 330 : 560;

      state.particles = Array.from(
        { length: particleCount },
        createParticle
      );

      const sparkCount =
        window.innerWidth < 600 ? 80 : 150;

      state.sparks = Array.from(
        { length: sparkCount },
        createSpark
      );
    }

    function drawGlow(cx, cy, coreRadius, intensity) {
      const gradient = ctx.createRadialGradient(
        cx,
        cy,
        0,
        cx,
        cy,
        coreRadius * 3.5
      );

      gradient.addColorStop(
        0,
        `rgba(255,255,245,${0.95 * intensity})`
      );

      gradient.addColorStop(
        0.08,
        `rgba(255,238,190,${0.95 * intensity})`
      );

      gradient.addColorStop(
        0.22,
        `rgba(255,166,54,${0.72 * intensity})`
      );

      gradient.addColorStop(
        0.5,
        `rgba(255,102,12,${0.28 * intensity})`
      );

      gradient.addColorStop(
        1,
        "rgba(255,60,0,0)"
      );

      ctx.beginPath();
      ctx.fillStyle = gradient;
      ctx.arc(
        cx,
        cy,
        coreRadius * 3.5,
        0,
        Math.PI * 2
      );
      ctx.fill();

      /*
       * White-hot center.
       */
      const centerGradient = ctx.createRadialGradient(
        cx,
        cy,
        0,
        cx,
        cy,
        coreRadius
      );

      centerGradient.addColorStop(
        0,
        `rgba(255,255,255,${intensity})`
      );

      centerGradient.addColorStop(
        0.35,
        `rgba(255,244,207,${0.98 * intensity})`
      );

      centerGradient.addColorStop(
        0.7,
        `rgba(255,153,35,${0.9 * intensity})`
      );

      centerGradient.addColorStop(
        1,
        "rgba(255,86,0,0)"
      );

      ctx.beginPath();
      ctx.fillStyle = centerGradient;
      ctx.arc(
        cx,
        cy,
        coreRadius,
        0,
        Math.PI * 2
      );
      ctx.fill();

      /*
       * Small white nucleus.
       */
      ctx.beginPath();
      ctx.fillStyle = `rgba(255,255,255,${intensity})`;
      ctx.shadowColor = "rgba(255,180,70,0.95)";
      ctx.shadowBlur = 25 * intensity;
      ctx.arc(
        cx,
        cy,
        coreRadius * 0.27,
        0,
        Math.PI * 2
      );
      ctx.fill();

      ctx.shadowBlur = 0;
    }

    function drawEnergyLine(
      cx,
      cy,
      particle,
      now,
      scale,
      intensity
    ) {
      const angle =
        particle.angle +
        now * particle.rotationSpeed;

      const wobble =
        Math.sin(
          now * particle.wobble +
            particle.wobbleOffset
        ) * 0.18;

      const r =
        particle.radius *
        scale *
        (1 + wobble);

      /*
       * Slight perspective distortion.
       * This helps create a volumetric cloud rather than
       * a flat circular solar system.
       */
      const depth =
        0.72 +
        (particle.depth + 1) * 0.14;

      const x =
        cx +
        Math.cos(angle) * r * depth;

      const y =
        cy +
        Math.sin(angle) * r;

      /*
       * Angular fragmented line.
       */
      const segments =
        thinking ? 5 : 3;

      let px = x;
      let py = y;

      const localLength =
        particle.length *
        (thinking ? 1.7 : 1);

      ctx.beginPath();
      ctx.moveTo(px, py);

      for (let i = 0; i < segments; i++) {
        const direction =
          angle +
          random(
            -1.1,
            1.1
          );

        const segment =
          localLength /
          segments;

        px +=
          Math.cos(direction) *
          segment;

        py +=
          Math.sin(direction) *
          segment;

        ctx.lineTo(px, py);
      }

      const pulse =
        0.55 +
        Math.sin(
          now * particle.pulse +
            particle.phase
        ) *
          0.45;

      const alpha =
        particle.alpha *
        pulse *
        intensity;

      ctx.strokeStyle =
        `rgba(255,${random(
          115,
          205
        )},${random(
          30,
          105
        )},${alpha})`;

      ctx.lineWidth =
        particle.size *
        (thinking ? 1.15 : 0.8);

      ctx.stroke();

      /*
       * Small glowing point at the beginning
       * of some fragments.
       */
      if (
        Math.random() <
        (thinking ? 0.16 : 0.06)
      ) {
        ctx.beginPath();

        ctx.fillStyle =
          `rgba(255,210,130,${alpha})`;

        ctx.arc(
          x,
          y,
          particle.size * 1.5,
          0,
          Math.PI * 2
        );

        ctx.fill();
      }
    }

    function drawSparks(
      cx,
      cy,
      scale,
      now,
      intensity
    ) {
      state.sparks.forEach((spark) => {
        spark.angle += spark.speed;

        const r =
          spark.radius *
          scale;

        const x =
          cx +
          Math.cos(spark.angle) *
            r;

        const y =
          cy +
          Math.sin(spark.angle) *
            r;

        const pulse =
          0.4 +
          Math.sin(
            now * 0.004 +
              spark.phase
          ) *
            0.6;

        ctx.beginPath();

        ctx.fillStyle =
          `rgba(255,190,105,${
            spark.alpha *
            pulse *
            intensity
          })`;

        ctx.arc(
          x,
          y,
          spark.size,
          0,
          Math.PI * 2
        );

        ctx.fill();
      });
    }

    function draw(now) {
      const width = state.width;
      const height = state.height;

      ctx.clearRect(
        0,
        0,
        width,
        height
      );

      const cx = width / 2;
      const cy = height / 2;

      /*
       * Core size.
       *
       * Deliberately NOT huge.
       * We want the same compact energetic mass
       * seen in your reference rather than a sun.
       */
      const baseScale =
        Math.min(width, height) *
        (window.innerWidth < 600
          ? 0.23
          : 0.28);

      const energy =
        thinking ? 1.45 : 1;

      /*
       * Very subtle ambient glow behind the field.
       */
      const ambient =
        ctx.createRadialGradient(
          cx,
          cy,
          0,
          cx,
          cy,
          baseScale * 1.5
        );

      ambient.addColorStop(
        0,
        `rgba(255,91,0,${
          0.07 * energy
        })`
      );

      ambient.addColorStop(
        0.5,
        `rgba(255,70,0,${
          0.025 * energy
        })`
      );

      ambient.addColorStop(
        1,
        "rgba(255,40,0,0)"
      );

      ctx.fillStyle = ambient;

      ctx.fillRect(
        cx - baseScale * 1.5,
        cy - baseScale * 1.5,
        baseScale * 3,
        baseScale * 3
      );

      /*
       * Electric fragments.
       */
      state.particles.forEach((particle) => {
        drawEnergyLine(
          cx,
          cy,
          particle,
          now,
          baseScale,
          energy
        );
      });

      drawSparks(
        cx,
        cy,
        baseScale,
        now,
        energy
      );

      /*
       * Bright core drawn LAST so it stays visible
       * above the chaotic electrical field.
       */
      drawGlow(
        cx,
        cy,
        baseScale *
          (thinking ? 0.095 : 0.075),
        energy
      );

      animationRef.current =
        requestAnimationFrame(draw);
    }

    rebuild();

    const resizeObserver =
      new ResizeObserver(rebuild);

    resizeObserver.observe(canvas);

    animationRef.current =
      requestAnimationFrame(draw);

    return () => {
      resizeObserver.disconnect();

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
        thinking ? "energy-thinking" : ""
      }`}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}

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

  /*
   * Boot sequence.
   */
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

  /*
   * Auto-scroll chat.
   */
  useEffect(() => {
    const log = logRef.current;

    if (!log) return;

    log.scrollTo({
      top: log.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  /*
   * Speech recognition.
   */
  useEffect(() => {
    const SpeechRecognition =
      typeof window !== "undefined" &&
      (
        window.SpeechRecognition ||
        window.webkitSpeechRecognition
      );

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
        event.results[0][0].transcript;

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
          "Microphone access was blocked. Please allow microphone access for this website."
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

  async function speak(text) {
    if (!voiceOn) {
      return;
    }

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
            (
              data?.error ||
              `HTTP ${response.status}`
            )
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
            voiceOn
              ? "active"
              : ""
          }`}
          onClick={() =>
            setVoiceOn(
              (value) => !value
            )
          }
        >
          VOICE{" "}
          {voiceOn
            ? "ON"
            : "OFF"}
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

      <footer className="input-bar">
        <button
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
          aria-label="Send"
        >
          ➤
        </button>
      </footer>
    </main>
  );
}
