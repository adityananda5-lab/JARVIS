"use client";

import { useEffect, useRef, useState } from "react";

/* =========================================================
   BOOT
========================================================= */

const BOOT_LINES = [
  { text: "INITIALIZING J.A.R.V.I.S. CORE...", dim: false },
  { text: "loading neural interface", dim: true },
  { text: "calibrating voice interface", dim: true },
  { text: "establishing secure connection", dim: true },
  { text: "ALL SYSTEMS NOMINAL", dim: false },
];

/* =========================================================
   SEEDED RANDOM
   Keeps the plasma structure stable instead of rebuilding it
   randomly every render.
========================================================= */

function seededRandom(seed) {
  let value = seed >>> 0;

  return function random() {
    value += 0x6d2b79f5;
    let t = value;

    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* =========================================================
   PLASMA CORE
========================================================= */

function PlasmaCore({ thinking }) {
  const canvasRef = useRef(null);
  const frameRef = useRef(null);
  const resizeRef = useRef(null);
  const geometryRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d", {
      alpha: true,
      desynchronized: true,
    });

    if (!ctx) return;

    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    let width = 0;
    let height = 0;
    let centerX = 0;
    let centerY = 0;
    let radius = 0;

    /*
      Build the actual plasma structure once.

      IMPORTANT:
      This is intentionally NOT a collection of circles/rings.
      The filaments are irregular random-walk paths.
    */

    function buildGeometry() {
      const random = seededRandom(817263);

      const filaments = [];
      const innerFilaments = [];
      const particles = [];
      const sparks = [];

      /*
        Main outer plasma filaments.

        Each filament starts somewhere inside the plasma,
        wanders through multiple irregular points and then
        dies away. This produces the tangled electrical look.
      */

      const filamentCount = 145;

      for (let i = 0; i < filamentCount; i++) {
        const points = [];

        const angle =
          random() * Math.PI * 2 +
          Math.sin(i * 2.37) * 0.35;

        const startRadius =
          0.16 +
          random() * 0.20;

        let x = Math.cos(angle) * startRadius;
        let y = Math.sin(angle) * startRadius;

        let direction = angle;

        const length =
          0.52 +
          random() * 0.48;

        const steps = 24 + Math.floor(random() * 30);

        for (let j = 0; j < steps; j++) {
          const progress = j / (steps - 1);

          /*
            Instead of travelling straight outward,
            constantly rotate the direction.

            This is what prevents the "sun ray" appearance.
          */

          direction +=
            (random() - 0.5) *
            (0.9 - progress * 0.25);

          direction +=
            Math.sin(progress * 8 + i) *
            0.025;

          const step =
            (0.009 + random() * 0.018) *
            (1 + progress * 0.8);

          x += Math.cos(direction) * step;
          y += Math.sin(direction) * step;

          /*
            Pull some filaments back toward the plasma body.
            This creates tangled loops rather than pure rays.
          */

          if (random() < 0.075) {
            x *= 0.96;
            y *= 0.96;
          }

          const distance = Math.sqrt(x * x + y * y);

          /*
            Keep the majority of the structure inside a roughly
            spherical cloud.
          */

          if (distance > length) {
            x *= 0.985;
            y *= 0.985;
          }

          points.push({
            x,
            y,
            z:
              -1 +
              Math.sin(progress * Math.PI) * 1.8 +
              (random() - 0.5) * 0.9,
            alpha:
              0.18 +
              random() * 0.65,
          });
        }

        filaments.push({
          points,
          phase: random() * Math.PI * 2,
          speed:
            0.35 +
            random() * 1.1,
          thickness:
            0.35 +
            random() * 0.85,
          brightness:
            0.35 +
            random() * 0.65,
        });
      }

      /*
        Smaller internal filaments.

        These create the extremely dense center seen in the
        reference image.
      */

      for (let i = 0; i < 110; i++) {
        const points = [];

        let x = (random() - 0.5) * 0.42;
        let y = (random() - 0.5) * 0.42;

        let direction =
          random() * Math.PI * 2;

        const steps = 12 + Math.floor(random() * 20);

        for (let j = 0; j < steps; j++) {
          const progress = j / steps;

          direction +=
            (random() - 0.5) * 1.2;

          x +=
            Math.cos(direction) *
            (0.008 + random() * 0.018);

          y +=
            Math.sin(direction) *
            (0.008 + random() * 0.018);

          points.push({
            x,
            y,
            z:
              (random() - 0.5) *
              1.4,
            alpha:
              0.2 +
              random() * 0.8,
          });
        }

        innerFilaments.push({
          points,
          phase: random() * Math.PI * 2,
          speed: 0.5 + random(),
          thickness: 0.25 + random() * 0.55,
          brightness: 0.35 + random() * 0.65,
        });
      }

      /*
        Floating plasma particles.
      */

      for (let i = 0; i < 650; i++) {
        const theta =
          random() * Math.PI * 2;

        const distance =
          Math.pow(random(), 0.55) *
          1.15;

        const x =
          Math.cos(theta) *
          distance;

        const y =
          Math.sin(theta) *
          distance *
          (0.88 + random() * 0.18);

        particles.push({
          x,
          y,
          z:
            (random() - 0.5) *
            2,
          size:
            0.25 +
            random() * 1.45,
          alpha:
            0.12 +
            random() * 0.7,
          phase:
            random() * Math.PI * 2,
          speed:
            0.4 +
            random() * 1.5,
        });
      }

      /*
        Short bright electrical sparks.
      */

      for (let i = 0; i < 120; i++) {
        sparks.push({
          angle:
            random() *
            Math.PI *
            2,

          distance:
            0.35 +
            random() * 0.85,

          length:
            0.015 +
            random() * 0.08,

          width:
            0.3 +
            random() * 0.8,

          alpha:
            0.25 +
            random() * 0.65,

          phase:
            random() * Math.PI * 2,
        });
      }

      geometryRef.current = {
        filaments,
        innerFilaments,
        particles,
        sparks,
      };
    }

    buildGeometry();

    function resize() {
      width = canvas.clientWidth;
      height = canvas.clientHeight;

      canvas.width = Math.floor(width * DPR);
      canvas.height = Math.floor(height * DPR);

      ctx.setTransform(
        DPR,
        0,
        0,
        DPR,
        0,
        0
      );

      centerX = width / 2;
      centerY = height / 2;

      /*
        Keep the plasma large enough to resemble the reference,
        but responsive on mobile.
      */

      radius =
        Math.min(width, height) *
        (width < 600 ? 0.31 : 0.30);
    }

    resize();

    window.addEventListener(
      "resize",
      resize
    );

    resizeRef.current = resize;

    let startTime = performance.now();

    function draw(now) {
      const elapsed =
        (now - startTime) / 1000;

      ctx.clearRect(
        0,
        0,
        width,
        height
      );

      const geometry =
        geometryRef.current;

      if (!geometry) return;

      /*
        Thinking mode increases energy instead of simply
        scaling the entire object like the old implementation.
      */

      const energy =
        thinking
          ? 1.65
          : 1;

      /*
        ---------------------------------------------------------
        DEEP AMBIENT GLOW
        ---------------------------------------------------------
      */

      const glowRadius =
        radius *
        (thinking ? 1.75 : 1.45);

      const ambient =
        ctx.createRadialGradient(
          centerX,
          centerY,
          0,
          centerX,
          centerY,
          glowRadius
        );

      ambient.addColorStop(
        0,
        thinking
          ? "rgba(255,130,25,0.25)"
          : "rgba(255,105,20,0.18)"
      );

      ambient.addColorStop(
        0.28,
        "rgba(255,90,15,0.11)"
      );

      ambient.addColorStop(
        0.62,
        "rgba(255,55,10,0.035)"
      );

      ambient.addColorStop(
        1,
        "rgba(0,0,0,0)"
      );

      ctx.fillStyle = ambient;

      ctx.beginPath();

      ctx.arc(
        centerX,
        centerY,
        glowRadius,
        0,
        Math.PI * 2
      );

      ctx.fill();

      /*
        ---------------------------------------------------------
        PLASMA PARTICLES
        ---------------------------------------------------------
      */

      for (const p of geometry.particles) {
        const twinkle =
          0.55 +
          Math.sin(
            elapsed * p.speed +
              p.phase
          ) *
            0.45;

        /*
          Slight orbital drift, but deliberately subtle.
          No orbital rings.
        */

        const drift =
          elapsed *
          0.035 *
          (p.z > 0 ? 1 : -1);

        const cos =
          Math.cos(drift);

        const sin =
          Math.sin(drift);

        const px =
          p.x * cos -
          p.y * sin;

        const py =
          p.x * sin +
          p.y * cos;

        const perspective =
          0.82 +
          (p.z + 1) * 0.09;

        const sx =
          centerX +
          px *
            radius *
            perspective;

        const sy =
          centerY +
          py *
            radius *
            perspective;

        const size =
          p.size *
          (thinking ? 1.25 : 1);

        ctx.globalAlpha =
          p.alpha *
          twinkle *
          energy;

        ctx.fillStyle =
          "rgba(255,178,75,1)";

        ctx.beginPath();

        ctx.arc(
          sx,
          sy,
          size,
          0,
          Math.PI * 2
        );

        ctx.fill();
      }

      /*
        ---------------------------------------------------------
        MAIN ELECTRICAL FILAMENTS
        ---------------------------------------------------------
      */

      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      for (const filament of geometry.filaments) {
        const pulse =
          0.65 +
          Math.sin(
            elapsed *
              filament.speed +
              filament.phase
          ) *
            0.35;

        /*
          Draw the filament twice:
          1. blurred orange energy
          2. sharp hot filament
        */

        ctx.beginPath();

        filament.points.forEach(
          (point, index) => {
            const t =
              index /
              (filament.points.length - 1);

            /*
              Very small movement makes the structure feel alive
              without destroying the tangled form.
            */

            const movement =
              Math.sin(
                elapsed *
                  filament.speed *
                  0.7 +
                  filament.phase +
                  t * 7
              ) *
              0.006 *
              energy;

            const px =
              point.x +
              Math.cos(
                filament.phase + t * 5
              ) *
                movement;

            const py =
              point.y +
              Math.sin(
                filament.phase + t * 5
              ) *
                movement;

            /*
              Simulated depth.
            */

            const perspective =
              0.78 +
              (point.z + 1.8) *
                0.075;

            const sx =
              centerX +
              px *
                radius *
                perspective;

            const sy =
              centerY +
              py *
                radius *
                perspective;

            if (index === 0) {
              ctx.moveTo(sx, sy);
            } else {
              ctx.lineTo(sx, sy);
            }
          }
        );

        ctx.strokeStyle =
          `rgba(255,93,18,${0.12 * pulse * energy})`;

        ctx.lineWidth =
          filament.thickness *
          3.5;

        ctx.shadowColor =
          "rgba(255,82,15,0.9)";

        ctx.shadowBlur =
          thinking ? 13 : 9;

        ctx.stroke();

        /*
          Sharp filament.
        */

        ctx.beginPath();

        filament.points.forEach(
          (point, index) => {
            const t =
              index /
              (filament.points.length - 1);

            const movement =
              Math.sin(
                elapsed *
                  filament.speed *
                  0.7 +
                  filament.phase +
                  t * 7
              ) *
              0.006 *
              energy;

            const px =
              point.x +
              Math.cos(
                filament.phase + t * 5
              ) *
                movement;

            const py =
              point.y +
              Math.sin(
                filament.phase + t * 5
              ) *
                movement;

            const perspective =
              0.78 +
              (point.z + 1.8) *
                0.075;

            const sx =
              centerX +
              px *
                radius *
                perspective;

            const sy =
              centerY +
              py *
                radius *
                perspective;

            if (index === 0) {
              ctx.moveTo(sx, sy);
            } else {
              ctx.lineTo(sx, sy);
            }
          }
        );

        const brightness =
          filament.brightness *
          pulse *
          energy;

        ctx.strokeStyle =
          `rgba(255,${145 + Math.floor(brightness * 80)},${55 + Math.floor(brightness * 90)},${0.42 + brightness * 0.4})`;

        ctx.lineWidth =
          filament.thickness *
          (thinking ? 1.25 : 1);

        ctx.shadowBlur = 0;

        ctx.stroke();
      }

      /*
        ---------------------------------------------------------
        DENSE INTERNAL NETWORK
        ---------------------------------------------------------
      */

      for (const filament of geometry.innerFilaments) {
        const pulse =
          0.55 +
          Math.sin(
            elapsed *
              filament.speed +
              filament.phase
          ) *
            0.45;

        ctx.beginPath();

        filament.points.forEach(
          (point, index) => {
            const t =
              index /
              Math.max(
                1,
                filament.points.length - 1
              );

            const wobble =
              Math.sin(
                elapsed *
                  filament.speed +
                  t * 12 +
                  filament.phase
              ) *
              0.009;

            const px =
              point.x +
              Math.cos(
                filament.phase + t * 10
              ) *
                wobble;

            const py =
              point.y +
              Math.sin(
                filament.phase + t * 10
              ) *
                wobble;

            const perspective =
              0.9 +
              (point.z + 1) *
                0.07;

            const sx =
              centerX +
              px *
                radius *
                perspective;

            const sy =
              centerY +
              py *
                radius *
                perspective;

            if (index === 0) {
              ctx.moveTo(sx, sy);
            } else {
              ctx.lineTo(sx, sy);
            }
          }
        );

        ctx.strokeStyle =
          `rgba(255,120,35,${0.3 * pulse * energy})`;

        ctx.lineWidth =
          filament.thickness *
          (thinking ? 1.35 : 1);

        ctx.shadowColor =
          "rgba(255,90,15,0.9)";

        ctx.shadowBlur =
          thinking ? 8 : 5;

        ctx.stroke();
      }

      /*
        ---------------------------------------------------------
        SHORT ELECTRICAL SPARKS
        ---------------------------------------------------------
      */

      for (const spark of geometry.sparks) {
        const pulse =
          0.4 +
          Math.sin(
            elapsed * 3 +
              spark.phase
          ) *
            0.6;

        if (pulse < 0.22) continue;

        const a =
          spark.angle +
          Math.sin(
            elapsed * 0.2 +
              spark.phase
          ) *
            0.15;

        const start =
          spark.distance;

        const end =
          start +
          spark.length *
            (thinking ? 1.7 : 1);

        const x1 =
          centerX +
          Math.cos(a) *
            radius *
            start;

        const y1 =
          centerY +
          Math.sin(a) *
            radius *
            start;

        const x2 =
          centerX +
          Math.cos(a) *
            radius *
            end;

        const y2 =
          centerY +
          Math.sin(a) *
            radius *
            end;

        ctx.beginPath();

        ctx.moveTo(x1, y1);

        /*
          Small angular deviation makes sparks imperfect.
        */

        const mx =
          (x1 + x2) / 2 +
          Math.sin(
            spark.phase
          ) *
            7;

        const my =
          (y1 + y2) / 2 +
          Math.cos(
            spark.phase
          ) *
            7;

        ctx.quadraticCurveTo(
          mx,
          my,
          x2,
          y2
        );

        ctx.strokeStyle =
          `rgba(255,205,125,${spark.alpha * pulse * energy})`;

        ctx.lineWidth =
          spark.width *
          (thinking ? 1.4 : 1);

        ctx.shadowColor =
          "rgba(255,130,35,1)";

        ctx.shadowBlur = 7;

        ctx.stroke();
      }

      /*
        ---------------------------------------------------------
        CENTRAL ENERGY CORE
        ---------------------------------------------------------
      */

      const corePulse =
        1 +
        Math.sin(
          elapsed *
            (thinking ? 5.5 : 2.2)
        ) *
          (thinking ? 0.11 : 0.055);

      /*
        Outer orange bloom.
      */

      const outerCore =
        ctx.createRadialGradient(
          centerX,
          centerY,
          0,
          centerX,
          centerY,
          radius * 0.24 * corePulse
        );

      outerCore.addColorStop(
        0,
        "rgba(255,255,235,1)"
      );

      outerCore.addColorStop(
        0.08,
        "rgba(255,249,205,1)"
      );

      outerCore.addColorStop(
        0.20,
        "rgba(255,224,125,0.98)"
      );

      outerCore.addColorStop(
        0.40,
        "rgba(255,145,32,0.85)"
      );

      outerCore.addColorStop(
        0.68,
        "rgba(255,76,10,0.25)"
      );

      outerCore.addColorStop(
        1,
        "rgba(255,30,0,0)"
      );

      ctx.globalAlpha = 1;

      ctx.fillStyle = outerCore;

      ctx.beginPath();

      ctx.arc(
        centerX,
        centerY,
        radius *
          0.24 *
          corePulse,
        0,
        Math.PI * 2
      );

      ctx.fill();

      /*
        White-hot center.
      */

      const whiteCore =
        ctx.createRadialGradient(
          centerX,
          centerY,
          0,
          centerX,
          centerY,
          radius * 0.085
        );

      whiteCore.addColorStop(
        0,
        "rgba(255,255,255,1)"
      );

      whiteCore.addColorStop(
        0.45,
        "rgba(255,250,225,1)"
      );

      whiteCore.addColorStop(
        0.78,
        "rgba(255,224,150,0.95)"
      );

      whiteCore.addColorStop(
        1,
        "rgba(255,145,30,0)"
      );

      ctx.shadowColor =
        "rgba(255,120,20,1)";

      ctx.shadowBlur =
        thinking ? 35 : 24;

      ctx.fillStyle = whiteCore;

      ctx.beginPath();

      ctx.arc(
        centerX,
        centerY,
        radius *
          0.085 *
          corePulse,
        0,
        Math.PI * 2
      );

      ctx.fill();

      ctx.shadowBlur = 0;

      /*
        Tiny white-hot center.
      */

      ctx.fillStyle =
        "rgba(255,255,255,0.98)";

      ctx.beginPath();

      ctx.arc(
        centerX,
        centerY,
        radius *
          0.035 *
          corePulse,
        0,
        Math.PI * 2
      );

      ctx.fill();

      ctx.globalAlpha = 1;

      frameRef.current =
        requestAnimationFrame(draw);
    }

    frameRef.current =
      requestAnimationFrame(draw);

    return () => {
      window.removeEventListener(
        "resize",
        resize
      );

      if (frameRef.current) {
        cancelAnimationFrame(
          frameRef.current
        );
      }
    };
  }, [thinking]);

  return (
    <div
      className={`plasma-stage${
        thinking ? " plasma-thinking" : ""
      }`}
    >
      <canvas
        ref={canvasRef}
        className="plasma-canvas"
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

  /* =========================================================
     BOOT SEQUENCE
  ========================================================= */

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
        }, 350);

      return () =>
        clearTimeout(timer);
    }

    const timer =
      setTimeout(() => {
        setBooted(true);
      }, 450);

    return () =>
      clearTimeout(timer);
  }, [visibleBootLines]);

  /* =========================================================
     CHAT AUTO SCROLL
  ========================================================= */

  useEffect(() => {
    const log =
      logRef.current;

    if (!log) return;

    log.scrollTo({
      top: log.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  /* =========================================================
     SPEECH RECOGNITION
  ========================================================= */

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

  /* =========================================================
     MICROPHONE
  ========================================================= */

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

  /* =========================================================
     TEXT TO SPEECH
  ========================================================= */

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

        console.error(
          "Voice playback failed:",
          data?.error ||
            `HTTP ${response.status}`
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
      console.error(
        "Voice playback failed:",
        error
      );
    }
  }

  /* =========================================================
     SEND CHAT MESSAGE
  ========================================================= */

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
        "I received your request, but no response was returned.";

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: reply,
        },
      ]);

      speak(reply);
    } catch (error) {
      console.error(error);

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            "I couldn't reach the server. Please check your connection and try again.",
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     ENTER KEY
  ========================================================= */

  function handleKeyDown(event) {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      sendMessage();
    }
  }

  /* =========================================================
     BOOT SCREEN
  ========================================================= */

  if (!booted) {
    return (
      <div className="boot-screen">
        {BOOT_LINES.slice(
          0,
          visibleBootLines
        ).map((line, index) => (
          <div
            key={index}
            className={`boot-line${
              line.dim
                ? " dim"
                : ""
            }`}
          >
            {line.text}
          </div>
        ))}
      </div>
    );
  }

  /* =========================================================
     APPLICATION
  ========================================================= */

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
              : listening
              ? "LISTENING"
              : "ONLINE"}
          </div>
        </div>

        <button
          type="button"
          className={`voice-toggle${
            voiceOn
              ? " active"
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

      {/* =====================================================
          THE ACTUAL JARVIS CORE
          No SVG rings.
          No solar-system orbit.
          No radial sun rays.
      ===================================================== */}

      <div className="core-stage">
        <PlasmaCore
          thinking={loading}
        />
      </div>

      {/* =====================================================
          CHAT LOG
      ===================================================== */}

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
                className={`bubble${
                  message.error
                    ? " error"
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

      {/* =====================================================
          INPUT
      ===================================================== */}

      <footer className="input-bar">
        <button
          type="button"
          className={`icon-btn mic${
            listening
              ? " listening"
              : ""
          }`}
          onClick={toggleMic}
          title="Voice input"
          aria-label="Voice input"
        >
          <span className="mic-symbol">
            🎙
          </span>
        </button>

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
          placeholder="Speak, and I shall listen..."
          disabled={loading}
          autoComplete="off"
          spellCheck="false"
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
          aria-label="Send message"
        >
          ➤
        </button>
      </footer>
    </main>
  );
}
