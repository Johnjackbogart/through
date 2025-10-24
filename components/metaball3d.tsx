"use client";

import * as THREE from "three";
import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  MarchingCubes,
  MarchingCube,
  MeshTransmissionMaterial,
} from "@react-three/drei";
import {
  Physics,
  RigidBody,
  BallCollider,
  CuboidCollider,
} from "@react-three/rapier";

// Custom shader material with intense refraction for liquid glass effect
function LiquidGlassMaterial() {
  const materialRef = useRef<any>();

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

function MetaBall({
  float = false,
  strength = 0.5,
  color,
  vec = new THREE.Vector3(),
  ...props
}) {
  const api = useRef<any>(null);

  useFrame((state, delta) => {
    if (float && api.current) {
      delta = Math.min(delta, 0.1);
      delta *= 0.05;
      const translation = api.current.translation();
      if (translation) {
        api.current.applyImpulse(
          vec
            .copy(translation)
            .normalize()
            .multiplyScalar(delta * -0.05),
          true,
        );
      }
    }
  });

  return (
    <RigidBody
      ref={api}
      colliders={false}
      restitution={0.6}
      linearDamping={8}
      angularDamping={8}
      {...props}
    >
      <MarchingCube strength={strength} subtract={100} color={color} />
      <BallCollider args={[0.1]} type="dynamic" />
    </RigidBody>
  );
}

function RandomMetaBall({
  strength = 0.8,
  color,
  vec = new THREE.Vector3(),
  ...props
}) {
  const api = useRef<any>(null);
  const timeRef = useRef(0);
  const targetRef = useRef(new THREE.Vector3());

  useFrame((state, delta) => {
    if (api.current) {
      delta = Math.min(delta, 0.01);
      delta *= 0.05;
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
          .multiplyScalar(delta * 0.15);

        api.current.applyImpulse(impulse, true);
      }
    }
  });

  return (
    <RigidBody
      ref={api}
      colliders={false}
      restitution={0.8}
      linearDamping={4}
      angularDamping={4}
      {...props}
    >
      <MarchingCube strength={strength} subtract={10} color={color} />
      <BallCollider args={[0.15]} />
    </RigidBody>
  );
}

function Pointer({ vec = new THREE.Vector3() }) {
  const ref = useRef<any>(null);

  useFrame(({ pointer, viewport }) => {
    if (ref.current) {
      const { width, height } = viewport.getCurrentViewport();
      vec.set((pointer.x * width) / 2, (pointer.y * height) / 2, 0);
      ref.current.setNextKinematicTranslation(vec);
    }
  });

  return (
    <RigidBody type="kinematicPosition" colliders={false} ref={ref}>
      <BallCollider args={[0.3]} />
    </RigidBody>
  );
}

export default function Metaball3D() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      orthographic
      camera={{ position: [0, 0, 5], zoom: 600, fov: 180 }}
      gl={{ alpha: true }}
      style={{ background: "transparent", width: "100%" }}
    >
      <ambientLight intensity={1} />
      <Physics gravity={[0, -0.005, 0]}>
        <MarchingCubes
          scale={0.5}
          resolution={50}
          maxPolyCount={25000}
          enableUvs={false}
          enableColors
        >
          <LiquidGlassMaterial />
          {Array.from({ length: 10 }, (_, index) => (
            <MetaBall
              float
              strength={0.9}
              key={"metaball-" + index}
              color="#ffffff"
              position={[
                Math.random() * 0.5 - 0.25,
                Math.random() * 0.5 - 0.25,
                0,
              ]}
            />
          ))}
          <RandomMetaBall strength={1.2} color="#ffffff" position={[1, 1, 0]} />
          <RandomMetaBall
            strength={1.0}
            color="#ffffff"
            position={[-1, -1, 0]}
          />
          <RandomMetaBall
            strength={1.1}
            color="#ffffff"
            position={[0, 1.5, 0]}
          />
          <Pointer />
        </MarchingCubes>

        <MarchingCubes
          scale={0.5}
          resolution={50}
          maxPolyCount={25000}
          enableUvs={false}
          enableColors
        >
          <MeshTransmissionMaterial
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
          {Array.from({ length: 6 }, (_, index) => (
            <MetaBall
              float
              strength={7.0}
              key={"transmission-metaball-" + index}
              color="#ffffff"
              position={[
                Math.random() * 1.5 - 0.75,
                Math.random() * 1.5 - 0.75,
                Math.random() * 0.5 - 0.25,
              ]}
            />
          ))}
          <RandomMetaBall
            strength={0.9}
            color="#ffffff"
            position={[-1.5, 0.5, 0.2]}
          />
          <RandomMetaBall
            strength={0.8}
            color="#ffffff"
            position={[1.2, -0.8, -0.1]}
          />
        </MarchingCubes>

        <Walls />
      </Physics>
    </Canvas>
  );
}

function Walls() {
  return (
    <>
      <CuboidCollider position={[0, -25.5, 0]} args={[8, 1, 10]} />
      <CuboidCollider
        rotation={[0, 0, -Math.PI / 0.06]}
        position={[-50, 0, 0]}
        args={[1, 8, 10]}
      />
      <CuboidCollider
        rotation={[0, 0, Math.PI / 0.06]}
        position={[50, 0, 0]}
        args={[1, 8, 10]}
      />
      <CuboidCollider position={[0, 0, -21.5]} args={[8, 8, 1]} />
      <CuboidCollider position={[0, 0, 21.5]} args={[8, 8, 1]} />
    </>
  );
}
