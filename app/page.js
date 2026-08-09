"use client";

import { useEffect, useRef, useState } from "react";

/*
  J.A.R.V.I.S. ENERGY CORE

  IMPORTANT:
  This intentionally does NOT use Three.js.

  The reference visual is not a planet, solar system,
  particle sphere, or orbit visualization.

  It is a chaotic electromagnetic/plasma field made
  from branching irregular filaments surrounding a
  small white-hot energy core.
*/

function EnergyCore({ thinking }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", {
      alpha: true,
    });

    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let animationFrame = 0;

    const TWO_PI = Math.PI * 2;

    let filaments = [];
    let sparks = [];

    /*
      A deterministic random generator gives us a stable
      structure instead of rebuilding the entire core every frame.
    */
    let seed = Math.random() * 100000;

    function random() {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    }

    function rand(min, max) {
      return min + random() * (max - min);
    }

    function resize() {
      const rect = canvas.getBoundingClientRect();

      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);

      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      buildField();
    }

    /*
      Creates ONE irregular electrical filament.

      Unlike a radial ray, every filament changes direction
      repeatedly and can branch.
    */
    function createFilament(angle, length, startRadius, depth = 0) {
      const points = [];

      let x = 0;
      let y = 0;

      let currentAngle = angle;

      const steps = Math.max(10, Math.floor(length / 4));

      let radius = startRadius;

      for (let i = 0; i < steps; i++) {
        /*
          Strong angular instability creates the tangled,
          broken-electrical appearance from the reference.
        */
        currentAngle += rand(-0.34, 0.34);

        /*
          Occasional dramatic direction change.
        */
        if (random() < 0.07) {
          currentAngle += rand(-0.8, 0.8);
        }

        radius += rand(1.2, 4.2);

        const jitterX = rand(-3.5, 3.5);
        const jitterY = rand(-3.5, 3.5);

        x = Math.cos(currentAngle) * radius + jitterX;
        y = Math.sin(currentAngle) * radius + jitterY;

        points.push({
          x,
          y,
          brightness: rand(0.45, 1),
        });

        /*
          Random branches.
        */
        if (
          depth < 2 &&
          i > 5 &&
          i < steps - 8 &&
          random() < 0.055
        ) {
          const branchAngle =
            currentAngle + rand(-1.15, 1.15);

          const branchLength = length * rand(0.22, 0.48);

          filaments.push(
            createFilament(
              branchAngle,
              branchLength,
              radius,
              depth + 1
            )
          );
        }

        /*
          Branching filament may occasionally terminate early.
        */
        if (i > steps * 0.55 && random() < 0.025) {
          break;
        }
      }

      return {
        points,
        width: rand(0.35, 1.25) * (depth === 0 ? 1 : 0.65),
        alpha: rand(0.3, 0.9),
        phase: rand(0, TWO_PI),
        speed: rand(0.003, 0.012),
        depth,
      };
    }

    function buildField() {
      filaments = [];
      sparks = [];

      /*
        Reference composition:
        - dense center
        - chaotic surrounding field
        - irregular outer edge
        - no perfect circle
      */

      const baseCount = width < 600 ? 115 : 180;

      for (let i = 0; i < baseCount; i++) {
        /*
          Deliberately NON-uniform angle distribution.
        */
        const angle =
          (i / baseCount) * TWO_PI +
          rand(-0.18, 0.18);

        /*
          Different lengths prevent the "sun ray" appearance.
        */
        const length = rand(
          Math.min(width, height) * 0.18,
          Math.min(width, height) * 0.42
        );

        /*
          Some filaments begin closer to the center,
          some deeper inside the plasma.
        */
        const startRadius = rand(5, 25);

        filaments.push(
          createFilament(
            angle,
            length,
            startRadius,
            0
          )
        );
      }

      /*
        Tiny floating energy particles.
        These are sparse — NOT a particle sphere.
      */
      const sparkCount = width < 600 ? 100 : 170;

      for (let i = 0; i < sparkCount; i++) {
        const angle = random() * TWO_PI;

        const radius = Math.pow(random(), 0.65) *
          Math.min(width, height) *
          0.34;

        sparks.push({
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
          radius: rand(0.35, 1.5),
          alpha: rand(0.2, 0.8),
          phase: rand(0, TWO_PI),
          speed: rand(0.01, 0.04),
        });
      }
    }

    function drawGlow(cx, cy, pulse) {
      /*
        Very small central glow.
        Keeping this restrained prevents the "giant sun" effect.
      */

      const inner = 7 + pulse * 3;
      const outer = 70 + pulse * 25;

      const gradient = ctx.createRadialGradient(
        cx,
        cy,
        0,
        cx,
        cy,
        outer
      );

      gradient.addColorStop(
        0,
        "rgba(255,255,245,1)"
      );

      gradient.addColorStop(
        0.04,
        "rgba(255,248,210,1)"
      );

      gradient.addColorStop(
        0.12,
        "rgba(255,190,70,0.95)"
      );

      gradient.addColorStop(
        0.35,
        "rgba(255,105,20,0.35)"
      );

      gradient.addColorStop(
        1,
        "rgba(255,70,10,0)"
      );

      ctx.fillStyle = gradient;

      ctx.beginPath();
      ctx.arc(
        cx,
        cy,
        outer,
        0,
        TWO_PI
      );

      ctx.fill();

      /*
        White-hot center.
      */
      const coreGradient = ctx.createRadialGradient(
        cx,
        cy,
        0,
        cx,
        cy,
        inner
      );

      coreGradient.addColorStop(
        0,
        "rgba(255,255,255,1)"
      );

      coreGradient.addColorStop(
        0.35,
        "rgba(255,255,230,1)"
      );

      coreGradient.addColorStop(
        0.7,
        "rgba(255,205,100,1)"
      );

      coreGradient.addColorStop(
        1,
        "rgba(255,110,20,0)"
      );

      ctx.fillStyle = coreGradient;

      ctx.beginPath();
      ctx.arc(
        cx,
        cy,
        inner,
        0,
        TWO_PI
      );

      ctx.fill();
    }

    function drawFilament(filament, time, cx, cy) {
      const points = filament.points;

      if (!points || points.length < 2) return;

      /*
        Filaments subtly vibrate.
        This is what makes the structure feel alive.
      */

      const flicker =
        0.72 +
        Math.sin(
          time * filament.speed * 1000 +
          filament.phase
        ) *
          0.28;

      const alpha =
        filament.alpha *
        flicker;

      ctx.beginPath();

      for (let i = 0; i < points.length; i++) {
        const p = points[i];

        const localWave =
          Math.sin(
            time * 0.0025 +
            i * 0.85 +
            filament.phase
          ) * 1.6;

        const x =
          cx +
          p.x +
          Math.cos(i * 1.7) * localWave;

        const y =
          cy +
          p.y +
          Math.sin(i * 1.3) * localWave;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      /*
        Outer filaments are darker and thinner.
        Inner filaments are brighter.
      */
      const glow =
        filament.depth === 0
          ? "rgba(255,115,25,"
          : "rgba(255,165,75,";

      ctx.strokeStyle =
        glow + Math.min(alpha, 0.9) + ")";

      ctx.lineWidth = filament.width;

      ctx.shadowBlur =
        filament.depth === 0 ? 5 : 2;

      ctx.shadowColor =
        "rgba(255,100,20,0.7)";

      ctx.stroke();

      ctx.shadowBlur = 0;
    }

    function drawSparks(time, cx, cy) {
      for (const spark of sparks) {
        const alpha =
          spark.alpha *
          (0.55 +
            Math.sin(
              time * spark.speed +
                spark.phase
            ) *
              0.45);

        ctx.fillStyle =
          `rgba(255,190,105,${Math.max(
            0,
            alpha
          )})`;

        ctx.beginPath();

        ctx.arc(
          cx + spark.x,
          cy + spark.y,
          spark.radius,
          0,
          TWO_PI
        );

        ctx.fill();
      }
    }

    function draw(time) {
      ctx.clearRect(
        0,
        0,
        width,
        height
      );

      const cx = width / 2;
      const cy = height / 2;

      /*
        Processing mode increases activity,
        but does NOT simply make the object huge.
      */
      const activity = thinking ? 1.45 : 1;

      /*
        Slight breathing pulse.
        Very subtle.
      */
      const pulse =
        (Math.sin(time * 0.0022 * activity) + 1) /
        2;

      /*
        Draw a faint ambient plasma haze.
      */
      const hazeRadius =
        Math.min(width, height) *
        0.25;

      const haze =
        ctx.createRadialGradient(
          cx,
          cy,
          0,
          cx,
          cy,
          hazeRadius
        );

      haze.addColorStop(
        0,
        `rgba(255,85,10,${0.10 +
          pulse * 0.05})`
      );

      haze.addColorStop(
        0.45,
        "rgba(255,55,5,0.035)"
      );

      haze.addColorStop(
        1,
        "rgba(255,30,0,0)"
      );

      ctx.fillStyle = haze;

      ctx.beginPath();
      ctx.arc(
        cx,
        cy,
        hazeRadius,
        0,
        TWO_PI
      );

      ctx.fill();

      /*
        Back filaments first.
      */
      for (const filament of filaments) {
        if (filament.depth > 0) {
          drawFilament(
            filament,
            time * activity,
            cx,
            cy
          );
        }
      }

      /*
        Main filaments.
      */
      for (const filament of filaments) {
        if (filament.depth === 0) {
          drawFilament(
            filament,
            time * activity,
            cx,
            cy
          );
        }
      }

      drawSparks(
        time * activity,
        cx,
        cy
      );

      drawGlow(
        cx,
        cy,
        pulse * activity
      );

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
        thinking ? "energy-thinking" : ""
      }`}
    >
      <canvas
        ref={canvasRef}
        className="energy-canvas"
      />
    </div>
  );
}

/* --------------------------------------------------
   BOOT
-------------------------------------------------- */

const BOOT_LINES = [
  {
    text: "INITIALIZING J.A.R.V.I.S. CORE...",
    dim: false,
  },
  {
    text: "loading language subsystem",
    dim: true,
  },
  {
    text: "calibrating voice interface",
    dim: true,
  },
  {
    text: "ALL SYSTEMS NOMINAL",
    dim: false,
  },
];

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

  /*
    Boot sequence
  */
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

  /*
    Keep chat scrolled to newest message.
  */
  useEffect(() => {
    if (!logRef.current) return;

    logRef.current.scrollTo({
      top:
        logRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  /*
    Speech recognition.
  */
  useEffect(() => {
    if (typeof window === "undefined")
      return;

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition)
      return;

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

  function toggleMic() {
    const recognition =
      recognitionRef.current;

    if (!recognition) {
      alert(
        "Voice input is not supported in this browser. Try Chrome or Edge."
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

  /*
    Text-to-speech API.
  */
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

  /*
    Send message to your existing API.
  */
  async function sendMessage() {
    const text =
      input.trim();

    if (!text || loading)
      return;

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
          .catch(() => null);

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

      speak(reply);
    } catch {
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

  /*
    Enter = send
  */
  function handleKeyDown(event) {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      sendMessage();
    }
  }

  /*
    Boot screen
  */
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
      {/* HEADER */}

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

      {/* INITIAL JARVIS MESSAGE */}

      <section
        className="welcome-message"
        aria-live="polite"
      >
        <div className="message-label">
          JARVIS
        </div>

        <div className="welcome-text">
          Good to see you. Systems are
          online — how can I help?
        </div>
      </section>

      {/* ENERGY CORE */}

      <div className="core-stage">
        <EnergyCore
          thinking={loading}
        />
      </div>

      {/* CHAT HISTORY */}

      <section
        className="log"
        ref={logRef}
      >
        {messages
          .slice(1)
          .map((message, index) => (
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
                {
                  message.content
                }
              </div>
            </div>
          ))}

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
