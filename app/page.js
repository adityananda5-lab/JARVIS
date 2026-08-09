"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const BOOT_LINES = [
  { text: "INITIALIZING J.A.R.V.I.S. CORE...", dim: false },
  { text: "loading language subsystem", dim: true },
  { text: "calibrating voice interface", dim: true },
  { text: "establishing neural interface", dim: true },
  { text: "ALL SYSTEMS NOMINAL", dim: false },
];

/* =========================================================
   AUDIO-REACTIVE VOLUMETRIC CORE
========================================================= */

function Core({ audioDataRef, thinking, speaking }) {
  const mountRef = useRef(null);

  const thinkingRef = useRef(thinking);
  const speakingRef = useRef(speaking);

  useEffect(() => {
    thinkingRef.current = thinking;
  }, [thinking]);

  useEffect(() => {
    speakingRef.current = speaking;
  }, [speaking]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();

    const camera = new THREE.OrthographicCamera(
      -1,
      1,
      1,
      -1,
      0,
      1
    );

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, 2)
    );

    renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );

    renderer.setClearColor(0x000000, 0);

    mount.appendChild(renderer.domElement);

    /* =====================================================
       FULL-SCREEN VOLUMETRIC SHADER
    ===================================================== */

    const geometry = new THREE.PlaneGeometry(2, 2);

    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,

      uniforms: {
        uTime: { value: 0 },

        uResolution: {
          value: new THREE.Vector2(
            window.innerWidth,
            window.innerHeight
          ),
        },

        uAudio: { value: 0 },
        uBass: { value: 0 },
        uMid: { value: 0 },
        uHigh: { value: 0 },

        uThinking: { value: 0 },
        uSpeaking: { value: 0 },
      },

      vertexShader: `
        varying vec2 vUv;

        void main() {
          vUv = uv;

          gl_Position =
            vec4(position, 1.0);
        }
      `,

      fragmentShader: `
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

        #define MAX_STEPS 72
        #define MAX_DIST 8.0
        #define SURF_DIST 0.002

        /* =================================================
           HASH / NOISE
        ================================================= */

        float hash(vec3 p) {
          p = fract(
            p * 0.3183099 +
            vec3(0.1, 0.2, 0.3)
          );

          p *= 17.0;

          return fract(
            p.x *
            p.y *
            p.z *
            (p.x + p.y + p.z)
          );
        }

        float noise(vec3 p) {
          vec3 i = floor(p);
          vec3 f = fract(p);

          f =
            f * f *
            (3.0 - 2.0 * f);

          return mix(
            mix(
              mix(
                hash(i),
                hash(i + vec3(1,0,0)),
                f.x
              ),
              mix(
                hash(i + vec3(0,1,0)),
                hash(i + vec3(1,1,0)),
                f.x
              ),
              f.y
            ),
            mix(
              mix(
                hash(i + vec3(0,0,1)),
                hash(i + vec3(1,0,1)),
                f.x
              ),
              mix(
                hash(i + vec3(0,1,1)),
                hash(i + vec3(1,1,1)),
                f.x
              ),
              f.y
            ),
            f.z
          );
        }

        float fbm(vec3 p) {
          float value = 0.0;
          float amplitude = 0.5;

          for(int i = 0; i < 5; i++) {
            value +=
              noise(p) *
              amplitude;

            p *= 2.03;
            amplitude *= 0.5;
          }

          return value;
        }

        /* =================================================
           SPHERE
        ================================================= */

        float sphere(
          vec3 p,
          float radius
        ) {
          return length(p) - radius;
        }

        /* =================================================
           VOLUMETRIC DENSITY
        ================================================= */

        float density(vec3 p) {

          float radius =
            length(p);

          /*
             Voice causes the field to expand.
          */

          float voiceExpansion =
            uAudio *
            0.38 +
            uBass *
            0.32;

          float dynamicRadius =
            1.45 +
            voiceExpansion;

          /*
             Organic distortion.
          */

          vec3 q = p;

          q +=
            sin(
              q.zxy * 2.2 +
              uTime * 0.42
            ) *
            0.12;

          q +=
            cos(
              q.yzx * 3.1 -
              uTime * 0.31
            ) *
            0.08;

          float n =
            fbm(
              q * 2.1 +
              vec3(
                uTime * 0.12,
                -uTime * 0.08,
                uTime * 0.1
              )
            );

          /*
             Second slower layer gives
             the gas a sense of depth.
          */

          float n2 =
            fbm(
              q * 4.2 -
              vec3(
                uTime * 0.2,
                uTime * 0.13,
                -uTime * 0.16
              )
            );

          /*
             Audio turbulence.
          */

          float turbulence =
            uAudio *
            n2 *
            0.85;

          float shell =
            smoothstep(
              dynamicRadius,
              dynamicRadius - 0.8,
              radius
            );

          float inner =
            smoothstep(
              dynamicRadius * 0.72,
              0.15,
              radius
            );

          float clouds =
            smoothstep(
              0.34,
              0.82,
              n
            );

          float turbulentClouds =
            smoothstep(
              0.25,
              0.75,
              n2 +
              turbulence
            );

          /*
             Hollow-ish energetic core.
          */

          float core =
            exp(
              -radius *
              (2.1 - uBass * 0.5)
            );

          float outer =
            shell *
            clouds *
            0.8;

          float innerGas =
            inner *
            turbulentClouds *
            0.7;

          /*
             Speaking causes the gas
             to become significantly denser.
          */

          float speakingBoost =
            1.0 +
            uSpeaking *
            (
              0.55 +
              uMid * 0.8
            );

          return (
            outer +
            innerGas +
            core * 0.55
          ) * speakingBoost;
        }

        /* =================================================
           CAMERA RAY
        ================================================= */

        vec3 getRayDirection(
          vec2 uv
        ) {
          vec2 p =
            uv * 2.0 -
            1.0;

          p.x *=
            uResolution.x /
            uResolution.y;

          vec3 rd =
            normalize(
              vec3(
                p,
                -2.15
              )
            );

          return rd;
        }

        /* =================================================
           MAIN
        ================================================= */

        void main() {

          vec2 uv =
            vUv;

          vec2 centered =
            uv * 2.0 -
            1.0;

          centered.x *=
            uResolution.x /
            uResolution.y;

          /*
             Slight breathing camera.
          */

          float cameraBreath =
            sin(
              uTime * 0.45
            ) *
            0.035;

          centered *=
            1.0 -
            cameraBreath;

          vec3 ro =
            vec3(
              0.0,
              0.0,
              3.65
            );

          vec3 rd =
            getRayDirection(
              centered * 0.5 +
              0.5
            );

          /*
             Subtle camera movement
             during speech.
          */

          ro.x +=
            sin(
              uTime * 0.21
            ) *
            0.08;

          ro.y +=
            cos(
              uTime * 0.17
            ) *
            0.05;

          float t = 0.0;

          vec3 accumulated =
            vec3(0.0);

          float alpha =
            0.0;

          /*
             Audio-driven color energy.

             Base = cyan/blue.
             Bass = deeper blue.
             High = white/cyan.
          */

          vec3 blue =
            vec3(
              0.0,
              0.34,
              1.0
            );

          vec3 cyan =
            vec3(
              0.0,
              0.92,
              1.0
            );

          vec3 white =
            vec3(
              0.82,
              1.0,
              1.0
            );

          /*
             Volumetric raymarch.
          */

          for(
            int i = 0;
            i < MAX_STEPS;
            i++
          ) {

            vec3 p =
              ro +
              rd * t;

            float distanceFromCenter =
              length(p);

            if(
              distanceFromCenter >
              2.2
            ) {
              break;
            }

            float d =
              density(p);

            /*
               Depth attenuation.

               Prevents the entire
               volume becoming a flat
               white blob.
            */

            float depth =
              smoothstep(
                2.2,
                0.15,
                distanceFromCenter
              );

            d *=
              depth *
              0.13;

            /*
               Audio makes individual
               gaseous regions erupt.
            */

            d *=
              1.0 +
              uBass *
              1.6;

            d *=
              1.0 +
              uHigh *
              0.7;

            /*
               Color temperature changes
               according to frequency.
            */

            vec3 color =
              mix(
                blue,
                cyan,
                clamp(
                  uMid +
                  d * 1.8,
                  0.0,
                  1.0
                )
              );

            color =
              mix(
                color,
                white,
                clamp(
                  uHigh * 1.25,
                  0.0,
                  1.0
                )
              );

            accumulated +=
              color *
              d *
              (
                1.0 +
                uAudio *
                1.8
              );

            alpha +=
              d *
              (
                1.0 +
                uSpeaking *
                0.8
              );

            t +=
              0.055;
          }

          /*
             Core bloom.
          */

          float centerGlow =
            exp(
              -length(centered) *
              (
                3.0 -
                uBass * 1.2
              )
            );

          centerGlow *=
            0.25 +
            uAudio * 0.9;

          accumulated +=
            white *
            centerGlow *
            0.65;

          /*
             Final brightness.
          */

          accumulated *=
            1.45;

          /*
             Soft circular falloff
             so the energy dissolves
             naturally into black.
          */

          float screenDistance =
            length(centered);

          float vignette =
            1.0 -
            smoothstep(
              0.5,
              1.15,
              screenDistance
            );

          accumulated *=
            vignette;

          alpha *=
            vignette;

          alpha =
            clamp(
              alpha,
              0.0,
              0.92
            );

          /*
             Never let the black
             background become opaque.
          */

          gl_FragColor =
            vec4(
              accumulated,
              alpha
            );
        }
      `,
    });

    const mesh =
      new THREE.Mesh(
        geometry,
        material
      );

    scene.add(mesh);

    /* =====================================================
       SECONDARY PARTICLE DUST
       Very subtle. It gives the volume
       a sense of scale without making
       it look like a particle animation.
    ===================================================== */

    const dustCount = 1600;

    const dustPositions =
      new Float32Array(
        dustCount * 3
      );

    for (
      let i = 0;
      i < dustCount;
      i++
    ) {
      const i3 = i * 3;

      const theta =
        Math.random() *
        Math.PI *
        2;

      const phi =
        Math.acos(
          2 *
            Math.random() -
            1
        );

      const radius =
        1.0 +
        Math.random() *
          1.8;

      dustPositions[i3] =
        Math.sin(phi) *
        Math.cos(theta) *
        radius;

      dustPositions[i3 + 1] =
        Math.cos(phi) *
        radius;

      dustPositions[i3 + 2] =
        Math.sin(phi) *
        Math.sin(theta) *
        radius;
    }

    const dustGeometry =
      new THREE.BufferGeometry();

    dustGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(
        dustPositions,
        3
      )
    );

    const dustMaterial =
      new THREE.PointsMaterial({
        color:
          new THREE.Color(
            0x55ddff
          ),

        size:
          0.012,

        transparent:
          true,

        opacity:
          0.24,

        blending:
          THREE.AdditiveBlending,

        depthWrite:
          false,
      });

    const dust =
      new THREE.Points(
        dustGeometry,
        dustMaterial
      );

    scene.add(dust);

    /* =====================================================
       RESIZE
    ===================================================== */

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

      material.uniforms.uResolution.value
        .set(
          width,
          height
        );
    }

    resize();

    window.addEventListener(
      "resize",
      resize
    );

    /* =====================================================
       ANIMATION
    ===================================================== */

    const clock =
      new THREE.Clock();

    let raf;

    let smoothAudio = 0;
    let smoothBass = 0;
    let smoothMid = 0;
    let smoothHigh = 0;

    function animate() {
      const time =
        clock.getElapsedTime();

      const data =
        audioDataRef.current;

      const rawAudio =
        data?.level || 0;

      const rawBass =
        data?.bass || 0;

      const rawMid =
        data?.mid || 0;

      const rawHigh =
        data?.high || 0;

      /*
         Smooth the audio.

         This is critical.

         Without smoothing the visual
         would look digital/jittery.

         With it, the energy feels
         physically massive.
      */

      smoothAudio +=
        (
          rawAudio -
          smoothAudio
        ) * 0.14;

      smoothBass +=
        (
          rawBass -
          smoothBass
        ) * 0.12;

      smoothMid +=
        (
          rawMid -
          smoothMid
        ) * 0.1;

      smoothHigh +=
        (
          rawHigh -
          smoothHigh
        ) * 0.16;

      const thinkingTarget =
        thinkingRef.current
          ? 1
          : 0;

      const speakingTarget =
        speakingRef.current
          ? 1
          : 0;

      material.uniforms.uTime.value =
        time;

      material.uniforms.uAudio.value =
        smoothAudio;

      material.uniforms.uBass.value =
        smoothBass;

      material.uniforms.uMid.value =
        smoothMid;

      material.uniforms.uHigh.value =
        smoothHigh;

      material.uniforms.uThinking.value =
        thinkingTarget;

      material.uniforms.uSpeaking.value =
        speakingTarget;

      /*
         Slowly rotate the dust
         independently from the gas.
      */

      dust.rotation.y =
        time * 0.025;

      dust.rotation.x =
        Math.sin(
          time * 0.12
        ) * 0.04;

      /*
         Audio-driven dust expansion.
      */

      const dustScale =
        1 +
        smoothBass *
          0.25;

      dust.scale.set(
        dustScale,
        dustScale,
        dustScale
      );

      renderer.render(
        scene,
        camera
      );

      raf =
        requestAnimationFrame(
          animate
        );
    }

    animate();

    return () => {
      cancelAnimationFrame(
        raf
      );

      window.removeEventListener(
        "resize",
        resize
      );

      geometry.dispose();
      material.dispose();

      dustGeometry.dispose();
      dustMaterial.dispose();

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
        thinking
          ? " thinking"
          : ""
      }${
        speaking
          ? " speaking"
          : ""
      }`}
    />
  );
}

/* =========================================================
   MAIN APPLICATION
========================================================= */

export default function Home() {
  const [booted, setBooted] =
    useState(false);

  const [
    visibleBootLines,
    setVisibleBootLines,
  ] = useState(0);

  const [
    messages,
    setMessages,
  ] = useState([
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

  /* =======================================================
     AUDIO ENGINE
  ======================================================= */

  const audioEngineRef =
    useRef({
      context: null,
      analyser: null,
      source: null,
      audio: null,

      level: 0,
      bass: 0,
      mid: 0,
      high: 0,

      dataArray: null,
      frequencyArray: null,
    });

  const audioDataRef =
    useRef(
      audioEngineRef.current
    );

  /* =======================================================
     BOOT
  ======================================================= */

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
        () => setBooted(true),
        500
      );

    return () =>
      clearTimeout(timer);
  }, [visibleBootLines]);

  /* =======================================================
     AUDIO ANALYSER LOOP
  ======================================================= */

  useEffect(() => {
    let raf;

    function analyseAudio() {
      const engine =
        audioEngineRef.current;

      if (
        engine.analyser &&
        engine.frequencyArray
      ) {
        engine.analyser.getByteFrequencyData(
          engine.frequencyArray
        );

        const data =
          engine.frequencyArray;

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
             Frequency ranges are
             approximate but work
             well for human speech.
          */

          if (
            i <
            length * 0.18
          ) {
            bass += value;
          } else if (
            i <
            length * 0.55
          ) {
            mid += value;
          } else {
            high += value;
          }
        }

        engine.level =
          total / length;

        engine.bass =
          bass /
          (length * 0.18);

        engine.mid =
          mid /
          (length * 0.37);

        engine.high =
          high /
          (length * 0.45);
      } else {
        /*
           Smoothly return the
           visual to idle.
        */

        engine.level *= 0.94;
        engine.bass *= 0.94;
        engine.mid *= 0.94;
        engine.high *= 0.94;
      }

      raf =
        requestAnimationFrame(
          analyseAudio
        );
    }

    analyseAudio();

    return () =>
      cancelAnimationFrame(
        raf
      );
  }, []);

  /* =======================================================
     SPEECH RECOGNITION
  ======================================================= */

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
        e.results[0][0]
          .transcript;

      setInput(transcript);
    };

    recognition.onerror =
      (e) => {
        setListening(false);

        if (
          e.error ===
            "not-allowed" ||
          e.error ===
            "service-not-allowed"
        ) {
          alert(
            "Microphone access was blocked. Allow microphone access for this site."
          );
        }
      };

    recognition.onend = () =>
      setListening(false);

    recognitionRef.current =
      recognition;
  }, []);

  /* =======================================================
     MICROPHONE
  ======================================================= */

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

  /* =======================================================
     TTS + AUDIO ANALYSIS
  ======================================================= */

  async function speak(text) {
    if (!voiceOn)
      return;

    try {
      /*
         Fetch generated voice.
      */

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
            .catch(
              () => null
            );

        alert(
          "Voice playback failed: " +
            (
              data?.error ||
              `HTTP ${res.status}`
            )
        );

        return;
      }

      const blob =
        await res.blob();

      const url =
        URL.createObjectURL(
          blob
        );

      const engine =
        audioEngineRef.current;

      /*
         Create AudioContext only
         when speech is actually needed.
      */

      if (
        !engine.context
      ) {
        engine.context =
          new (
            window.AudioContext ||
            window.webkitAudioContext
          )();

        engine.analyser =
          engine.context.createAnalyser();

        /*
           Higher FFT gives us more
           detailed voice movement.
        */

        engine.analyser.fftSize =
          1024;

        engine.analyser.smoothingTimeConstant =
          0.78;

        engine.frequencyArray =
          new Uint8Array(
            engine.analyser.frequencyBinCount
          );
      }

      if (
        engine.context.state ===
        "suspended"
      ) {
        await engine.context.resume();
      }

      /*
         Stop previous audio.
      */

      if (engine.audio) {
        engine.audio.pause();

        engine.audio.currentTime =
          0;
      }

      const audio =
        new Audio(url);

      audio.preload = "auto";

      /*
         Connect:

         Audio
           ↓
         Analyser
           ↓
         Speakers
      */

      const source =
        engine.context.createMediaElementSource(
          audio
        );

      source.connect(
        engine.analyser
      );

      engine.analyser.connect(
        engine.context.destination
      );

      engine.audio = audio;
      engine.source = source;

      audio.onplay = () => {
        setSpeaking(true);
      };

      audio.onended = () => {
        setSpeaking(false);

        engine.level = 0;
        engine.bass = 0;
        engine.mid = 0;
        engine.high = 0;

        URL.revokeObjectURL(
          url
        );
      };

      audio.onerror = () => {
        setSpeaking(false);

        URL.revokeObjectURL(
          url
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

  /* =======================================================
     SEND
  ======================================================= */

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
              role:
                "assistant",

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
              role:
                "assistant",

              content:
                data.reply,
            },
          ]
        );

        /*
           THIS is where the
           visual/audio connection
           happens.
        */

        speak(data.reply);
      }
    } catch {
      setMessages(
        (m) => [
          ...m,

          {
            role:
              "assistant",

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

  /* =======================================================
     BOOT SCREEN
  ======================================================= */

  if (!booted) {
    return (
      <div className="boot-screen">
        {BOOT_LINES
          .slice(
            0,
            visibleBootLines
          )
          .map(
            (line, i) => (
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
            )
          )}
      </div>
    );
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="app">

      <div className="hud-grid" />

      <div className="scanlines" />

      <header className="header">

        <div className="title-block">

          <div className="wordmark">
            J.A.R.V.I.S.
          </div>

          <div className="status-line">

            <span
              className={`status-dot ${
                speaking
                  ? "speaking"
                  : ""
              }`}
            />

            {speaking
              ? "VOICE ACTIVE"
              : loading
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
              (v) => !v
            )
          }
        >
          VOICE{" "}
          {voiceOn
            ? "ON"
            : "OFF"}
        </button>

      </header>

      {/* =================================================
          THE ACTUAL JARVIS ENERGY FIELD
      ================================================= */}

      <div className="core-stage">

        <Core
          audioDataRef={
            audioDataRef
          }
          thinking={
            loading
          }
          speaking={
            speaking
          }
        />

      </div>

      {/* =================================================
          CENTER RETICLE
      ================================================= */}

      <div
        className={`reticle ${
          speaking
            ? "active"
            : ""
        }`}
      >
        <div className="reticle-ring ring-one" />
        <div className="reticle-ring ring-two" />
        <div className="reticle-ring ring-three" />
      </div>

      {/* =================================================
          CHAT
      ================================================= */}

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
            </div>

          </div>
        )}

      </div>

      {/* =================================================
          INPUT
      ================================================= */}

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
          onKeyDown={(e) => {
            if (
              e.key ===
              "Enter"
            ) {
              sendMessage();
            }
          }}
          placeholder="Speak, and I shall listen..."
          disabled={
            loading
          }
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
        >
          ➤
        </button>

      </div>

    </div>
  );
}
