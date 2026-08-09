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

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    mount.appendChild(renderer.domElement);

    const spriteCanvas = document.createElement("canvas");
    spriteCanvas.width = 64;
    spriteCanvas.height = 64;
    const sctx = spriteCanvas.getContext("2d");
    const grad = sctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(0.4, "rgba(200,230,255,0.8)");
    grad.addColorStop(1, "rgba(160,210,255,0)");
    sctx.fillStyle = grad;
    sctx.fillRect(0, 0, 64, 64);
    const spriteTexture = new THREE.CanvasTexture(spriteCanvas);

    const PARTICLE_COUNT = 2500;
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 2.2 * Math.pow(Math.random(), 1.6);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi);
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      size: 0.14,
      map: spriteTexture,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      color: new THREE.Color(0xbfe0ff),
      sizeAttenuation: true,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    const coreMaterial = new THREE.SpriteMaterial({
      map: spriteTexture,
      color: 0xffffff,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const coreSprite = new THREE.Sprite(coreMaterial);
    coreSprite.scale.set(2.2, 2.2, 1);
    scene.add(coreSprite);

    function resize() {
      const size = Math.min(mount.clientWidth, mount.clientHeight) || 300;
      renderer.setSize(size, size);
      camera.aspect = 1;
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener("resize", resize);

    let rafId;
    function animate() {
      points.rotation.y += 0.0025;
      points.rotation.x += 0.0008;
      renderer.render(scene, camera);
      rafId = requestAnimationFrame(animate);
    }
    animate();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      geometry.dispose();
      material.dispose();
      spriteTexture.dispose();
      coreMaterial.dispose();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className={`core${thinking ? " thinking" : ""}`}>
      <div ref={mountRef} className="core-canvas-wrap" />
    </div>
  );
}

export default function Home() {
  const [booted, setBooted] = useState(false);
  const [visibleBootLines, setVisibleBootLines] = useState(0);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Good to see you. Systems are online — how can I help?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [voiceOn, setVoiceOn] = useState(false);
  const [listening, setListening] = useState(false);
  const logRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (visibleBootLines < BOOT_LINES.length) {
      const t = setTimeout(() => setVisibleBootLines((n) => n + 1), 380);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setBooted(true), 500);
    return () => clearTimeout(t);
  }, [visibleBootLines]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const SpeechRecognition = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
    };
    recognition.onerror = (e) => {
      setListening(false);
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        alert("Microphone access was blocked. Check your browser's site settings and allow the microphone for this page.");
      } else if (e.error === "no-speech") {
        // silently ignore — user just didn't say anything
      } else {
        alert("Voice input hit an error: " + e.error);
      }
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
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
      } catch (err) {
        setListening(false);
      }
    }
  }

  async function speak(text) {
    if (!voiceOn) return;
    try {
      const res = await fetch("/api/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alert("Voice playback failed: " + (data?.error || `HTTP ${res.status}`));
        return;
      }
      const audioBlob = await res.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
    } catch (err) {
      alert("Voice playback failed: " + err.message);
    }
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessages((m) => [...m, { role: "assistant", content: data.error || "Something went wrong.", error: true }]);
      } else {
        setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
        speak(data.reply);
      }
    } catch (err) {
      setMessages((m) => [...m, { role: "assistant", content: "I couldn't reach the server. Check your connection.", error: true }]);
    } finally {
      setLoading(false);
    }
  }

  if (!booted) {
    return (
      <div className="boot-screen">
        {BOOT_LINES.slice(0, visibleBootLines).map((line, i) => (
          <div key={i} className={`boot-line${line.dim ? " dim" : ""}`}>
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
          <div className="wordmark">J.A.R.V.I.S.</div>
          <div className="status-line">
            <span className="status-dot" />
            {loading ? "PROCESSING" : "ONLINE"}
          </div>
        </div>
        <button
          className={`voice-toggle${voiceOn ? " active" : ""}`}
          onClick={() => setVoiceOn((v) => !v)}
        >
          VOICE {voiceOn ? "ON" : "OFF"}
        </button>
      </div>

      <div className="core-stage">
        <Core thinking={loading} />
      </div>

      <div className="log" ref={logRef}>
        {messages.map((m, i) => (
          <div key={i} className={`msg-row ${m.role}`}>
            <div className="msg-label">{m.role === "user" ? "YOU" : "JARVIS"}</div>
            <div className={`bubble${m.error ? " error" : ""}`}>{m.content}</div>
          </div>
        ))}
        {loading && (
          <div className="msg-row assistant">
            <div className="msg-label">JARVIS</div>
            <div className="bubble thinking-row">
              <span />
              <span />
              <span />
            </div>
          </div>
        )}
      </div>

      <div className="input-bar">
        <button className={`icon-btn mic${listening ? " listening" : ""}`} onClick={toggleMic} title="Voice input">
          🎙
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Speak, and I shall listen..."
          disabled={loading}
        />
        <button className="icon-btn send" onClick={sendMessage} disabled={loading || !input.trim()} title="Send">
          ➤
        </button>
      </div>
    </div>
  );
}
