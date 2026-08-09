"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const BOOT_LINES = [
  { text: "INITIALIZING J.A.R.V.I.S. CORE...", dim: false },
  { text: "loading language subsystem", dim: true },
  { text: "calibrating voice interface", dim: true },
  { text: "ALL SYSTEMS NOMINAL", dim: false },
];

function Core({ thinking }) {
  const mountRef = useRef(null);
  const thinkingRef = useRef(thinking);

  useEffect(() => {
    thinkingRef.current = thinking;
  }, [thinking]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      52,
      1,
      0.1,
      100
    );

    camera.position.z = 7;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, 2)
    );

    renderer.setClearColor(0x000000, 0);

    mount.appendChild(renderer.domElement);

    /* =========================================================
       PARTICLE TEXTURE
    ========================================================= */

    const spriteCanvas = document.createElement("canvas");
    spriteCanvas.width = 128;
    spriteCanvas.height = 128;

    const ctx = spriteCanvas.getContext("2d");

    const gradient = ctx.createRadialGradient(
      64,
      64,
      0,
      64,
      64,
      64
    );

    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.08, "rgba(220,255,255,1)");
    gradient.addColorStop(0.22, "rgba(70,240,255,0.95)");
    gradient.addColorStop(0.48, "rgba(0,180,255,0.4)");
    gradient.addColorStop(1, "rgba(0,70,255,0)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);

    const spriteTexture =
      new THREE.CanvasTexture(spriteCanvas);

    /* =========================================================
       MAIN PARTICLE FIELD
    ========================================================= */

    const PARTICLE_COUNT = 6500;

    const positions = new Float32Array(
      PARTICLE_COUNT * 3
    );

    const randomValues = new Float32Array(
      PARTICLE_COUNT
    );

    const velocities = new Float32Array(
      PARTICLE_COUNT
    );

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;

      const theta =
        Math.random() * Math.PI * 2;

      const phi =
        Math.acos(2 * Math.random() - 1);

      const radius =
        Math.pow(Math.random(), 1.8) * 2.35;

      positions[i3] =
        Math.sin(phi) *
        Math.cos(theta) *
        radius;

      positions[i3 + 1] =
        Math.cos(phi) *
        radius *
        0.9;

      positions[i3 + 2] =
        Math.sin(phi) *
        Math.sin(theta) *
        radius;

      randomValues[i] = Math.random();

      velocities[i] =
        0.15 + Math.random() * 0.85;
    }

    const geometry =
      new THREE.BufferGeometry();

    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(
        positions,
        3
      )
    );

    geometry.setAttribute(
      "aRandom",
      new THREE.BufferAttribute(
        randomValues,
        1
      )
    );

    geometry.setAttribute(
      "aVelocity",
      new THREE.BufferAttribute(
        velocities,
        1
      )
    );

    /* =========================================================
       PARTICLE SHADER
    ========================================================= */

    const material =
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,

        uniforms: {
          uTime: { value: 0 },
          uActive: { value: 0 },

          uPixelRatio: {
            value: Math.min(
              window.devicePixelRatio || 1,
              2
            ),
          },

          uTexture: {
            value: spriteTexture,
          },
        },

        vertexShader: `
          uniform float uTime;
          uniform float uActive;
          uniform float uPixelRatio;

          attribute float aRandom;
          attribute float aVelocity;

          varying float vAlpha;

          void main() {

            vec3 p = position;

            float radius = length(p);

            vec3 direction =
              normalize(
                p + vec3(0.0001)
              );

            /* Organic movement */

            float wave =
              sin(
                uTime * 0.7 +
                radius * 3.0 +
                aRandom * 20.0
              );

            float wave2 =
              cos(
                uTime * 0.53 +
                p.y * 4.0 +
                aRandom * 12.0
              );

            p.x += wave * 0.08;
            p.y += wave2 * 0.08;

            p.z +=
              sin(
                uTime * 0.8 +
                p.z * 5.0
              ) * 0.06;

            /* EXPANSION */

            float expansion =
              uActive *
              (
                1.0 +
                aVelocity * 7.5
              );

            float pulse =
              sin(
                uTime * 2.4 -
                radius * 2.5 +
                aRandom * 5.0
              );

            expansion +=
              uActive *
              pulse *
              0.35;

            p +=
              direction *
              expansion;

            /* Turbulent swirl */

            float swirl =
              uActive *
              (
                0.35 +
                aRandom * 0.8
              );

            p.x +=
              sin(
                uTime * 0.8 +
                p.y * 2.0
              ) * swirl;

            p.z +=
              cos(
                uTime * 0.65 +
                p.x * 2.0
              ) * swirl;

            vec4 mvPosition =
              modelViewMatrix *
              vec4(p, 1.0);

            float size =
              mix(
                2.0,
                6.5,
                aRandom
              );

            size *=
              1.0 +
              uActive * 1.8;

            gl_PointSize =
              size *
              uPixelRatio *
              (
                7.0 /
                -mvPosition.z
              );

            gl_Position =
              projectionMatrix *
              mvPosition;

            float edge =
              smoothstep(
                0.0,
                7.0,
                length(p)
              );

            vAlpha =
              (
                0.25 +
                aRandom * 0.75
              ) *
              (
                1.0 -
                edge * 0.45
              );
          }
        `,

        fragmentShader: `
          uniform sampler2D uTexture;

          varying float vAlpha;

          void main() {

            vec4 tex =
              texture2D(
                uTexture,
                gl_PointCoord
              );

            if (tex.a < 0.02)
              discard;

            gl_FragColor =
              vec4(
                tex.rgb,
                tex.a * vAlpha
              );
          }
        `,
      });

    const particles =
      new THREE.Points(
        geometry,
        material
      );

    scene.add(particles);

    /* =========================================================
       INNER CORE PARTICLES
    ========================================================= */

    const CORE_COUNT = 1000;

    const corePositions =
      new Float32Array(
        CORE_COUNT * 3
      );

    for (let i = 0; i < CORE_COUNT; i++) {
      const i3 = i * 3;

      const theta =
        Math.random() * Math.PI * 2;

      const phi =
        Math.acos(2 * Math.random() - 1);

      const radius =
        Math.random() * 0.9;

      corePositions[i3] =
        Math.sin(phi) *
        Math.cos(theta) *
        radius;

      corePositions[i3 + 1] =
        Math.cos(phi) *
        radius;

      corePositions[i3 + 2] =
        Math.sin(phi) *
        Math.sin(theta) *
        radius;
    }

    const coreGeometry =
      new THREE.BufferGeometry();

    coreGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(
        corePositions,
        3
      )
    );

    const coreMaterial =
      new THREE.PointsMaterial({
        size: 0.075,
        map: spriteTexture,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        color: new THREE.Color(0xdfffff),
      });

    const coreParticles =
      new THREE.Points(
        coreGeometry,
        coreMaterial
      );

    scene.add(coreParticles);

    /* =========================================================
       CENTRAL ENERGY
    ========================================================= */

    const glow =
      new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: spriteTexture,
          color: new THREE.Color(0x35eaff),
          transparent: true,
          opacity: 0.85,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        })
      );

    glow.scale.set(2.5, 2.5, 1);

    scene.add(glow);

    const whiteGlow =
      new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: spriteTexture,
          color: new THREE.Color(0xffffff),
          transparent: true,
          opacity: 0.9,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        })
      );

    whiteGlow.scale.set(0.55, 0.55, 1);

    scene.add(whiteGlow);

    /* =========================================================
       RESIZE
    ========================================================= */

    function resize() {
      const width =
        mount.clientWidth ||
        window.innerWidth;

      const height =
        mount.clientHeight ||
        window.innerHeight;

      renderer.setSize(
        width,
        height,
        false
      );

      camera.aspect =
        width / height;

      camera.updateProjectionMatrix();
    }

    resize();

    window.addEventListener(
      "resize",
      resize
    );

    /* =========================================================
       ANIMATION
    ========================================================= */

    const clock =
      new THREE.Clock();

    let animationFrame;

    function animate() {
      const time =
        clock.getElapsedTime();

      const target =
        thinkingRef.current ? 1 : 0;

      material.uniforms.uActive.value =
        THREE.MathUtils.lerp(
          material.uniforms.uActive.value,
          target,
          0.045
        );

      material.uniforms.uTime.value =
        time;

      const active =
        material.uniforms.uActive.value;

      /* Core breathing */

      const pulse =
        1 +
        Math.sin(time * 2.5) *
        0.08;

      const glowScale =
        2.4 *
        pulse *
        (1 + active * 1.6);

      glow.scale.set(
        glowScale,
        glowScale,
        1
      );

      const whiteScale =
        0.55 *
        (1 + active * 1.1);

      whiteGlow.scale.set(
        whiteScale,
        whiteScale,
        1
      );

      glow.material.opacity =
        0.65 + active * 0.35;

      whiteGlow.material.opacity =
        0.7 + active * 0.3;

      /* Inner core rotation */

      coreParticles.rotation.y =
        time * 0.35;

      coreParticles.rotation.x =
        Math.sin(time * 0.3) *
        0.15;

      /* Main field rotation */

      particles.rotation.y =
        time * 0.035;

      particles.rotation.x =
        Math.sin(time * 0.13) *
        0.08;

      /* Subtle camera movement */

      camera.position.x =
        Math.sin(time * 0.16) *
        0.08;

      camera.position.y =
        Math.cos(time * 0.13) *
        0.06;

      camera.position.z =
        7 - active * 0.55;

      camera.lookAt(0, 0, 0);

      renderer.render(
        scene,
        camera
      );

      animationFrame =
        requestAnimationFrame(
          animate
        );
    }

    animate();

    /* =========================================================
       CLEANUP
    ========================================================= */

    return () => {
      cancelAnimationFrame(
        animationFrame
      );

      window.removeEventListener(
        "resize",
        resize
      );

      geometry.dispose();
      material.dispose();

      coreGeometry.dispose();
      coreMaterial.dispose();

      spriteTexture.dispose();

      glow.material.dispose();
      whiteGlow.material.dispose();

      renderer.dispose();

      if (
        mount.contains(
          renderer.domElement
        )
      ) {
        mount.removeChild(
          renderer.domElement
        );
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className={`core${
        thinking ? " thinking" : ""
      }`}
    />
  );
}

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

  useEffect(() => {
    if (
      visibleBootLines <
      BOOT_LINES.length
    ) {
      const t = setTimeout(
        () =>
          setVisibleBootLines(
            (n) => n + 1
          ),
        380
      );

      return () =>
        clearTimeout(t);
    }

    const t = setTimeout(
      () => setBooted(true),
      500
    );

    return () =>
      clearTimeout(t);
  }, [visibleBootLines]);

  useEffect(() => {
    logRef.current?.scrollTo({
      top: logRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  useEffect(() => {
    const SpeechRecognition =
      typeof window !== "undefined" &&
      (
        window.SpeechRecognition ||
        window.webkitSpeechRecognition
      );

    if (!SpeechRecognition)
      return;

    const recognition =
      new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (e) => {
      const transcript =
        e.results[0][0].transcript;

      setInput(transcript);
    };

    recognition.onerror = (e) => {
      setListening(false);

      if (
        e.error === "not-allowed" ||
        e.error === "service-not-allowed"
      ) {
        alert(
          "Microphone access was blocked. Check your browser's site settings and allow the microphone for this page."
        );
      } else if (
        e.error !== "no-speech"
      ) {
        alert(
          "Voice input hit an error: " +
            e.error
        );
      }
    };

    recognition.onend = () =>
      setListening(false);

    recognitionRef.current =
      recognition;
  }, []);

  function toggleMic() {
    if (!recognitionRef.current) {
      alert(
        "Voice input isn't supported in this browser. Safari (Mac and iPhone) doesn't support it yet — try Chrome or Edge instead."
      );
      return;
    }

    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setListening(true);
      } catch {
        setListening(false);
      }
    }
  }

  async function speak(text) {
    if (!voiceOn) return;

    try {
      const res = await fetch(
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

      if (!res.ok) {
        const data =
          await res
            .json()
            .catch(() => null);

        alert(
          "Voice playback failed: " +
            (
              data?.error ||
              `HTTP ${res.status}`
            )
        );

        return;
      }

      const audioBlob =
        await res.blob();

      const audioUrl =
        URL.createObjectURL(
          audioBlob
        );

      const audio =
        new Audio(audioUrl);

      audio.play();
    } catch (err) {
      alert(
        "Voice playback failed: " +
          err.message
      );
    }
  }

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

    setMessages(
      nextMessages
    );

    setInput("");
    setLoading(true);

    try {
      const res =
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
        await res.json();

      if (!res.ok) {
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content:
              data.error ||
              "Something went wrong.",
            error: true,
          },
        ]);
      } else {
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content: data.reply,
          },
        ]);

        speak(data.reply);
      }
    } catch {
      setMessages((m) => [
        ...m,
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
        ).map((line, i) => (
          <div
            key={i}
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

  return (
    <div className="app">

      <div className="header">
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
          className={`voice-toggle${
            voiceOn
              ? " active"
              : ""
          }`}
          onClick={() =>
            setVoiceOn(
              (v) => !v
            )
          }
        >
          VOICE{" "}
          {voiceOn
            ? "ON"
            : "OFF"}
        </button>
      </div>

      {/* FULL SCREEN CORE */}

      <div className="core-stage">
        <Core
          thinking={
            loading ||
            listening
          }
        />
      </div>

      {/* CHAT */}

      <div
        className="log"
        ref={logRef}
      >
        {messages.map(
          (m, i) => (
            <div
              key={i}
              className={`msg-row ${m.role}`}
            >
              <div className="msg-label">
                {m.role ===
                "user"
                  ? "YOU"
                  : "JARVIS"}
              </div>

              <div
                className={`bubble${
                  m.error
                    ? " error"
                    : ""
                }`}
              >
                {m.content}
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
      </div>

      {/* INPUT */}

      <div className="input-bar">
        <button
          className={`icon-btn mic${
            listening
              ? " listening"
              : ""
          }`}
          onClick={
            toggleMic
          }
          title="Voice input"
        >
          🎙
        </button>

        <input
          value={input}
          onChange={(e) =>
            setInput(
              e.target.value
            )
          }
          onKeyDown={(e) =>
            e.key === "Enter" &&
            sendMessage()
          }
          placeholder="Speak, and I shall listen..."
          disabled={loading}
        />

        <button
          className="icon-btn send"
          onClick={
            sendMessage
          }
          disabled={
            loading ||
            !input.trim()
          }
          title="Send"
        >
          ➤
        </button>
      </div>
    </div>
  );
}
