"use client";

import * as THREE from "three";
import { useRef, useMemo, useCallback, useEffect, useState, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  MarchingCubes,
  MeshTransmissionMaterial,
} from "@react-three/drei";
import type { MarchingCubes as MarchingCubesType } from "three-stdlib";
import {
  Physics,
  RigidBody,
  BallCollider,
  CuboidCollider,
} from "@react-three/rapier";
import type { RigidBodyProps, RapierRigidBody } from "@react-three/rapier";

// MarchingCubesType from three.js has the addBall method we need

// Type for custom shader uniforms
interface LiquidGlassUniforms {
  time: { value: number };
  color1: { value: THREE.Color };
  color2: { value: THREE.Color };
  color3: { value: THREE.Color };
}

const INNER_FIELD_BOUNDS = 2.25;
const OUTER_FIELD_BOUNDS = 3.5;
const WALL_EXTENT = 4;

interface FieldMarchingCubeProps {
  marchingRef: RefObject<MarchingCubesType | null>;
  bounds: number;
  strength: number;
  subtract: number;
  color: string;
  dynamicStrength?: () => number;
}

function WebGLContextLossHandler({ onLost }: { onLost: () => void }) {
  const gl = useThree((state) => state.gl);

  useEffect(() => {
    const canvas = gl.domElement;
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      onLost();
    };

    canvas.addEventListener("webglcontextlost", handleContextLost, false);
    return () => {
      canvas.removeEventListener("webglcontextlost", handleContextLost, false);
    };
  }, [gl, onLost]);

  return null;
}

function FieldMarchingCube({
  marchingRef,
  bounds,
  strength,
  subtract,
  color,
  dynamicStrength,
}: FieldMarchingCubeProps) {
  const cubeRef = useRef<THREE.Group>(null);
  const vec = useMemo(() => new THREE.Vector3(), []);
  const ballColor = useMemo(() => new THREE.Color(color), [color]);

  // Run before drei's MarchingCubes update/reset (which uses priority -1),
  // otherwise the first frame renders empty and can "flash" on mount.
  useFrame(() => {
    if (!marchingRef.current || !cubeRef.current) return;
    cubeRef.current.getWorldPosition(vec);

    // Normalize world space into marching cube volume using expanded bounds
    const normalize = (value: number) =>
      THREE.MathUtils.clamp(0.5 + (value / bounds) * 0.5, 0, 1);

    const strengthScale = dynamicStrength?.() ?? 1;
    if (strengthScale <= 0) return;

    marchingRef.current.addBall(
      normalize(vec.x),
      normalize(vec.y),
      normalize(vec.z),
      strength * strengthScale,
      subtract,
      ballColor,
    );
  }, -1.5);

  return <group ref={cubeRef} />;
}

// Custom shader material with intense refraction for liquid glass effect
function LiquidGlassMaterial() {
  const materialRef = useRef<THREE.ShaderMaterial & { uniforms: LiquidGlassUniforms }>(null);

  const shader = useMemo(
    () => ({
      uniforms: {
        time: { value: 0 },
        color1: { value: new THREE.Color("#ada67c") },
        color2: { value: new THREE.Color("#e1e0d6") },
        color3: { value: new THREE.Color("#252525") },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec3 vWorldPosition;
        varying vec3 vViewPosition;

        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vViewPosition = -mvPosition.xyz;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 color1;
        uniform vec3 color2;
        uniform vec3 color3;

        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec3 vWorldPosition;
        varying vec3 vViewPosition;

        // 3D Simplex noise function
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

        float snoise(vec3 v) {
          const vec2 C = vec2(1.0/6.0, 1.0/3.0);
          const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

          vec3 i  = floor(v + dot(v, C.yyy));
          vec3 x0 = v - i + dot(i, C.xxx);

          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min(g.xyz, l.zxy);
          vec3 i2 = max(g.xyz, l.zxy);

          vec3 x1 = x0 - i1 + C.xxx;
          vec3 x2 = x0 - i2 + C.yyy;
          vec3 x3 = x0 - D.yyy;

          i = mod289(i);
          vec4 p = permute(permute(permute(
                    i.z + vec4(0.0, i1.z, i2.z, 1.0))
                  + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                  + i.x + vec4(0.0, i1.x, i2.x, 1.0));

          float n_ = 0.142857142857;
          vec3 ns = n_ * D.wyz - D.xzx;

          vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_);

          vec4 x = x_ *ns.x + ns.yyyy;
          vec4 y = y_ *ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);

          vec4 b0 = vec4(x.xy, y.xy);
          vec4 b1 = vec4(x.zw, y.zw);

          vec4 s0 = floor(b0)*2.0 + 1.0;
          vec4 s1 = floor(b1)*2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));

          vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
          vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

          vec3 p0 = vec3(a0.xy, h.x);
          vec3 p1 = vec3(a0.zw, h.y);
          vec3 p2 = vec3(a1.xy, h.z);
          vec3 p3 = vec3(a1.zw, h.w);

          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
          p0 *= norm.x;
          p1 *= norm.y;
          p2 *= norm.z;
          p3 *= norm.w;

          vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
        }

        // Fractal Brownian Motion for layered noise
        float fbm(vec3 p) {
          float value = 0.0;
          float amplitude = 0.5;
          float frequency = 1.0;

          for(int i = 0; i < 5; i++) {
            value += amplitude * snoise(p * frequency);
            frequency *= 2.0;
            amplitude *= 0.5;
          }
          return value;
        }

        void main() {
          vec3 noisePos = vWorldPosition * 3.0 + vec3(time * 0.1);
          float noise1 = fbm(noisePos);
          float noise2 = fbm(noisePos * 1.5 + vec3(time * 0.15, -time * 0.1, time * 0.2));
          float noise3 = fbm(noisePos * 0.8 + vec3(-time * 0.12, time * 0.18, -time * 0.08));

          vec3 viewDirection = normalize(vViewPosition);
          vec3 normal = normalize(vNormal);

          float ior = 2.4;
          vec3 refracted = refract(-viewDirection, normal, 1.0 / ior);

          float distortion = 2.0;
          vec3 distortedPos = vWorldPosition + refracted * distortion;

          float turbulence = noise1 * 0.5 + noise2 * 0.4 + noise3 * 0.3;

          float gradient1 = sin(distortedPos.x * 1.2 + time * 0.5 + noise1 * 3.0) * 0.5 + 0.5;
          float gradient2 = cos(distortedPos.y * 1.2 + time * 0.3 + noise2 * 3.0) * 0.5 + 0.5;
          float gradient3 = sin(distortedPos.z * 1.2 + time * 0.4 + noise3 * 3.0) * 0.5 + 0.5;

          vec3 mixedColor = mix(color1, color2, gradient1 + turbulence * 0.6);
          mixedColor = mix(mixedColor, color3, gradient2 * 0.5 + noise2 * 0.4);
          mixedColor = mix(mixedColor, color1, gradient3 * 0.3 + noise3 * 0.3);

          // Strong fresnel effect for glass edges
          float fresnel = pow(1.0 - abs(dot(viewDirection, normal)), 3.0);

          vec3 finalColor = mixedColor + vec3(turbulence * 0.3);
          finalColor = mix(finalColor, vec3(1.0), fresnel * 0.4);

          float alpha = 0.2 + fresnel * 0.6 + abs(turbulence) * 0.2;

          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
    }),
    [],
  );

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime;
    }
  });

  return (
    <shaderMaterial
      ref={materialRef}
      {...shader}
      transparent
      side={THREE.DoubleSide}
    />
  );
}

type MarchingBallProps = RigidBodyProps & {
  float?: boolean;
  strength?: number;
  color: string;
  vec?: THREE.Vector3;
  marchingRef: RefObject<MarchingCubesType | null>;
  bounds: number;
};

function MetaBall({
  float = false,
  strength = 0.5,
  color,
  vec = new THREE.Vector3(),
  marchingRef,
  bounds,
  ...props
}: MarchingBallProps) {
  const api = useRef<RapierRigidBody>(null);

  useFrame((state, delta) => {
    if (float && api.current) {
      delta = Math.min(delta, 0.1);
      delta *= 0.005;
      const translation = api.current.translation();
      if (translation) {
        api.current.applyImpulse(
          vec
            .copy(translation)
            .normalize()
            .multiplyScalar(delta * -0.005),
          true,
        );
      }
    }
  });

  return (
    <RigidBody
      ref={api}
      colliders={false}
      restitution={0.01}
      linearDamping={8}
      angularDamping={8}
      {...props}
    >
      <FieldMarchingCube
        marchingRef={marchingRef}
        bounds={bounds}
        strength={strength}
        subtract={100}
        color={color}
      />
      <BallCollider args={[0.01]} />
    </RigidBody>
  );
}

function RandomMetaBall({
  strength = 0.8,
  color,
  vec = new THREE.Vector3(),
  marchingRef,
  bounds,
  ...props
}: MarchingBallProps) {
  const api = useRef<RapierRigidBody>(null);
  const timeRef = useRef<number>(0);
  const targetRef = useRef<THREE.Vector3>(new THREE.Vector3());

  useFrame((state, delta) => {
    if (api.current) {
      delta = Math.min(delta, 0.01);
      delta *= 0.005;
      timeRef.current += delta;

      // Change direction every 2-4 seconds
      if (timeRef.current > 2 + Math.random() * 2) {
        timeRef.current = 0;
        targetRef.current.set(
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 0.5,
        );
      }

      const translation = api.current.translation();
      if (translation) {
        // Apply impulse towards random target
        const impulse = vec
          .copy(targetRef.current)
          .sub(translation)
          .normalize()
          .multiplyScalar(delta * 0.015);

        api.current.applyImpulse(impulse, true);
      }
    }
  });

  return (
    <RigidBody
      ref={api}
      colliders={false}
      restitution={0.1}
      linearDamping={4}
      angularDamping={4}
      {...props}
    >
      <FieldMarchingCube
        marchingRef={marchingRef}
        bounds={bounds}
        strength={strength}
        subtract={100}
        color={color}
      />
      <BallCollider args={[0.015]} />
    </RigidBody>
  );
}

function PoppingMetaBall({
  strength = 1.2,
  color,
  marchingRef,
  bounds,
  vec = new THREE.Vector3(),
  ...props
}: MarchingBallProps) {
  const api = useRef<RapierRigidBody>(null);
  const fadeRef = useRef(0);
  const phaseRef = useRef<"hidden" | "fadingIn" | "visible" | "fadingOut">("hidden");
  const timerRef = useRef(0);
  const hiddenDurationRef = useRef(THREE.MathUtils.randFloat(1.5, 3.5));
  const visibleDurationRef = useRef(THREE.MathUtils.randFloat(1.25, 2.5));
  const vertexIndexRef = useRef(0);

  const nextTriangularPosition = useCallback((): [number, number, number] => {
    const radius = bounds * 0.35;
    const angle = (vertexIndexRef.current / 3) * Math.PI * 2;
    vertexIndexRef.current = (vertexIndexRef.current + 1) % 3;

    const jitter = radius * 0.15;
    const x = Math.cos(angle) * radius + (Math.random() - 0.5) * jitter;
    const y = Math.sin(angle) * radius + (Math.random() - 0.5) * jitter;
    const z = (Math.random() - 0.5) * bounds * 0.15;

    return [x, y, z];
  }, [bounds]);

  const resetPhaseTimer = useCallback((durationRef: { current: number }, min: number, max: number) => {
    durationRef.current = THREE.MathUtils.randFloat(min, max);
    timerRef.current = 0;
  }, []);

  const warpToRandomPosition = useCallback(() => {
    const [x, y, z] = nextTriangularPosition();
    if (api.current) {
      api.current.setTranslation({ x, y, z }, true);
      api.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
    }
  }, [nextTriangularPosition]);

  useEffect(() => {
    warpToRandomPosition();
  }, [warpToRandomPosition]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    timerRef.current += dt;

    switch (phaseRef.current) {
      case "hidden": {
        fadeRef.current = 0;
        if (timerRef.current >= hiddenDurationRef.current) {
          phaseRef.current = "fadingIn";
          timerRef.current = 0;
          warpToRandomPosition();
        }
        break;
      }
      case "fadingIn": {
        const fadeDuration = 0.75;
        fadeRef.current = THREE.MathUtils.clamp(timerRef.current / fadeDuration, 0, 1);
        if (timerRef.current >= fadeDuration) {
          phaseRef.current = "visible";
          resetPhaseTimer(visibleDurationRef, 1.25, 2.75);
        }
        break;
      }
      case "visible": {
        fadeRef.current = 1;
        if (timerRef.current >= visibleDurationRef.current) {
          phaseRef.current = "fadingOut";
          timerRef.current = 0;
        }
        break;
      }
      case "fadingOut": {
        const fadeDuration = 0.85;
        fadeRef.current = 1 - THREE.MathUtils.clamp(timerRef.current / fadeDuration, 0, 1);
        if (timerRef.current >= fadeDuration) {
          phaseRef.current = "hidden";
          resetPhaseTimer(hiddenDurationRef, 1.5, 3.5);
        }
        break;
      }
    }

    if (api.current && fadeRef.current > 0 && phaseRef.current !== "hidden") {
      const translation = api.current.translation();
      if (translation) {
        api.current.applyImpulse(
          vec
            .copy(translation)
            .normalize()
            .multiplyScalar(dt * -0.01 * fadeRef.current),
          true,
        );
      }
    }
  });

  const dynamicStrength = useCallback(() => fadeRef.current, []);

  return (
    <RigidBody
      ref={api}
      colliders={false}
      restitution={0.05}
      linearDamping={4}
      angularDamping={4}
      {...props}
    >
      <FieldMarchingCube
        marchingRef={marchingRef}
        bounds={bounds}
        strength={strength}
        subtract={90}
        color={color}
        dynamicStrength={dynamicStrength}
      />
      <BallCollider args={[0.02]} />
    </RigidBody>
  );
}

interface PointerProps {
  vec?: THREE.Vector3;
}

function Pointer({ vec = new THREE.Vector3() }: PointerProps) {
  const ref = useRef<RapierRigidBody>(null);
  const smooth = useRef<THREE.Vector3>(new THREE.Vector3());

  useFrame(({ pointer, viewport }) => {
    if (ref.current) {
      const { width, height } = viewport.getCurrentViewport();
      vec.set((pointer.x * width) / 2, (pointer.y * height) / 2, 0);
      // Smooth pointer movement to reduce collision impulse
      smooth.current.lerp(vec, 0.2);
      ref.current.setNextKinematicTranslation(smooth.current);
    }
  });

  return (
    <RigidBody
      type="kinematicPosition"
      colliders={false}
      ref={ref}
      restitution={0.1}
    >
      <BallCollider args={[0.2]} restitution={0.1} />
    </RigidBody>
  );
}

export default function Metaball3D() {
  const [canvasKey, setCanvasKey] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [eventSource] = useState<HTMLElement>(() => document.body);
  const innerMarchingRef = useRef<MarchingCubesType | null>(null);
  const outerMarchingRef = useRef<MarchingCubesType | null>(null);

  const handleContextLost = useCallback(() => {
    setCanvasKey((key) => key + 1);
  }, []);

  useEffect(() => {
    setIsVisible(false);
    const id = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(id);
  }, [canvasKey]);

  const innerInitialPositions = useMemo(
    () =>
      Array.from({ length: 10 }, () => [
        Math.random() * 0.5 - 0.25,
        Math.random() * 0.5 - 0.25,
        0,
      ]) as [number, number, number][],
    [],
  );

  const outerInitialPositions = useMemo(
    () =>
      Array.from({ length: 6 }, () => [
        Math.random() * 1.5 - 0.75,
        Math.random() * 1.5 - 0.75,
        Math.random() * 0.5 - 0.25,
      ]) as [number, number, number][],
    [],
  );

  return (
    <Canvas
      key={canvasKey}
      dpr={1}
      orthographic
      camera={{ position: [0, 0, 5], zoom: 600, fov: 180 }}
      gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}
      eventSource={eventSource}
      style={{
        background: "transparent",
        width: "100%",
        height: "100%",
        opacity: isVisible ? 1 : 0,
        transition: "opacity 200ms ease",
        willChange: "opacity",
      }}
    >
      <WebGLContextLossHandler onLost={handleContextLost} />
      <ambientLight intensity={1} />
      <Physics gravity={[0, -0.0005, 0]} updatePriority={-2}>
        <MarchingCubes
          ref={innerMarchingRef}
          scale={0.8}
          resolution={50}
          maxPolyCount={25000}
          enableUvs={false}
          enableColors
        >
          <LiquidGlassMaterial />
          {innerInitialPositions.map((position, index) => (
            <MetaBall
              float
              strength={1}
              key={"metaball-" + index}
              color="#ffffff"
              marchingRef={innerMarchingRef}
              bounds={INNER_FIELD_BOUNDS}
              position={position}
            />
          ))}
          <RandomMetaBall
            strength={1.2}
            color="#ffffff"
            marchingRef={innerMarchingRef}
            bounds={INNER_FIELD_BOUNDS}
            position={[1, 1, 0]}
          />
          <RandomMetaBall
            strength={1.0}
            color="#ffffff"
            marchingRef={innerMarchingRef}
            bounds={INNER_FIELD_BOUNDS}
            position={[-1, -1, 0]}
          />
          <RandomMetaBall
            strength={1.1}
            color="#ffffff"
            marchingRef={innerMarchingRef}
            bounds={INNER_FIELD_BOUNDS}
            position={[0, 1.5, 0]}
          />
          <PoppingMetaBall
            strength={1.35}
            color="#ffffff"
            marchingRef={innerMarchingRef}
            bounds={INNER_FIELD_BOUNDS}
          />
          <Pointer />
        </MarchingCubes>

        <MarchingCubes
          ref={outerMarchingRef}
          scale={1.2}
          resolution={50}
          maxPolyCount={25000}
          enableUvs={false}
          enableColors
        >
          <MeshTransmissionMaterial
            samples={6}
            resolution={512}
            transmission={1}
            thickness={0.8}
            roughness={0}
            chromaticAberration={0.5}
            anisotropy={1}
            distortion={0.5}
            distortionScale={0.5}
            temporalDistortion={0.2}
            ior={1.5}
            color="#ada67c"
            transparent
            opacity={0.6}
          />
          {outerInitialPositions.map((position, index) => (
            <MetaBall
              float
              strength={1.0}
              key={"transmission-metaball-" + index}
              color="#ffffff"
              marchingRef={outerMarchingRef}
              bounds={OUTER_FIELD_BOUNDS}
              position={position}
            />
          ))}
          <RandomMetaBall
            strength={0.9}
            color="#ffffff"
            marchingRef={outerMarchingRef}
            bounds={OUTER_FIELD_BOUNDS}
            position={[-1.5, 0.5, 0.2]}
          />
          <RandomMetaBall
            strength={0.8}
            color="#ffffff"
            marchingRef={outerMarchingRef}
            bounds={OUTER_FIELD_BOUNDS}
            position={[1.2, -0.8, -0.1]}
          />
          <PoppingMetaBall
            strength={1}
            color="#ffffff"
            marchingRef={outerMarchingRef}
            bounds={OUTER_FIELD_BOUNDS}
          />
        </MarchingCubes>

        <Walls />
      </Physics>
    </Canvas>
  );
}

function Walls() {
  // Walls sized to cover the expanded marching field
  return (
    <>
      <CuboidCollider position={[0, -WALL_EXTENT, 0]} args={[WALL_EXTENT, 0.1, WALL_EXTENT]} />
      <CuboidCollider position={[-WALL_EXTENT, 0, 0]} args={[0.1, WALL_EXTENT, WALL_EXTENT]} />
      <CuboidCollider position={[WALL_EXTENT, 0, 0]} args={[0.1, WALL_EXTENT, WALL_EXTENT]} />
      <CuboidCollider position={[0, 0, -WALL_EXTENT]} args={[WALL_EXTENT, WALL_EXTENT, 0.1]} />
      <CuboidCollider position={[0, 0, WALL_EXTENT]} args={[WALL_EXTENT, WALL_EXTENT, 0.1]} />
    </>
  );
}
