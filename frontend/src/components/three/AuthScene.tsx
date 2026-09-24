import React, { Suspense, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { SceneFallback } from "./SceneFallback";

function SlabsAndCoins() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      // Gentle mouse parallax
      const x = (state.pointer.x * Math.PI) / 12;
      const y = (state.pointer.y * Math.PI) / 12;
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -y, 0.05);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, x, 0.05);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Primary Floating Glass Ledger Slab */}
      <Float speed={2} rotationIntensity={0.4} floatIntensity={0.8}>
        <mesh position={[0, 0.2, 0]} rotation={[0.2, -0.4, 0.1]}>
          <RoundedBox args={[3.2, 2.2, 0.2]} radius={0.1} smoothness={4}>
            <meshPhysicalMaterial
              color="#059669"
              transparent
              opacity={0.7}
              roughness={0.15}
              metalness={0.1}
              transmission={0.8}
              thickness={0.5}
            />
          </RoundedBox>
        </mesh>
      </Float>

      {/* Secondary Companion Slab */}
      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.6}>
        <mesh position={[1.2, -0.8, -0.8]} rotation={[-0.3, 0.3, -0.1]}>
          <RoundedBox args={[2.5, 1.8, 0.15]} radius={0.08} smoothness={4}>
            <meshPhysicalMaterial
              color="#06b6d4"
              transparent
              opacity={0.6}
              roughness={0.2}
              metalness={0.2}
              transmission={0.75}
              thickness={0.4}
            />
          </RoundedBox>
        </mesh>
      </Float>

      {/* Emerald Metallic Rupee Coin */}
      <Float speed={2.5} rotationIntensity={0.8} floatIntensity={1.2}>
        <mesh position={[-1.6, -0.6, 0.8]} rotation={[1.2, 0.4, 0.2]}>
          <cylinderGeometry args={[0.55, 0.55, 0.08, 32]} />
          <meshStandardMaterial
            color="#10b981"
            metalness={0.9}
            roughness={0.2}
          />
        </mesh>
      </Float>

      {/* Accent Gold/Cyan Coin */}
      <Float speed={3} rotationIntensity={1} floatIntensity={0.9}>
        <mesh position={[1.8, 1.1, 0.4]} rotation={[0.8, -0.6, 0.5]}>
          <cylinderGeometry args={[0.4, 0.4, 0.06, 32]} />
          <meshStandardMaterial
            color="#38bdf8"
            metalness={0.85}
            roughness={0.25}
          />
        </mesh>
      </Float>
    </group>
  );
}

/** One-time device capability detection for 3D rendering (evaluated lazily, then cached). */
let deviceSupports3D: boolean | null = null;
function detect3DSupport(): boolean {
  if (deviceSupports3D !== null) return deviceSupports3D;
  // Mandatory guardrails:
  // 1. Prefers reduced motion
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // 2. Viewport < 768px
  const isMobile = window.innerWidth < 768;
  // 3. Hardware concurrency check
  const lowHardware = typeof navigator !== "undefined" && navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;

  // 4. WebGL check
  let hasWebGL = false;
  try {
    const canvas = document.createElement("canvas");
    hasWebGL = !!(window.WebGLRenderingContext && (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")));
  } catch {
    hasWebGL = false;
  }

  deviceSupports3D = !prefersReducedMotion && !isMobile && !lowHardware && hasWebGL;
  return deviceSupports3D;
}

export const AuthScene: React.FC = () => {
  // Capabilities are fixed for the lifetime of the page — initialize once, no effect needed.
  const [shouldRender3D] = useState<boolean>(detect3DSupport);

  if (!shouldRender3D) {
    return <SceneFallback variant="auth" />;
  }

  return (
    <div className="relative w-full h-full">
      <Suspense fallback={<SceneFallback variant="auth" />}>
        <Canvas
          dpr={[1, 1.5]}
          gl={{ antialias: true, powerPreference: "high-performance" }}
          camera={{ position: [0, 0, 5], fov: 45 }}
        >
          <ambientLight intensity={0.7} />
          <directionalLight position={[10, 10, 5]} intensity={1.5} color="#ffffff" />
          <pointLight position={[-10, -10, -10]} intensity={0.8} color="#06b6d4" />
          <pointLight position={[5, -5, 5]} intensity={1.2} color="#10b981" />
          <SlabsAndCoins />
        </Canvas>
      </Suspense>
    </div>
  );
};

export default AuthScene;
