"use client";

import { useEffect, useRef, useState } from "react";

/* =========================================================
   BOOT SEQUENCE
========================================================= */

const BOOT_LINES = [
  { text: "INITIALIZING J.A.R.V.I.S. CORE...", dim: false },
  { text: "loading neural interface", dim: true },
  { text: "calibrating voice interface", dim: true },
  { text: "establishing secure connection", dim: true },
  { text: "ALL SYSTEMS NOMINAL", dim: false },
];

/* =========================================================
   JARVIS REACTOR
========================================================= */

function JarvisCore({ thinking }) {
  const canvasRef = useRef(null);
  const thinkingRef = useRef(thinking);

  useEffect(() => {
    thinkingRef.current = thinking;
  }, [thinking]);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    let animationFrame;
    let width = 0;
    let height = 0;
    let dpr = 1;

    let particles = [];
    let rays = [];
    let orbitParticles = [];

    let time = 0;

    /* -------------------------------------------------------
       Utility
    ------------------------------------------------------- */

    const random = (min, max) => {
      return Math.random() * (max - min) + min;
    };

    /* -------------------------------------------------------
       Resize canvas
    ------------------------------------------------------- */

    function resize() {
      const rect = canvas.getBoundingClientRect();

      dpr = Math.min(window.devicePixelRatio || 1, 2);

      width = rect.width;
      height = rect.height;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      createParticles();
      createRays();
      createOrbitParticles();
    }

    /* -------------------------------------------------------
       PARTICLES
    ------------------------------------------------------- */

    function createParticles() {
      particles = [];

      const count = window.innerWidth < 600 ? 330 : 500;

      for (let i = 0; i < count; i++) {
        const angle = random(0, Math.PI * 2);

        /*
          More particles around the core,
          fewer particles further away.
        */
        const radius =
          Math.pow(Math.random(), 0.55) *
          Math.min(width, height) *
          random(0.23, 0.43);

        particles.push({
          angle,
          radius,

          size: random(0.5, 2.1),

          alpha: random(0.25, 0.95),

          speed: random(-0.0008, 0.0008),

          wobble: random(0.5, 2.5),

          wobbleSpeed: random(0.001, 0.004),

          phase: random(0, Math.PI * 2),

          elongation: random(0.65, 1.3),
        });
      }
    }

    /* -------------------------------------------------------
       ENERGY RAYS
    ------------------------------------------------------- */

    function createRays() {
      rays = [];

      const count = window.innerWidth < 600 ? 55 : 80;

      for (let i = 0; i < count; i++) {
        rays.push({
          angle: random(0, Math.PI * 2),

          length: random(
            Math.min(width, height) * 0.15,
            Math.min(width, height) * 0.42
          ),

          width: random(0.4, 1.8),

          alpha: random(0.05, 0.35),

          speed: random(-0.002, 0.002),

          phase: random(0, Math.PI * 2),

          flicker: random(0.5, 2.5),
        });
      }
    }

    /* -------------------------------------------------------
       ORBIT PARTICLES
    ------------------------------------------------------- */

    function createOrbitParticles() {
      orbitParticles = [];

      const count = window.innerWidth < 600 ? 180 : 260;

      for (let i = 0; i < count; i++) {
        const orbit = Math.floor(random(0, 5));

        orbitParticles.push({
          orbit,

          angle: random(0, Math.PI * 2),

          speed: random(-0.012, 0.012),

          size: random(0.4, 1.7),

          alpha: random(0.25, 0.85),

          phase: random(0, Math.PI * 2),
        });
      }
    }

    /* -------------------------------------------------------
       GLOW
    ------------------------------------------------------- */

    function drawGlow(x, y, radius, intensity) {
      const gradient = ctx.createRadialGradient(
        x,
        y,
        0,
        x,
        y,
        radius
      );

      gradient.addColorStop(0, `rgba(255,255,240,${0.95 * intensity})`);

      gradient.addColorStop(
        0.08,
        `rgba(255,236,180,${0.9 * intensity})`
      );

      gradient.addColorStop(
        0.22,
        `rgba(255,166,50,${0.65 * intensity})`
      );

      gradient.addColorStop(
        0.48,
        `rgba(255,103,10,${0.22 * intensity})`
      );

      gradient.addColorStop(
        1,
        "rgba(255,70,0,0)"
      );

      ctx.fillStyle = gradient;

      ctx.beginPath();

      ctx.arc(x, y, radius, 0, Math.PI * 2);

      ctx.fill();
    }

    /* -------------------------------------------------------
       ORBIT RINGS
    ------------------------------------------------------- */

    function drawOrbit(
      cx,
      cy,
      rx,
      ry,
      rotation,
      alpha,
      dash,
      lineWidth
    ) {
      ctx.save();

      ctx.translate(cx, cy);

      ctx.rotate(rotation);

      ctx.beginPath();

      ctx.ellipse(
        0,
        0,
        rx,
        ry,
        0,
        0,
        Math.PI * 2
      );

      ctx.strokeStyle = `rgba(255,174,55,${alpha})`;

      ctx.lineWidth = lineWidth;

      if (dash) {
        ctx.setLineDash(dash);
      }

      ctx.stroke();

      ctx.restore();
    }

    /* -------------------------------------------------------
       ENERGY WEB
    ------------------------------------------------------- */

    function drawEnergyWeb(cx, cy, baseRadius, intensity) {
      const lines = thinkingRef.current ? 95 : 45;

      ctx.save();

      for (let i = 0; i < lines; i++) {
        const angle =
          (i / lines) * Math.PI * 2 +
          Math.sin(time * 0.0005 + i) * 0.04;

        const inner = baseRadius * random(0.12, 0.35);

        const outer =
          baseRadius *
          random(
            thinkingRef.current ? 0.85 : 0.62,
            thinkingRef.current ? 1.55 : 1.05
          );

        const x1 = cx + Math.cos(angle) * inner;

        const y1 = cy + Math.sin(angle) * inner;

        const x2 = cx + Math.cos(angle) * outer;

        const y2 = cy + Math.sin(angle) * outer;

        const alpha =
          random(0.025, thinkingRef.current ? 0.22 : 0.09) *
          intensity;

        ctx.beginPath();

        ctx.moveTo(x1, y1);

        /*
          Slightly bent energy lines
        */

        const bend =
          Math.sin(time * 0.002 + i * 1.7) *
          baseRadius *
          0.12;

        const midX =
          cx +
          Math.cos(angle + 0.4) * bend;

        const midY =
          cy +
          Math.sin(angle + 0.4) * bend;

        ctx.quadraticCurveTo(
          midX,
          midY,
          x2,
          y2
        );

        ctx.strokeStyle = `rgba(255,120,20,${alpha})`;

        ctx.lineWidth = random(0.3, 1.3);

        ctx.stroke();
      }

      ctx.restore();
    }

    /* -------------------------------------------------------
       PARTICLES
    ------------------------------------------------------- */

    function drawParticles(cx, cy, baseRadius) {
      ctx.save();

      for (const p of particles) {
        const speedMultiplier = thinkingRef.current ? 2.8 : 1;

        p.angle += p.speed * speedMultiplier;

        const wobble =
          Math.sin(
            time * p.wobbleSpeed +
              p.phase
          ) *
          p.wobble;

        const radius = p.radius + wobble;

        const x =
          cx +
          Math.cos(p.angle) *
            radius *
            p.elongation;

        const y =
          cy +
          Math.sin(p.angle) *
            radius;

        const pulse =
          0.65 +
          Math.sin(
            time * 0.003 +
              p.phase
          ) *
            0.35;

        const alpha =
          p.alpha *
          pulse *
          (thinkingRef.current ? 1.25 : 0.8);

        ctx.beginPath();

        ctx.arc(
          x,
          y,
          p.size *
            (thinkingRef.current ? 1.25 : 1),
          0,
          Math.PI * 2
        );

        ctx.fillStyle = `rgba(255,190,90,${Math.min(
          alpha,
          1
        )})`;

        ctx.fill();
      }

      ctx.restore();
    }

    /* -------------------------------------------------------
       ORBITING PARTICLES
    ------------------------------------------------------- */

    function drawOrbitParticles(cx, cy, baseRadius) {
      ctx.save();

      for (const p of orbitParticles) {
        const speedMultiplier =
          thinkingRef.current ? 3.2 : 1;

        p.angle +=
          p.speed *
          speedMultiplier;

        const orbitConfigs = [
          {
            rx: baseRadius * 0.38,
            ry: baseRadius * 0.16,
            rotation: -0.4,
          },
          {
            rx: baseRadius * 0.48,
            ry: baseRadius * 0.22,
            rotation: 0.9,
          },
          {
            rx: baseRadius * 0.55,
            ry: baseRadius * 0.13,
            rotation: -1.1,
          },
          {
            rx: baseRadius * 0.67,
            ry: baseRadius * 0.3,
            rotation: 0.25,
          },
          {
            rx: baseRadius * 0.78,
            ry: baseRadius * 0.17,
            rotation: 1.25,
          },
        ];

        const orbit = orbitConfigs[p.orbit];

        const cos = Math.cos(p.angle);

        const sin = Math.sin(p.angle);

        let x =
          cos * orbit.rx;

        let y =
          sin * orbit.ry;

        const rotatedX =
          x * Math.cos(orbit.rotation) -
          y * Math.sin(orbit.rotation);

        const rotatedY =
          x * Math.sin(orbit.rotation) +
          y * Math.cos(orbit.rotation);

        x = cx + rotatedX;

        y = cy + rotatedY;

        const pulse =
          0.5 +
          Math.sin(
            time * 0.004 +
              p.phase
          ) *
            0.5;

        ctx.beginPath();

        ctx.arc(
          x,
          y,
          p.size *
            (thinkingRef.current ? 1.4 : 1),
          0,
          Math.PI * 2
        );

        ctx.fillStyle = `rgba(255,205,120,${
          p.alpha * pulse
        })`;

        ctx.fill();
      }

      ctx.restore();
    }

    /* -------------------------------------------------------
       RANDOM HOT STREAKS
    ------------------------------------------------------- */

    function drawRays(cx, cy, baseRadius) {
      ctx.save();

      for (const r of rays) {
        r.angle +=
          r.speed *
          (thinkingRef.current ? 4 : 1);

        const flicker =
          0.5 +
          Math.sin(
            time * 0.004 * r.flicker
          ) *
            0.5;

        const start =
          baseRadius *
          random(0.12, 0.25);

        const multiplier =
          thinkingRef.current ? 1.45 : 0.9;

        const end =
          r.length *
          multiplier;

        const x1 =
          cx +
          Math.cos(r.angle) *
            start;

        const y1 =
          cy +
          Math.sin(r.angle) *
            start;

        const x2 =
          cx +
          Math.cos(r.angle) *
            end;

        const y2 =
          cy +
          Math.sin(r.angle) *
            end;

        ctx.beginPath();

        ctx.moveTo(x1, y1);

        ctx.lineTo(x2, y2);

        ctx.strokeStyle = `rgba(255,125,20,${
          r.alpha * flicker
        })`;

        ctx.lineWidth =
          r.width *
          (thinkingRef.current ? 1.5 : 0.8);

        ctx.stroke();
      }

      ctx.restore();
    }

    /* -------------------------------------------------------
       MAIN DRAW
    ------------------------------------------------------- */

    function draw() {
      time += 16;

      ctx.clearRect(
        0,
        0,
        width,
        height
      );

      const cx = width / 2;

      const cy = height / 2;

      const baseRadius =
        Math.min(width, height) *
        0.38;

      const thinkingMultiplier =
        thinkingRef.current ? 1.12 : 1;

      /* -----------------------------------------------
         Outer ambient glow
      ------------------------------------------------ */

      drawGlow(
        cx,
        cy,
        baseRadius * 1.65,
        thinkingRef.current ? 0.75 : 0.42
      );

      /* -----------------------------------------------
         Energy web
      ------------------------------------------------ */

      drawEnergyWeb(
        cx,
        cy,
        baseRadius,
        thinkingRef.current ? 1.5 : 1
      );

      /* -----------------------------------------------
         Long energy rays
      ------------------------------------------------ */

      drawRays(
        cx,
        cy,
        baseRadius
      );

      /* -----------------------------------------------
         Outer particles
      ------------------------------------------------ */

      drawParticles(
        cx,
        cy,
        baseRadius
      );

      /* -----------------------------------------------
         Orbit particles
      ------------------------------------------------ */

      drawOrbitParticles(
        cx,
        cy,
        baseRadius
      );

      /* -----------------------------------------------
         Orbit rings
      ------------------------------------------------ */

      const rotation1 =
        time *
        0.00035 *
        (thinkingRef.current ? 4 : 1);

      const rotation2 =
        -time *
        0.00023 *
        (thinkingRef.current ? 4 : 1);

      const rotation3 =
        time *
        0.00052 *
        (thinkingRef.current ? 3 : 1);

      drawOrbit(
        cx,
        cy,
        baseRadius * 0.95,
        baseRadius * 0.34,
        rotation1,
        0.45,
        null,
        1.2
      );

      drawOrbit(
        cx,
        cy,
        baseRadius * 0.72,
        baseRadius * 0.22,
        rotation2,
        0.55,
        [5, 9],
        1.1
      );

      drawOrbit(
        cx,
        cy,
        baseRadius * 0.58,
        baseRadius * 0.75,
        rotation3,
        0.38,
        null,
        1
      );

      drawOrbit(
        cx,
        cy,
        baseRadius * 0.48,
        baseRadius * 0.17,
        -rotation1 * 1.8,
        0.3,
        [2, 7],
        0.8
      );

      /* -----------------------------------------------
         Inner glow
      ------------------------------------------------ */

      const pulse =
        1 +
        Math.sin(time * 0.003) *
          0.08;

      drawGlow(
        cx,
        cy,
        baseRadius *
          0.42 *
          pulse *
          thinkingMultiplier,
        thinkingRef.current ? 1.25 : 0.9
      );

      /* -----------------------------------------------
         White hot center
      ------------------------------------------------ */

      const coreRadius =
        baseRadius *
        (thinkingRef.current
          ? 0.19
          : 0.15);

      const coreGradient =
        ctx.createRadialGradient(
          cx,
          cy,
          0,
          cx,
          cy,
          coreRadius
        );

      coreGradient.addColorStop(
        0,
        "rgba(255,255,255,1)"
      );

      coreGradient.addColorStop(
        0.22,
        "rgba(255,247,216,1)"
      );

      coreGradient.addColorStop(
        0.48,
        "rgba(255,186,80,0.95)"
      );

      coreGradient.addColorStop(
        0.72,
        "rgba(255,91,0,0.55)"
      );

      coreGradient.addColorStop(
        1,
        "rgba(255,70,0,0)"
      );

      ctx.fillStyle = coreGradient;

      ctx.beginPath();

      ctx.arc(
        cx,
        cy,
        coreRadius,
        0,
        Math.PI * 2
      );

      ctx.fill();

      /* -----------------------------------------------
         White center
      ------------------------------------------------ */

      ctx.beginPath();

      ctx.arc(
        cx,
        cy,
        coreRadius * 0.32,
        0,
        Math.PI * 2
      );

      ctx.fillStyle =
        "rgba(255,255,255,0.92)";

      ctx.shadowColor =
        "rgba(255,180,70,0.9)";

      ctx.shadowBlur =
        thinkingRef.current
          ? 35
          : 22;

      ctx.fill();

      ctx.shadowBlur = 0;

      animationFrame =
        requestAnimationFrame(draw);
    }

    resize();

    window.addEventListener(
      "resize",
      resize
    );

    animationFrame =
      requestAnimationFrame(draw);

    return () => {
      window.removeEventListener(
        "resize",
        resize
      );

      cancelAnimationFrame(
        animationFrame
      );
    };
  }, []);

  return (
    <div
      className={`jarvis-core ${
        thinking ? "thinking" : ""
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
   MAIN APP
========================================================= */

export default function Home() {
  const [booted, setBooted] =
    useState(false);

  const [
    visibleBootLines,
    setVisibleBootLines,
  ] = useState(0);

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

  /* -------------------------------------------------------
     BOOT
  ------------------------------------------------------- */

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
        }, 350);

      return () =>
        clearTimeout(timer);
    }

    const timer =
      setTimeout(() => {
        setBooted(true);
      }, 600);

    return () =>
      clearTimeout(timer);
  }, [visibleBootLines]);

  /* -------------------------------------------------------
     AUTO SCROLL
  ------------------------------------------------------- */

  useEffect(() => {
    const log =
      logRef.current;

    if (!log) return;

    log.scrollTo({
      top: log.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  /* -------------------------------------------------------
     SPEECH RECOGNITION
  ------------------------------------------------------- */

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

    recognition.interimResults =
      false;

    recognition.lang =
      "en-US";

    recognition.onresult = (
      event
    ) => {
      const transcript =
        event.results?.[0]?.[0]
          ?.transcript;

      if (transcript) {
        setInput(transcript);
      }
    };

    recognition.onerror = (
      event
    ) => {
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
      } else if (
        event.error !==
        "no-speech"
      ) {
        console.error(
          "Speech recognition error:",
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

  /* -------------------------------------------------------
     MICROPHONE
  ------------------------------------------------------- */

  function toggleMic() {
    const recognition =
      recognitionRef.current;

    if (!recognition) {
      alert(
        "Voice input is not supported by this browser. Please try Chrome or another browser with Speech Recognition support."
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
    } catch (error) {
      console.error(
        "Could not start microphone:",
        error
      );

      setListening(false);
    }
  }

  /* -------------------------------------------------------
     TEXT TO SPEECH
  ------------------------------------------------------- */

  async function speak(text) {
    if (!voiceOn || !text) {
      return;
    }

    try {
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
            `HTTP ${response.status}`
        );

        return;
      }

      const blob =
        await response.blob();

      const audioUrl =
        URL.createObjectURL(
          blob
        );

      const audio =
        new Audio(audioUrl);

      audio.onended = () => {
        URL.revokeObjectURL(
          audioUrl
        );
      };

      audio.onerror = () => {
        URL.revokeObjectURL(
          audioUrl
        );
      };

      await audio.play();
    } catch (error) {
      console.error(
        "Voice playback failed:",
        error
      );
    }
  }

  /* -------------------------------------------------------
     SEND MESSAGE
  ------------------------------------------------------- */

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

    setMessages(
      nextMessages
    );

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
        data?.reply;

      if (
        typeof reply !==
          "string" ||
        !reply.trim()
      ) {
        setMessages(
          (current) => [
            ...current,
            {
              role: "assistant",
              content:
                "I received an empty response from the server.",
              error: true,
            },
          ]
        );

        return;
      }

      setMessages(
        (current) => [
          ...current,
          {
            role: "assistant",
            content: reply,
          },
        ]
      );

      speak(reply);
    } catch (error) {
      console.error(
        "Chat request failed:",
        error
      );

      setMessages(
        (current) => [
          ...current,
          {
            role: "assistant",
            content:
              "I couldn't reach the server. Please check your connection and try again.",
            error: true,
          },
        ]
      );
    } finally {
      setLoading(false);
    }
  }

  /* -------------------------------------------------------
     ENTER KEY
  ------------------------------------------------------- */

  function handleKeyDown(event) {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      sendMessage();
    }
  }

  /* -------------------------------------------------------
     BOOT SCREEN
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

  /* -------------------------------------------------------
     APPLICATION
  ------------------------------------------------------- */

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

      {/* REACTOR */}

      <div className="core-stage">
        <JarvisCore
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
              key={`${message.role}-${index}`}
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

      <div className="input-area">
        <div className="input-bar">
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
            <span className="mic-icon">
              🎙
            </span>
          </button>

          <input
            value={input}
            onChange={(event) =>
              setInput(
                event.target.value
              )
            }
            onKeyDown={
              handleKeyDown
            }
            placeholder="Speak, and I shall listen..."
            disabled={loading}
            autoComplete="off"
            spellCheck="true"
          />

          <button
            type="button"
            className="icon-btn send"
            onClick={
              sendMessage
            }
            disabled={
              loading ||
              !input.trim()
            }
            title="Send"
            aria-label="Send message"
          >
            ➤
          </button>
        </div>
      </div>
    </main>
  );
}
