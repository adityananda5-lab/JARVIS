"use client";

import { useEffect, useRef, useState } from "react";

const BOOT_LINES = [
  { text: "INITIALIZING J.A.R.V.I.S. CORE...", dim: false },
  { text: "loading neural interface", dim: true },
  { text: "stabilizing energy matrix", dim: true },
  { text: "CALIBRATION COMPLETE", dim: false },
];

/* =========================================================
   JARVIS ENERGY CORE
   Canvas-based — NO SVG RINGS / NO ORBITS
   ========================================================= */

function JarvisCore({ thinking }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const thinkingRef = useRef(thinking);

  useEffect(() => {
    thinkingRef.current = thinking;
  }, [thinking]);

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
    let running = true;

    /*
     * Deterministic random generator.
     * This means the energy structure is stable rather than
     * completely changing shape every frame.
     */
    let seed = 734291;

    function random() {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    }

    /*
     * Each electrical strand gets its own data.
     */
    let strands = [];
    let sparks = [];

    function createStrands() {
      seed = 734291;

      strands = [];

      /*
       * Main dense electrical network.
       */
      const strandCount = window.innerWidth < 600 ? 125 : 190;

      for (let i = 0; i < strandCount; i++) {
        const angle =
          random() * Math.PI * 2 +
          Math.sin(i * 2.17) * 0.15;

        const length =
          0.45 +
          Math.pow(random(), 0.65) * 0.85;

        const segments =
          9 + Math.floor(random() * 23);

        const thickness =
          0.35 + random() * 0.85;

        const brightness =
          0.18 + random() * 0.72;

        const angularDrift =
          (random() - 0.5) * 0.018;

        const wobble =
          0.5 + random() * 1.6;

        strands.push({
          angle,
          length,
          segments,
          thickness,
          brightness,
          angularDrift,
          wobble,
          seed: random() * 1000,
          phase: random() * Math.PI * 2,
        });
      }

      /*
       * Smaller broken electrical fragments.
       */
      for (let i = 0; i < 260; i++) {
        sparks.push({
          angle: random() * Math.PI * 2,
          radius:
            0.15 + Math.pow(random(), 0.65) * 1.05,
          length:
            2 + random() * 13,
          brightness:
            0.18 + random() * 0.75,
          size:
            0.3 + random() * 1.15,
          phase:
            random() * Math.PI * 2,
          speed:
            0.15 + random() * 0.7,
        });
      }
    }

    function resize() {
      const rect = canvas.getBoundingClientRect();

      width = rect.width;
      height = rect.height;

      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      createStrands();
    }

    resize();

    window.addEventListener("resize", resize);

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    function drawCore(time) {
      if (!running) return;

      const t = time * 0.001;

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      /*
       * The core is intentionally not huge.
       * This prevents the "giant sun" effect.
       */
      const baseRadius =
        Math.min(width, height) *
        (window.innerWidth < 600 ? 0.125 : 0.105);

      const energyMultiplier = thinkingRef.current
        ? 1.28
        : 1;

      /*
       * -----------------------------------------------------
       * AMBIENT ENERGY CLOUD
       * -----------------------------------------------------
       */

      const cloudRadius =
        baseRadius * 5.0 * energyMultiplier;

      const cloud = ctx.createRadialGradient(
        cx,
        cy,
        0,
        cx,
        cy,
        cloudRadius
      );

      cloud.addColorStop(
        0,
        "rgba(255, 104, 12, 0.19)"
      );

      cloud.addColorStop(
        0.28,
        "rgba(255, 87, 10, 0.10)"
      );

      cloud.addColorStop(
        0.62,
        "rgba(255, 70, 0, 0.035)"
      );

      cloud.addColorStop(
        1,
        "rgba(255, 40, 0, 0)"
      );

      ctx.fillStyle = cloud;

      ctx.beginPath();
      ctx.arc(
        cx,
        cy,
        cloudRadius,
        0,
        Math.PI * 2
      );
      ctx.fill();

      /*
       * -----------------------------------------------------
       * ELECTRICAL NETWORK
       * -----------------------------------------------------
       */

      ctx.save();

      ctx.globalCompositeOperation = "lighter";

      for (let i = 0; i < strands.length; i++) {
        const s = strands[i];

        /*
         * Every strand slowly changes orientation.
         */
        const dynamicAngle =
          s.angle +
          Math.sin(
            t * 0.34 +
              s.phase
          ) *
            s.angularDrift *
            35;

        /*
         * The outer radius changes subtly.
         */
        const maxRadius =
          baseRadius *
          (1.25 + s.length * 4.9) *
          energyMultiplier;

        let angle = dynamicAngle;

        let previousX = cx;
        let previousY = cy;

        /*
         * Individual strands don't travel in a perfect
         * straight radial line. They zig-zag and branch.
         */
        for (
          let j = 0;
          j < s.segments;
          j++
        ) {
          const progress =
            (j + 1) / s.segments;

          const radius =
            maxRadius *
            progress;

          const wave =
            Math.sin(
              t * 1.35 +
                s.seed +
                j * 1.73
            ) *
            s.wobble *
            (1 - progress * 0.35);

          const sharpJitter =
            Math.sin(
              s.seed * 4.1 +
                j * 9.17
            ) *
            0.22;

          angle +=
            wave * 0.018 +
            sharpJitter * 0.035;

          const x =
            cx +
            Math.cos(angle) *
              radius;

          const y =
            cy +
            Math.sin(angle) *
              radius;

          /*
           * Some strands become dimmer toward their edge.
           */
          const fade =
            Math.sin(progress * Math.PI) *
            0.9 +
            0.1;

          const alpha =
            s.brightness *
            fade *
            (thinkingRef.current
              ? 1.18
              : 0.92);

          /*
           * Main glow.
           */
          ctx.beginPath();
          ctx.moveTo(previousX, previousY);
          ctx.lineTo(x, y);

          ctx.lineWidth =
            s.thickness *
            (thinkingRef.current
              ? 1.15
              : 1);

          ctx.strokeStyle =
            `rgba(255, ${105 + Math.floor(
              progress * 90
            )}, ${25 + Math.floor(
              progress * 25
            )}, ${alpha})`;

          ctx.shadowBlur =
            progress < 0.45
              ? 7
              : 3;

          ctx.shadowColor =
            "rgba(255, 80, 8, 0.8)";

          ctx.stroke();

          /*
           * Fine bright filament over the glow.
           */
          if (
            j % 2 === 0 &&
            s.brightness > 0.42
          ) {
            ctx.beginPath();
            ctx.moveTo(
              previousX,
              previousY
            );
            ctx.lineTo(x, y);

            ctx.lineWidth =
              Math.max(
                0.22,
                s.thickness * 0.32
              );

            ctx.strokeStyle =
              `rgba(255, 185, 105, ${
                alpha * 0.82
              })`;

            ctx.shadowBlur = 2;
            ctx.shadowColor =
              "rgba(255, 120, 30, 0.8)";

            ctx.stroke();
          }

          previousX = x;
          previousY = y;

          /*
           * Random-looking branches.
           * These are what stop the structure from becoming
           * a circular/radial solar-system shape.
           */
          if (
            j > 2 &&
            randomBranch(
              s.seed,
              j
            )
          ) {
            drawBranch(
              previousX,
              previousY,
              angle,
              radius,
              baseRadius,
              t,
              s
            );
          }
        }
      }

      /*
       * -----------------------------------------------------
       * FLOATING ELECTRICAL FRAGMENTS
       * -----------------------------------------------------
       */

      for (let i = 0; i < sparks.length; i++) {
        const p = sparks[i];

        const pulse =
          0.65 +
          Math.sin(
            t * p.speed +
              p.phase
          ) *
            0.35;

        const radius =
          baseRadius *
          (1.2 + p.radius * 4.7);

        const angle =
          p.angle +
          Math.sin(
            t * 0.25 +
              p.phase
          ) *
            0.04;

        const x =
          cx +
          Math.cos(angle) *
            radius;

        const y =
          cy +
          Math.sin(angle) *
            radius;

        const x2 =
          x +
          Math.cos(angle + 0.8) *
            p.length;

        const y2 =
          y +
          Math.sin(angle + 0.8) *
            p.length;

        ctx.beginPath();

        ctx.moveTo(x, y);
        ctx.lineTo(x2, y2);

        ctx.lineWidth =
          p.size * 0.45;

        ctx.strokeStyle =
          `rgba(255, ${
            120 + Math.floor(
              pulse * 100
            )
          }, 55, ${
            p.brightness *
            pulse *
            0.72
          })`;

        ctx.shadowBlur = 4;
        ctx.shadowColor =
          "rgba(255, 90, 10, 0.8)";

        ctx.stroke();
      }

      ctx.restore();

      /*
       * -----------------------------------------------------
       * HOT CENTRAL CORE
       * -----------------------------------------------------
       *
       * This is deliberately much smaller than the surrounding
       * energy structure.
       */

      const pulse =
        1 +
        Math.sin(t * (
          thinkingRef.current
            ? 5.2
            : 2.4
        )) *
          0.075;

      const r =
        baseRadius *
        pulse;

      /*
       * Outer glow.
       */
      const glow = ctx.createRadialGradient(
        cx,
        cy,
        0,
        cx,
        cy,
        r * 4.2
      );

      glow.addColorStop(
        0,
        "rgba(255, 245, 215, 0.95)"
      );

      glow.addColorStop(
        0.10,
        "rgba(255, 220, 150, 0.95)"
      );

      glow.addColorStop(
        0.23,
        "rgba(255, 130, 25, 0.72)"
      );

      glow.addColorStop(
        0.48,
        "rgba(255, 72, 5, 0.22)"
      );

      glow.addColorStop(
        1,
        "rgba(255, 40, 0, 0)"
      );

      ctx.save();

      ctx.globalCompositeOperation =
        "lighter";

      ctx.fillStyle = glow;

      ctx.beginPath();

      ctx.arc(
        cx,
        cy,
        r * 4.2,
        0,
        Math.PI * 2
      );

      ctx.fill();

      /*
       * White-hot center.
       */
      const hot = ctx.createRadialGradient(
        cx - r * 0.2,
        cy - r * 0.2,
        0,
        cx,
        cy,
        r
      );

      hot.addColorStop(
        0,
        "#ffffff"
      );

      hot.addColorStop(
        0.3,
        "#fff6df"
      );

      hot.addColorStop(
        0.62,
        "#ffbd52"
      );

      hot.addColorStop(
        1,
        "#ff5b08"
      );

      ctx.fillStyle = hot;

      ctx.shadowBlur =
        thinkingRef.current
          ? 35
          : 25;

      ctx.shadowColor =
        "rgba(255, 90, 5, 0.95)";

      ctx.beginPath();

      ctx.arc(
        cx,
        cy,
        r,
        0,
        Math.PI * 2
      );

      ctx.fill();

      ctx.restore();

      animationRef.current =
        requestAnimationFrame(drawCore);
    }

    function randomBranch(
      strandSeed,
      segment
    ) {
      const value =
        Math.sin(
          strandSeed * 12.9898 +
            segment * 78.233
        ) *
        43758.5453;

      return (
        value -
          Math.floor(value) >
        0.925
      );
    }

    function drawBranch(
      startX,
      startY,
      parentAngle,
      parentRadius,
      baseRadius,
      time,
      strand
    ) {
      let x = startX;
      let y = startY;

      let angle =
        parentAngle +
        (Math.sin(
          strand.seed * 8.2 +
            parentRadius
        ) *
          1.7);

      const branchLength =
        2 +
        Math.abs(
          Math.sin(
            strand.seed +
              parentRadius
          )
        ) *
          8;

      ctx.beginPath();

      ctx.moveTo(x, y);

      for (
        let i = 0;
        i < 5;
        i++
      ) {
        angle +=
          Math.sin(
            time * 1.8 +
              strand.seed +
              i * 2.7
          ) *
          0.17;

        const step =
          branchLength /
          5;

        x +=
          Math.cos(angle) *
          step;

        y +=
          Math.sin(angle) *
          step;

        ctx.lineTo(x, y);
      }

      ctx.lineWidth = 0.35;

      ctx.strokeStyle =
        "rgba(255, 130, 45, 0.55)";

      ctx.shadowBlur = 3;

      ctx.shadowColor =
        "rgba(255, 80, 10, 0.75)";

      ctx.stroke();
    }

    animationRef.current =
      requestAnimationFrame(drawCore);

    return () => {
      running = false;

      cancelAnimationFrame(
        animationRef.current
      );

      window.removeEventListener(
        "resize",
        resize
      );

      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div
      className={`jarvis-core ${
        thinking ? "thinking" : ""
      }`}
    >
      <canvas ref={canvasRef} />
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
   * Scroll chat.
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
   * Speech recognition.
   */
  useEffect(() => {
    const SpeechRecognition =
      typeof window !== "undefined" &&
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
          "Microphone access was blocked. Please allow microphone access for this website."
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
      recognition.abort();
    };
  }, []);

  function toggleMic() {
    if (!recognitionRef.current) {
      alert(
        "Voice input is not supported in this browser. Try Chrome or Edge."
      );
      return;
    }

    if (listening) {
      recognitionRef.current.stop();
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
              data.error ||
              "Something went wrong.",
            error: true,
          },
        ]);
      } else {
        setMessages((current) => [
          ...current,
          {
            role: "assistant",
            content: data.reply,
          },
        ]);

        speak(data.reply);
      }
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
              : listening
              ? "LISTENING"
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

      <section className="chat-area">
        <div
          className="log"
          ref={logRef}
        >
          {messages.map(
            (message, index) => (
              <div
                key={index}
                className={`message ${
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
            )
          )}

          {loading && (
            <div className="message assistant">
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
        </div>
      </section>

      <div className="core-stage">
        <JarvisCore
          thinking={loading}
        />
      </div>

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
              event.preventDefault();
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
