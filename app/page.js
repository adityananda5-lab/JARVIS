"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const BOOT_LINES = [
  { text: "INITIALIZING J.A.R.V.I.S. CORE...", dim: false },
  { text: "LOADING NEURAL LANGUAGE SUBSYSTEM", dim: true },
  { text: "CALIBRATING VOICE INTERFACE", dim: true },
  { text: "SYNCHRONIZING COGNITIVE MATRIX", dim: true },
  { text: "ALL SYSTEMS NOMINAL", dim: false },
];

function Core({ thinking, audioFeaturesRef }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x020304, 1);
    mount.appendChild(renderer.domElement);

    const uniforms = {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },

      uAudio: { value: 0 },
      uBass: { value: 0 },
      uMid: { value: 0 },
      uHigh: { value: 0 },

      uThinking: { value: 0 },
      uSpeaking: { value: 0 },
    };

    const vertexShader = `
      varying vec2 vUv;

      void main() {
        vUv = uv;
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }
    `;

    const fragmentShader = `
      precision highp float;

      varying vec2 vUv;

      uniform float uTime;
      uniform vec2 uResolution;

      uniform float uAudio;
      uniform float uBass;
      uniform float uMid;
      uniform float uHigh;

      uniform float uThinking;
      uniform float uSpeaking;

      #define PI 3.14159265359
      #define MAX_STEPS 72

      float hash21(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }

      float hash31(vec3 p) {
        p = fract(p * 0.1031);
        p += dot(p, p.yzx + 33.33);
        return fract((p.x + p.y) * p.z);
      }

      float noise3D(vec3 p) {
        vec3 i = floor(p);
        vec3 f = fract(p);

        f = f * f * (3.0 - 2.0 * f);

        float n000 = hash31(i + vec3(0,0,0));
        float n100 = hash31(i + vec3(1,0,0));
        float n010 = hash31(i + vec3(0,1,0));
        float n110 = hash31(i + vec3(1,1,0));

        float n001 = hash31(i + vec3(0,0,1));
        float n101 = hash31(i + vec3(1,0,1));
        float n011 = hash31(i + vec3(0,1,1));
        float n111 = hash31(i + vec3(1,1,1));

        float x00 = mix(n000, n100, f.x);
        float x10 = mix(n010, n110, f.x);
        float x01 = mix(n001, n101, f.x);
        float x11 = mix(n011, n111, f.x);

        float y0 = mix(x00, x10, f.y);
        float y1 = mix(x01, x11, f.y);

        return mix(y0, y1, f.z);
      }

      float fbm(vec3 p) {
        float value = 0.0;
        float amplitude = 0.5;

        for (int i = 0; i < 5; i++) {
          value += noise3D(p) * amplitude;
          p = p * 2.02 + vec3(17.1, 9.2, 13.7);
          amplitude *= 0.5;
        }

        return value;
      }

      float ridgedNoise(vec3 p) {
        float n = noise3D(p);
        n = 1.0 - abs(n * 2.0 - 1.0);
        return n * n;
      }

      float sphereSDF(vec3 p, float radius) {
        return length(p) - radius;
      }

      float plasmaDensity(vec3 p, float t) {
        float audioBoost =
          uAudio * 0.65 +
          uBass * 0.75 +
          uMid * 0.35;

        float thinkingBoost = uThinking * 0.35;

        vec3 q = p;

        /*
          The distortion intentionally isn't symmetrical.
          This prevents the core from looking like a perfect
          sphere or a cheap particle GIF.
        */

        q.x += sin(q.y * 3.2 + t * 0.7) * 0.10;
        q.y += sin(q.z * 4.0 - t * 0.9) * 0.08;
        q.z += sin(q.x * 3.5 + t * 0.55) * 0.12;

        float slowField = fbm(
          q * 1.75 +
          vec3(
            t * 0.045,
            -t * 0.025,
            t * 0.035
          )
        );

        float detailField = fbm(
          q * 4.8 -
          vec3(
            t * 0.12,
            t * 0.08,
            -t * 0.10
          )
        );

        float filament = ridgedNoise(
          q * 5.8 +
          vec3(
            -t * 0.16,
            t * 0.12,
            t * 0.08
          )
        );

        float fineFilament = ridgedNoise(
          q * 12.0 +
          vec3(
            t * 0.22,
            -t * 0.19,
            t * 0.15
          )
        );

        float radial = length(q);

        float shell =
          smoothstep(
            1.85,
            0.20,
            radial
          );

        float turbulence =
          slowField * 0.65 +
          detailField * 0.35;

        float filaments =
          filament * 0.55 +
          fineFilament * 0.20;

        float density =
          turbulence * 0.72 +
          filaments * 0.48;

        density *= shell;

        density +=
          audioBoost *
          filaments *
          0.75;

        density +=
          thinkingBoost *
          detailField *
          0.55;

        /*
          Creates the bright active interior while preserving
          irregular gaseous edges.
        */
        density *=
          smoothstep(
            2.0,
            0.25,
            radial
          );

        return clamp(density, 0.0, 1.0);
      }

      vec2 raySphere(
        vec3 ro,
        vec3 rd,
        float radius
      ) {
        float b = dot(ro, rd);
        float c = dot(ro, ro) - radius * radius;

        float h = b * b - c;

        if (h < 0.0) {
          return vec2(-1.0);
        }

        h = sqrt(h);

        return vec2(
          -b - h,
          -b + h
        );
      }

      void main() {
        vec2 uv =
          (gl_FragCoord.xy * 2.0 - uResolution.xy) /
          min(uResolution.x, uResolution.y);

        float t = uTime;

        /*
          Slight camera breathing.
          Audio makes the field feel physically reactive.
        */
        float breathing =
          1.0 +
          uAudio * 0.045 +
          uBass * 0.035;

        vec3 ro = vec3(
          0.0,
          0.0,
          4.2
        );

        vec3 rd = normalize(
          vec3(
            uv.x * 1.04,
            uv.y * 1.04,
            -3.0
          )
        );

        vec2 hit =
          raySphere(
            ro,
            rd,
            1.72 * breathing
          );

        vec3 finalColor = vec3(0.0);

        if (hit.y > 0.0) {

          float start =
            max(hit.x, 0.0);

          float end =
            hit.y;

          float distanceThroughVolume =
            end - start;

          float stepSize =
            distanceThroughVolume /
            float(MAX_STEPS);

          float accumulated = 0.0;

          vec3 accumulatedColor =
            vec3(0.0);

          for (int i = 0; i < MAX_STEPS; i++) {

            float fi = float(i);

            float travel =
              start +
              stepSize *
              (fi + 0.5);

            vec3 p =
              ro +
              rd * travel;

            /*
              Small directional drift creates
              a flowing plasma effect.
            */
            p += vec3(
              sin(t * 0.35) * 0.04,
              cos(t * 0.28) * 0.03,
              sin(t * 0.22) * 0.05
            );

            float density =
              plasmaDensity(
                p,
                t
              );

            /*
              Audio changes the brightness and density
              instead of merely scaling the entire object.
            */
            density *=
              0.72 +
              uAudio * 0.85 +
              uBass * 0.65;

            density =
              smoothstep(
                0.17,
                0.82,
                density
              );

            float edgeFade =
              1.0 -
              smoothstep(
                1.15,
                1.72,
                length(p)
              );

            density *=
              edgeFade;

            /*
              Warm JARVIS plasma palette.
            */
            vec3 ember =
              vec3(
                1.0,
                0.075,
                0.005
              );

            vec3 orange =
              vec3(
                1.0,
                0.31,
                0.025
              );

            vec3 amber =
              vec3(
                1.0,
                0.68,
                0.12
              );

            vec3 whiteHot =
              vec3(
                1.0,
                0.96,
                0.78
              );

            float heat =
              clamp(
                density *
                (1.15 + uHigh * 0.35),
                0.0,
                1.0
              );

            vec3 plasmaColor =
              mix(
                ember,
                orange,
                smoothstep(
                  0.05,
                  0.32,
                  heat
                )
              );

            plasmaColor =
              mix(
                plasmaColor,
                amber,
                smoothstep(
                  0.30,
                  0.68,
                  heat
                )
              );

            plasmaColor =
              mix(
                plasmaColor,
                whiteHot,
                smoothstep(
                  0.70,
                  1.0,
                  heat
                )
              );

            float alpha =
              density *
              stepSize *
              2.15;

            accumulatedColor +=
              plasmaColor *
              alpha *
              (1.0 - accumulated);

            accumulated +=
              alpha *
              0.85;

            if (accumulated > 0.96) {
              break;
            }
          }

          finalColor =
            accumulatedColor;
        }

        /*
          Bright internal energy nucleus.
          It is intentionally small rather than
          looking like a giant sun.
        */
        float nucleus =
          exp(
            -length(uv) *
            (7.0 - uAudio * 2.0)
          );

        nucleus *=
          0.34 +
          uAudio * 0.55 +
          uBass * 0.30;

        finalColor +=
          vec3(
            1.0,
            0.58,
            0.16
          ) *
          nucleus;

        /*
          Hot micro-filament sparks around the field.
        */
        float sparkNoise =
          fbm(
            vec3(
              uv * 8.0,
              t * 0.4
            )
          );

        float sparks =
          smoothstep(
            0.72,
            0.98,
            sparkNoise
          );

        sparks *=
          uAudio *
          0.20;

        finalColor +=
          vec3(
            1.0,
            0.32,
            0.06
          ) *
          sparks;

        /*
          Very subtle atmospheric background.
        */
        float backgroundGlow =
          exp(
            -length(uv) *
            1.55
          );

        finalColor +=
          vec3(
            0.035,
            0.006,
            0.001
          ) *
          backgroundGlow;

        /*
          Vignette.
        */
        float vignette =
          1.0 -
          smoothstep(
            0.55,
            1.75,
            length(uv)
          );

        finalColor *=
          0.72 +
          vignette * 0.28;

        /*
          Filmic-ish contrast.
        */
        finalColor =
          finalColor /
          (
            finalColor +
            vec3(0.72)
          );

        finalColor =
          pow(
            finalColor,
            vec3(0.82)
          );

        gl_FragColor =
          vec4(
            finalColor,
            1.0
          );
      }
    `;

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      depthWrite: false,
      depthTest: false,
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const plane = new THREE.Mesh(
      geometry,
      material
    );

    scene.add(plane);

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

      uniforms.uResolution.value.set(
        width *
          renderer.getPixelRatio(),
        height *
          renderer.getPixelRatio()
      );
    }

    resize();

    window.addEventListener(
      "resize",
      resize
    );

    let animationFrame;

    let smoothAudio = 0;
    let smoothBass = 0;
    let smoothMid = 0;
    let smoothHigh = 0;
    let smoothSpeaking = 0;

    const clock =
      new THREE.Clock();

    function animate() {
      animationFrame =
        requestAnimationFrame(
          animate
        );

      const elapsed =
        clock.getElapsedTime();

      const features =
        audioFeaturesRef.current;

      const targetAudio =
        features.audio || 0;

      const targetBass =
        features.bass || 0;

      const targetMid =
        features.mid || 0;

      const targetHigh =
        features.high || 0;

      const targetSpeaking =
        features.speaking ? 1 : 0;

      /*
        Different smoothing speeds prevent the
        visual from simply jumping up and down.
      */
      smoothAudio +=
        (targetAudio - smoothAudio) *
        0.12;

      smoothBass +=
        (targetBass - smoothBass) *
        0.16;

      smoothMid +=
        (targetMid - smoothMid) *
        0.13;

      smoothHigh +=
        (targetHigh - smoothHigh) *
        0.18;

      smoothSpeaking +=
        (targetSpeaking - smoothSpeaking) *
        0.10;

      uniforms.uTime.value =
        elapsed;

      uniforms.uAudio.value =
        smoothAudio;

      uniforms.uBass.value =
        smoothBass;

      uniforms.uMid.value =
        smoothMid;

      uniforms.uHigh.value =
        smoothHigh;

      uniforms.uThinking.value =
        thinking ? 1 : 0;

      uniforms.uSpeaking.value =
        smoothSpeaking;

      renderer.render(
        scene,
        camera
      );
    }

    animate();

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
  }, [thinking, audioFeaturesRef]);

  return (
    <div
      ref={mountRef}
      className="core-canvas-wrap"
    />
  );
}

export default function Home() {
  const [
    booted,
    setBooted
  ] = useState(false);

  const [
    visibleBootLines,
    setVisibleBootLines
  ] = useState(0);

  const [
    messages,
    setMessages
  ] = useState([
    {
      role: "assistant",
      content:
        "Good to see you. Systems are online — how can I help?",
    },
  ]);

  const [
    input,
    setInput
  ] = useState("");

  const [
    loading,
    setLoading
  ] = useState(false);

  const [
    voiceOn,
    setVoiceOn
  ] = useState(false);

  const [
    listening,
    setListening
  ] = useState(false);

  const logRef =
    useRef(null);

  const recognitionRef =
    useRef(null);

  const audioContextRef =
    useRef(null);

  const analyserRef =
    useRef(null);

  const audioSourceRef =
    useRef(null);

  const audioFeaturesRef =
    useRef({
      audio: 0,
      bass: 0,
      mid: 0,
      high: 0,
      speaking: false,
    });

  const analyserDataRef =
    useRef(null);

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
          380
        );

      return () =>
        clearTimeout(timer);
    }

    const timer =
      setTimeout(
        () =>
          setBooted(true),
        650
      );

    return () =>
      clearTimeout(timer);
  }, [visibleBootLines]);

  useEffect(() => {
    logRef.current?.scrollTo({
      top:
        logRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  /*
    Speech recognition.
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
          "Microphone access was blocked. Allow microphone access for this page."
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

  /*
    Create the Web Audio graph.
    This is what allows the Three.js field
    to actually respond to JARVIS's voice.
  */
  async function ensureAudioGraph() {
    if (
      typeof window ===
      "undefined"
    ) {
      return null;
    }

    if (
      audioContextRef.current
    ) {
      if (
        audioContextRef.current
          .state === "suspended"
      ) {
        await audioContextRef.current.resume();
      }

      return {
        context:
          audioContextRef.current,
        analyser:
          analyserRef.current,
      };
    }

    const AudioContext =
      window.AudioContext ||
      window.webkitAudioContext;

    if (!AudioContext) {
      return null;
    }

    const context =
      new AudioContext();

    const analyser =
      context.createAnalyser();

    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant =
      0.78;

    analyser.connect(
      context.destination
    );

    audioContextRef.current =
      context;

    analyserRef.current =
      analyser;

    analyserDataRef.current =
      new Uint8Array(
        analyser.frequencyBinCount
      );

    if (
      context.state ===
      "suspended"
    ) {
      await context.resume();
    }

    return {
      context,
      analyser,
    };
  }

  /*
    Analyze the actual voice waveform.
  */
  function updateAudioFeatures() {
    const analyser =
      analyserRef.current;

    const data =
      analyserDataRef.current;

    if (!analyser || !data) {
      return;
    }

    analyser.getByteFrequencyData(
      data
    );

    let total = 0;
    let bass = 0;
    let mid = 0;
    let high = 0;

    const length =
      data.length;

    for (
      let i = 0;
      i < length;
      i++
    ) {
      const value =
        data[i] / 255;

      total += value;

      /*
        Frequency buckets:
        low = voice/body/bass
        mid = speech presence
        high = consonants/detail
      */
      if (i < length * 0.18) {
        bass += value;
      } else if (
        i < length * 0.55
      ) {
        mid += value;
      } else {
        high += value;
      }
    }

    bass /=
      length * 0.18;

    mid /=
      length * 0.37;

    high /=
      length * 0.45;

    const overall =
      total / length;

    audioFeaturesRef.current.audio =
      Math.min(
        1,
        overall * 2.8
      );

    audioFeaturesRef.current.bass =
      Math.min(
        1,
        bass * 2.5
      );

    audioFeaturesRef.current.mid =
      Math.min(
        1,
        mid * 2.4
      );

    audioFeaturesRef.current.high =
      Math.min(
        1,
        high * 2.7
      );
  }

  /*
    Continuously read the analyser while
    JARVIS is speaking.
  */
  useEffect(() => {
    let frame;

    function monitorAudio() {
      updateAudioFeatures();

      frame =
        requestAnimationFrame(
          monitorAudio
        );
    }

    monitorAudio();

    return () =>
      cancelAnimationFrame(
        frame
      );
  }, []);

  async function speak(text) {
    if (!voiceOn) {
      return;
    }

    try {
      const audioGraph =
        await ensureAudioGraph();

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

        throw new Error(
          data?.error ||
            `HTTP ${response.status}`
        );
      }

      const audioBlob =
        await response.blob();

      const audioUrl =
        URL.createObjectURL(
          audioBlob
        );

      const audio =
        new Audio(audioUrl);

      audio.preload = "auto";

      if (audioGraph) {
        const source =
          audioGraph.context.createMediaElementSource(
            audio
          );

        /*
          Disconnect the previous voice source.
        */
        if (
          audioSourceRef.current
        ) {
          try {
            audioSourceRef.current.disconnect();
          } catch {}
        }

        source.connect(
          audioGraph.analyser
        );

        audioSourceRef.current =
          source;
      }

      audioFeaturesRef.current.speaking =
        true;

      audio.onended = () => {
        audioFeaturesRef.current.speaking =
          false;

        audioFeaturesRef.current.audio =
          0;

        audioFeaturesRef.current.bass =
          0;

        audioFeaturesRef.current.mid =
          0;

        audioFeaturesRef.current.high =
          0;

        if (
          audioSourceRef.current
        ) {
          try {
            audioSourceRef.current.disconnect();
          } catch {}

          audioSourceRef.current =
            null;
        }

        URL.revokeObjectURL(
          audioUrl
        );
      };

      audio.onerror = () => {
        audioFeaturesRef.current.speaking =
          false;

        URL.revokeObjectURL(
          audioUrl
        );
      };

      await audio.play();
    } catch (error) {
      audioFeaturesRef.current.speaking =
        false;

      alert(
        "Voice playback failed: " +
          error.message
      );
    }
  }

  function toggleMic() {
    if (
      !recognitionRef.current
    ) {
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

  async function sendMessage() {
    const text =
      input.trim();

    if (
      !text ||
      loading
    ) {
      return;
    }

    /*
      Start the AudioContext immediately from
      the user's interaction before the async
      network request.
    */
    if (voiceOn) {
      try {
        await ensureAudioGraph();
      } catch {}
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
          .json();

      if (!response.ok) {
        setMessages(
          (current) => [
            ...current,
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
          (current) => [
            ...current,
            {
              role: "assistant",
              content:
                data.reply,
            },
          ]
        );

        /*
          This is where the actual JARVIS
          response becomes the audio-reactive
          visual event.
        */
        if (voiceOn) {
          speak(data.reply);
        }
      }
    } catch {
      setMessages(
        (current) => [
          ...current,
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

  if (!booted) {
    return (
      <div className="boot-screen">
        <div className="boot-core">
          <div className="boot-orb" />
        </div>

        <div className="boot-lines">
          {BOOT_LINES.slice(
            0,
            visibleBootLines
          ).map(
            (line, index) => (
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
            )
          )}
        </div>
      </div>
    );
  }

  return (
    <main className="app">

      <div className="ambient-grid" />

      <div className="top-hud">
        <div className="brand">
          <div className="brand-name">
            J.A.R.V.I.S.
          </div>

          <div className="brand-subtitle">
            JUST A RATHER VERY
            INTELLIGENT SYSTEM
          </div>
        </div>

        <div className="system-status">
          <span className="status-indicator" />

          <span>
            {loading
              ? "PROCESSING"
              : audioFeaturesRef.current
                  .speaking
              ? "SPEAKING"
              : "ONLINE"}
          </span>
        </div>
      </div>

      <div className="core-stage">
        <Core
          thinking={loading}
          audioFeaturesRef={
            audioFeaturesRef
          }
        />
      </div>

      <div className="side-hud left-hud">
        <div className="hud-line" />
        <div className="hud-label">
          COGNITIVE CORE
        </div>
        <div className="hud-value">
          ACTIVE
        </div>

        <div className="hud-line" />

        <div className="hud-label">
          NEURAL STATE
        </div>
        <div className="hud-value">
          SYNCHRONIZED
        </div>
      </div>

      <div className="side-hud right-hud">
        <div className="hud-label">
          AUDIO MATRIX
        </div>

        <div className="audio-meter">
          <span
            style={{
              transform: `scaleX(${
                0.05 +
                audioFeaturesRef.current.audio *
                  0.95
              })`,
            }}
          />
        </div>

        <div className="hud-label">
          RESPONSE ENGINE
        </div>

        <div className="hud-value">
          {loading
            ? "ANALYZING"
            : "STANDBY"}
        </div>
      </div>

      <section
        className="conversation"
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
              <div className="message-meta">
                {message.role ===
                "user"
                  ? "YOU"
                  : "JARVIS"}
              </div>

              <div
                className={`message-content ${
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
            <div className="message-meta">
              JARVIS
            </div>

            <div className="thinking-indicator">
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>
        )}
      </section>

      <div className="bottom-hud">

        <button
          className={`hud-button mic-button ${
            listening
              ? "active"
              : ""
          }`}
          onClick={
            toggleMic
          }
          title="Voice input"
        >
          <span className="mic-symbol">
            ◉
          </span>

          <span>
            {listening
              ? "LISTENING"
              : "VOICE INPUT"}
          </span>
        </button>

        <div className="input-shell">
          <div className="input-prefix">
            &gt;
          </div>

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
            className="send-button"
            onClick={
              sendMessage
            }
            disabled={
              loading ||
              !input.trim()
            }
          >
            →
          </button>
        </div>

        <button
          className={`hud-button voice-button ${
            voiceOn
              ? "active"
              : ""
          }`}
          onClick={() =>
            setVoiceOn(
              (current) =>
                !current
            )
          }
        >
          VOICE{" "}
          {voiceOn
            ? "ON"
            : "OFF"}
        </button>

      </div>

      <div className="corner corner-tl" />
      <div className="corner corner-tr" />
      <div className="corner corner-bl" />
      <div className="corner corner-br" />

    </main>
  );
}
