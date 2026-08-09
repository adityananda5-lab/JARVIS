"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const BOOT_LINES = [
  { text: "INITIALIZING J.A.R.V.I.S. CORE...", dim: false },
  { text: "loading neural interface", dim: true },
  { text: "calibrating voice interface", dim: true },
  { text: "establishing cognitive link", dim: true },
  { text: "ALL SYSTEMS NOMINAL", dim: false },
];

function Core({ active = false }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    /* =========================================================
       SCENE
    ========================================================= */

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      45,
      1,
      0.1,
      100
    );

    camera.position.set(0, 0, 7);

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

    const particleCanvas = document.createElement("canvas");
    particleCanvas.width = 64;
    particleCanvas.height = 64;

    const pctx = particleCanvas.getContext("2d");

    const particleGradient = pctx.createRadialGradient(
      32,
      32,
      0,
      32,
      32,
      32
    );

    particleGradient.addColorStop(
      0,
      "rgba(255,255,255,1)"
    );

    particleGradient.addColorStop(
      0.12,
      "rgba(220,255,255,1)"
    );

    particleGradient.addColorStop(
      0.35,
      "rgba(80,240,255,0.9)"
    );

    particleGradient.addColorStop(
      0.7,
      "rgba(0,190,255,0.35)"
    );

    particleGradient.addColorStop(
      1,
      "rgba(0,100,255,0)"
    );

    pctx.fillStyle = particleGradient;
    pctx.fillRect(0, 0, 64, 64);

    const particleTexture = new THREE.CanvasTexture(
      particleCanvas
    );

    /* =========================================================
       CORE GLOW TEXTURE
    ========================================================= */

    const glowCanvas = document.createElement("canvas");
    glowCanvas.width = 256;
    glowCanvas.height = 256;

    const gctx = glowCanvas.getContext("2d");

    const glowGradient = gctx.createRadialGradient(
      128,
      128,
      0,
      128,
      128,
      128
    );

    glowGradient.addColorStop(
      0,
      "rgba(255,255,255,1)"
    );

    glowGradient.addColorStop(
      0.08,
      "rgba(210,255,255,1)"
    );

    glowGradient.addColorStop(
      0.2,
      "rgba(80,240,255,0.95)"
    );

    glowGradient.addColorStop(
      0.45,
      "rgba(0,200,255,0.45)"
    );

    glowGradient.addColorStop(
      0.75,
      "rgba(0,120,255,0.12)"
    );

    glowGradient.addColorStop(
      1,
      "rgba(0,80,255,0)"
    );

    gctx.fillStyle = glowGradient;
    gctx.fillRect(0, 0, 256, 256);

    const glowTexture = new THREE.CanvasTexture(
      glowCanvas
    );

    /* =========================================================
       PARTICLES
    ========================================================= */

    const PARTICLE_COUNT = 2300;

    const positions = new Float32Array(
      PARTICLE_COUNT * 3
    );

    const basePositions = new Float32Array(
      PARTICLE_COUNT * 3
    );

    const velocities = new Float32Array(
      PARTICLE_COUNT * 3
    );

    const randoms = new Float32Array(
      PARTICLE_COUNT
    );

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;

      /*
       * Instead of creating a perfect sphere, create a
       * distorted energy cloud.
       */

      const theta =
        Math.random() * Math.PI * 2;

      const phi =
        Math.acos(
          2 * Math.random() - 1
        );

      const radius =
        0.35 +
        Math.pow(Math.random(), 0.65) *
          1.75;

      const distortion =
        0.72 +
        Math.random() * 0.55;

      let x =
        Math.sin(phi) *
        Math.cos(theta) *
        radius;

      let y =
        Math.cos(phi) *
        radius *
        distortion;

      let z =
        Math.sin(phi) *
        Math.sin(theta) *
        radius;

      /*
       * Stretch the energy cloud.
       */

      x *= 1.08;
      y *= 0.9;
      z *= 0.72;

      /*
       * Add slight chaotic displacement.
       */

      x +=
        Math.sin(theta * 3.0) *
        radius *
        0.12;

      y +=
        Math.cos(theta * 4.0) *
        radius *
        0.12;

      z +=
        Math.sin(phi * 5.0) *
        radius *
        0.08;

      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;

      basePositions[i3] = x;
      basePositions[i3 + 1] = y;
      basePositions[i3 + 2] = z;

      velocities[i3] =
        (Math.random() - 0.5) * 0.01;

      velocities[i3 + 1] =
        (Math.random() - 0.5) * 0.01;

      velocities[i3 + 2] =
        (Math.random() - 0.5) * 0.01;

      randoms[i] = Math.random();
    }

    const particleGeometry =
      new THREE.BufferGeometry();

    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(
        positions,
        3
      )
    );

    const particleMaterial =
      new THREE.PointsMaterial({
        size: 0.055,
        map: particleTexture,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        color: new THREE.Color(
          0x4defff
        ),
        sizeAttenuation: true,
      });

    const particles =
      new THREE.Points(
        particleGeometry,
        particleMaterial
      );

    scene.add(particles);

    /* =========================================================
       BRIGHTER INNER PARTICLES
    ========================================================= */

    const INNER_COUNT = 500;

    const innerPositions =
      new Float32Array(
        INNER_COUNT * 3
      );

    for (let i = 0; i < INNER_COUNT; i++) {
      const i3 = i * 3;

      const theta =
        Math.random() *
        Math.PI *
        2;

      const phi =
        Math.acos(
          2 * Math.random() - 1
        );

      const radius =
        Math.pow(
          Math.random(),
          2.3
        ) * 0.9;

      innerPositions[i3] =
        Math.sin(phi) *
        Math.cos(theta) *
        radius;

      innerPositions[i3 + 1] =
        Math.cos(phi) *
        radius;

      innerPositions[i3 + 2] =
        Math.sin(phi) *
        Math.sin(theta) *
        radius;
    }

    const innerGeometry =
      new THREE.BufferGeometry();

    innerGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(
        innerPositions,
        3
      )
    );

    const innerMaterial =
      new THREE.PointsMaterial({
        size: 0.08,
        map: particleTexture,
        transparent: true,
        opacity: 1,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        color: new THREE.Color(
          0xcfffff
        ),
      });

    const innerParticles =
      new THREE.Points(
        innerGeometry,
        innerMaterial
      );

    scene.add(innerParticles);

    /* =========================================================
       NEURAL CONNECTIONS
    ========================================================= */

    const LINE_COUNT = 650;

    const linePositions =
      new Float32Array(
        LINE_COUNT * 6
      );

    /*
     * Connect nearby particles by using points that are
     * deliberately close in the generated particle array.
     * This creates a neural / filament appearance.
     */

    for (let i = 0; i < LINE_COUNT; i++) {
      const a =
        Math.floor(
          Math.random() *
            PARTICLE_COUNT
        );

      let b =
        a +
        Math.floor(
          (Math.random() - 0.5) *
            90
        );

      if (b < 0) b += PARTICLE_COUNT;
      if (b >= PARTICLE_COUNT)
        b -= PARTICLE_COUNT;

      const ai = a * 3;
      const bi = b * 3;
      const li = i * 6;

      linePositions[li] =
        positions[ai];

      linePositions[li + 1] =
        positions[ai + 1];

      linePositions[li + 2] =
        positions[ai + 2];

      linePositions[li + 3] =
        positions[bi];

      linePositions[li + 4] =
        positions[bi + 1];

      linePositions[li + 5] =
        positions[bi + 2];
    }

    const lineGeometry =
      new THREE.BufferGeometry();

    lineGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(
        linePositions,
        3
      )
    );

    const lineMaterial =
      new THREE.LineBasicMaterial({
        color: 0x39eaff,
        transparent: true,
        opacity: 0.16,
        blending:
          THREE.AdditiveBlending,
        depthWrite: false,
      });

    const network =
      new THREE.LineSegments(
        lineGeometry,
        lineMaterial
      );

    scene.add(network);

    /* =========================================================
       OUTER ENERGY STREAKS
    ========================================================= */

    const STREAK_COUNT = 260;

    const streakPositions =
      new Float32Array(
        STREAK_COUNT * 6
      );

    const streakData = [];

    for (
      let i = 0;
      i < STREAK_COUNT;
      i++
    ) {
      const theta =
        Math.random() *
        Math.PI *
        2;

      const phi =
        Math.acos(
          2 * Math.random() - 1
        );

      const direction =
        new THREE.Vector3(
          Math.sin(phi) *
            Math.cos(theta),
          Math.cos(phi),
          Math.sin(phi) *
            Math.sin(theta)
        ).normalize();

      const startRadius =
        1.2 +
        Math.random() *
          0.8;

      const length =
        0.15 +
        Math.random() *
          0.75;

      streakData.push({
        direction,
        startRadius,
        length,
        phase:
          Math.random() *
          Math.PI *
          2,
      });

      const start =
        direction
          .clone()
          .multiplyScalar(
            startRadius
          );

      const end =
        direction
          .clone()
          .multiplyScalar(
            startRadius +
              length
          );

      const j = i * 6;

      streakPositions[j] =
        start.x;

      streakPositions[j + 1] =
        start.y;

      streakPositions[j + 2] =
        start.z;

      streakPositions[j + 3] =
        end.x;

      streakPositions[j + 4] =
        end.y;

      streakPositions[j + 5] =
        end.z;
    }

    const streakGeometry =
      new THREE.BufferGeometry();

    streakGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(
        streakPositions,
        3
      )
    );

    const streakMaterial =
      new THREE.LineBasicMaterial({
        color: 0x6ff7ff,
        transparent: true,
        opacity: 0.24,
        blending:
          THREE.AdditiveBlending,
        depthWrite: false,
      });

    const streaks =
      new THREE.LineSegments(
        streakGeometry,
        streakMaterial
      );

    scene.add(streaks);

    /* =========================================================
       CENTRAL ENERGY
    ========================================================= */

    const coreSprite =
      new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: glowTexture,
          transparent: true,
          opacity: 0.95,
          blending:
            THREE.AdditiveBlending,
          depthWrite: false,
          color: 0x66f5ff,
        })
      );

    coreSprite.scale.set(
      2.15,
      2.15,
      1
    );

    scene.add(coreSprite);

    const whiteCore =
      new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: glowTexture,
          transparent: true,
          opacity: 0.85,
          blending:
            THREE.AdditiveBlending,
          depthWrite: false,
          color: 0xffffff,
        })
      );

    whiteCore.scale.set(
      0.62,
      0.62,
      1
    );

    scene.add(whiteCore);

    /* =========================================================
       RESIZE
    ========================================================= */

    function resize() {
      const width =
        mount.clientWidth || 400;

      const height =
        mount.clientHeight || 400;

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

      /*
       * Active state = JARVIS speaking,
       * listening or processing.
       */

      const targetEnergy =
        active ? 1 : 0;

      /*
       * Smooth energy transition.
       */

      const energy =
        THREE.MathUtils.lerp(
          active ? 1 : 0,
          active ? 1 : 0,
          0.1
        );

      /*
       * The actual movement multiplier.
       */

      const movement =
        active ? 1.8 : 0.72;

      /* -----------------------------------------
         PARTICLE MOTION
      ----------------------------------------- */

      const positionAttribute =
        particleGeometry.attributes
          .position;

      for (
        let i = 0;
        i < PARTICLE_COUNT;
        i++
      ) {
        const i3 = i * 3;

        const bx =
          basePositions[i3];

        const by =
          basePositions[i3 + 1];

        const bz =
          basePositions[i3 + 2];

        const r =
          randoms[i];

        /*
         * Flow field.
         */

        const wave1 =
          Math.sin(
            time * 1.4 +
              by * 3.5 +
              r * 8
          );

        const wave2 =
          Math.cos(
            time * 1.1 +
              bx * 4.2 +
              r * 6
          );

        const wave3 =
          Math.sin(
            time * 1.7 +
              bz * 5.0 +
              r * 10
          );

        /*
         * Rotational flow.
         */

        const angle =
          time *
            (0.18 +
              r * 0.15) +
          by *
            0.5;

        const cos =
          Math.cos(angle);

        const sin =
          Math.sin(angle);

        let x =
          bx * cos -
          bz * sin;

        let z =
          bx * sin +
          bz * cos;

        let y = by;

        /*
         * Organic turbulence.
         */

        x +=
          wave1 *
          0.045 *
          movement;

        y +=
          wave2 *
          0.045 *
          movement;

        z +=
          wave3 *
          0.045 *
          movement;

        /*
         * Active state causes the cloud to
         * breathe outward.
         */

        const expansion =
          active
            ? 1.0 +
              0.42 *
                (0.35 +
                  r * 0.65)
            : 0.78 +
              r * 0.08;

        x *= expansion;
        y *= expansion;
        z *= expansion;

        /*
         * Additional radial pulse.
         */

        if (active) {
          const distance =
            Math.sqrt(
              x * x +
                y * y +
                z * z
            );

          const pulse =
            Math.sin(
              time * 4 -
                distance * 4
            ) *
            0.045;

          x +=
            x *
            pulse;

          y +=
            y *
            pulse;

          z +=
            z *
            pulse;
        }

        positionAttribute.array[
          i3
        ] = x;

        positionAttribute.array[
          i3 + 1
        ] = y;

        positionAttribute.array[
          i3 + 2
        ] = z;
      }

      positionAttribute.needsUpdate =
        true;

      /* -----------------------------------------
         PARTICLE SIZE
      ----------------------------------------- */

      particleMaterial.size =
        active ? 0.075 : 0.045;

      particleMaterial.opacity =
        active ? 0.98 : 0.72;

      /* -----------------------------------------
         NETWORK
      ----------------------------------------- */

      network.rotation.y =
        time * 0.08;

      network.rotation.x =
        Math.sin(time * 0.25) *
        0.08;

      lineMaterial.opacity =
        active ? 0.34 : 0.11;

      /* -----------------------------------------
         OUTER STREAKS
      ----------------------------------------- */

      for (
        let i = 0;
        i < STREAK_COUNT;
        i++
      ) {
        const data =
          streakData[i];

        const pulse =
          Math.sin(
            time * 2.4 +
              data.phase
          );

        const activeBoost =
          active
            ? 0.8 +
              pulse * 0.35
            : 0.35;

        const startRadius =
          data.startRadius +
          activeBoost *
            Math.max(
              0,
              pulse
            ) *
            0.45;

        const start =
          data.direction
            .clone()
            .multiplyScalar(
              startRadius
            );

        const end =
          data.direction
            .clone()
            .multiplyScalar(
              startRadius +
                data.length *
                  (active
                    ? 1.7
                    : 0.55)
            );

        const j = i * 6;

        streakPositions[j] =
          start.x;

        streakPositions[j + 1] =
          start.y;

        streakPositions[j + 2] =
          start.z;

        streakPositions[j + 3] =
          end.x;

        streakPositions[j + 4] =
          end.y;

        streakPositions[j + 5] =
          end.z;
      }

      streakGeometry.attributes.position.needsUpdate =
        true;

      streakMaterial.opacity =
        active ? 0.42 : 0.08;

      /* -----------------------------------------
         CENTRAL GLOW
      ----------------------------------------- */

      const pulse =
        1 +
        Math.sin(time * 2.8) *
          0.08;

      const activeScale =
        active ? 1.65 : 1;

      coreSprite.scale.set(
        2.15 *
          pulse *
          activeScale,
        2.15 *
          pulse *
          activeScale,
        1
      );

      whiteCore.scale.set(
        0.62 *
          (active ? 1.35 : 1) *
          pulse,
        0.62 *
          (active ? 1.35 : 1) *
          pulse,
        1
      );

      coreSprite.material.opacity =
        active ? 1 : 0.72;

      whiteCore.material.opacity =
        active ? 1 : 0.75;

      /* -----------------------------------------
         GLOBAL ROTATION
      ----------------------------------------- */

      particles.rotation.y =
        time * 0.08;

      particles.rotation.x =
        Math.sin(time * 0.18) *
        0.08;

      innerParticles.rotation.y =
        -time * 0.12;

      /* -----------------------------------------
         CAMERA BREATHING
      ----------------------------------------- */

      camera.position.x =
        Math.sin(time * 0.18) *
        0.05;

      camera.position.y =
        Math.cos(time * 0.16) *
        0.035;

      camera.lookAt(
        0,
        0,
        0
      );

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

      particleGeometry.dispose();
      particleMaterial.dispose();

      innerGeometry.dispose();
      innerMaterial.dispose();

      lineGeometry.dispose();
      lineMaterial.dispose();

      streakGeometry.dispose();
      streakMaterial.dispose();

      particleTexture.dispose();
      glowTexture.dispose();

      coreSprite.material.dispose();
      whiteCore.material.dispose();

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
  }, [active]);

  return (
    <div
      className={`core ${
        active ? "active" : ""
      }`}
    >
      <div
        ref={mountRef}
        className="core-canvas-wrap"
      />

      <div className="core-aura" />
      <div className="core-ring ring-one" />
      <div className="core-ring ring-two" />
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

  const [speaking, setSpeaking] =
    useState(false);

  const logRef =
    useRef(null);

  const recognitionRef =
    useRef(null);

  /* =========================================================
     BOOT
  ========================================================= */

  useEffect(() => {
    if (
      visibleBootLines <
      BOOT_LINES.length
    ) {
      const timer =
        setTimeout(
          () =>
            setVisibleBootLines(
              (n) => n + 1
            ),
          330
        );

      return () =>
        clearTimeout(timer);
    }

    const timer =
      setTimeout(
        () => setBooted(true),
        650
      );

    return () =>
      clearTimeout(timer);
  }, [visibleBootLines]);

  /* =========================================================
     SCROLL
  ========================================================= */

  useEffect(() => {
    logRef.current?.scrollTo({
      top:
        logRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  /* =========================================================
     SPEECH RECOGNITION
  ========================================================= */

  useEffect(() => {
    const SpeechRecognition =
      typeof window !== "undefined" &&
      (window.SpeechRecognition ||
        window.webkitSpeechRecognition);

    if (!SpeechRecognition)
      return;

    const recognition =
      new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (e) => {
      const transcript =
        e.results[0][0]
          .transcript;

      setInput(transcript);
    };

    recognition.onerror = (e) => {
      setListening(false);

      if (
        e.error === "not-allowed" ||
        e.error ===
          "service-not-allowed"
      ) {
        alert(
          "Microphone access was blocked. Allow microphone access for this page."
        );
      } else if (
        e.error !== "no-speech"
      ) {
        alert(
          "Voice input error: " +
            e.error
        );
      }
    };

    recognition.onend = () =>
      setListening(false);

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
        "Voice input isn't supported in this browser. Try Chrome or Edge."
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

  /* =========================================================
     VOICE OUTPUT
  ========================================================= */

  async function speak(text) {
    if (!voiceOn) return;

    try {
      setSpeaking(true);

      const res =
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

      if (!res.ok) {
        const data =
          await res
            .json()
            .catch(() => null);

        setSpeaking(false);

        alert(
          "Voice playback failed: " +
            (data?.error ||
              `HTTP ${res.status}`)
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

      audio.onended = () => {
        setSpeaking(false);
        URL.revokeObjectURL(
          audioUrl
        );
      };

      audio.onerror = () => {
        setSpeaking(false);
        URL.revokeObjectURL(
          audioUrl
        );
      };

      await audio.play();
    } catch (err) {
      setSpeaking(false);

      alert(
        "Voice playback failed: " +
          err.message
      );
    }
  }

  /* =========================================================
     SEND MESSAGE
  ========================================================= */

  async function sendMessage() {
    const text =
      input.trim();

    if (
      !text ||
      loading
    )
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
        setMessages(
          (m) => [
            ...m,
            {
              role: "assistant",
              content:
                data.error ||
                "Something went wrong.",
              error: true,
            },
          ]
        );
      } else {
        setMessages(
          (m) => [
            ...m,
            {
              role: "assistant",
              content:
                data.reply,
            },
          ]
        );

        speak(data.reply);
      }
    } catch {
      setMessages(
        (m) => [
          ...m,
          {
            role: "assistant",
            content:
              "I couldn't reach the server. Check your connection.",
            error: true,
          },
        ]
      );
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     CORE ACTIVE STATE
  ========================================================= */

  const coreActive =
    loading ||
    listening ||
    speaking;

  /* =========================================================
     BOOT SCREEN
  ========================================================= */

  if (!booted) {
    return (
      <div className="boot-screen">
        <div className="boot-core">
          <div className="boot-core-dot" />
        </div>

        <div className="boot-lines">
          {BOOT_LINES.slice(
            0,
            visibleBootLines
          ).map(
            (line, i) => (
              <div
                key={i}
                className={`boot-line ${
                  line.dim
                    ? "dim"
                    : ""
                }`}
              >
                <span className="boot-prefix">
                  {line.dim
                    ? ">"
                    : "◆"}
                </span>

                {line.text}
              </div>
            )
          )}
        </div>
      </div>
    );
  }

  /* =========================================================
     MAIN UI
  ========================================================= */

  return (
    <div className="app">

      <div className="ambient-grid" />

      <header className="header">

        <div className="brand">

          <div className="brand-mark">
            J
          </div>

          <div>
            <div className="wordmark">
              J.A.R.V.I.S.
            </div>

            <div className="status-line">
              <span className="status-dot" />

              <span>
                {loading
                  ? "PROCESSING"
                  : listening
                  ? "LISTENING"
                  : speaking
                  ? "SPEAKING"
                  : "ONLINE"}
              </span>
            </div>
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
              (v) => !v
            )
          }
        >
          <span className="voice-icon">
            ◉
          </span>

          VOICE{" "}
          {voiceOn
            ? "ON"
            : "OFF"}
        </button>

      </header>

      {/* =====================================================
          CORE
      ===================================================== */}

      <main className="main-stage">

        <div className="core-wrapper">

          <Core
            active={
              coreActive
            }
          />

          <div className="core-label">

            <span className="core-label-line" />

            <span>
              {loading
                ? "PROCESSING"
                : listening
                ? "LISTENING"
                : speaking
                ? "RESPONDING"
                : "J.A.R.V.I.S. CORE"}
            </span>

            <span className="core-label-line" />

          </div>

        </div>

      </main>

      {/* =====================================================
          CHAT LOG
      ===================================================== */}

      <div
        className="log"
        ref={logRef}
      >
        {messages.map(
          (m, i) => (
            <div
              key={i}
              className={`msg-row ${
                m.role
              }`}
            >
              <div className="msg-label">
                {m.role ===
                "user"
                  ? "YOU"
                  : "JARVIS"}
              </div>

              <div
                className={`bubble ${
                  m.error
                    ? "error"
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
              <span />

            </div>

          </div>
        )}

      </div>

      {/* =====================================================
          INPUT
      ===================================================== */}

      <div className="input-container">

        <div className="input-bar">

          <button
            className={`icon-btn mic ${
              listening
                ? "listening"
                : ""
            }`}
            onClick={
              toggleMic
            }
            title="Voice input"
          >
            <span>
              ◉
            </span>
          </button>

          <div className="input-wrapper">

            <span className="input-prefix">
              ›
            </span>

            <input
              value={input}
              onChange={(e) =>
                setInput(
                  e.target.value
                )
              }
              onKeyDown={(e) => {
                if (
                  e.key ===
                  "Enter"
                ) {
                  sendMessage();
                }
              }}
              placeholder="Speak to J.A.R.V.I.S..."
              disabled={loading}
            />

          </div>

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
            →
          </button>

        </div>

        <div className="input-hint">
          <span>
            J.A.R.V.I.S. NEURAL INTERFACE
          </span>

          <span>
            ENTER TO TRANSMIT
          </span>
        </div>

      </div>

    </div>
  );
}
