import React, { Suspense, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";
import { SceneFallback } from "./SceneFallback";

function DriftingCubes() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      const x = (state.pointer.x * Math.PI) / 16;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, x, 0.05);
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={1.8} rotationIntensity={0.5} floatIntensity={0.8}>
        <mesh position={[-3, 0.2, -1]} rotation={[0.4, 0.2, 0.1]}>
          <boxGeometry args={[0.9, 0.9, 0.9]} />
          <meshStandardMaterial color="#059669" transparent opacity={0.4} roughness={0.3} metalness={0.2} />
        </mesh>
      </Float>

      <Float speed={1.2} rotationIntensity={0.6} floatIntensity={0.5}>
        <mesh position={[3.5, -0.1, -1.2]} rotation={[-0.2, 0.5, 0.3]}>
          <boxGeometry args={[1.1, 1.1, 1.1]} />
          <meshStandardMaterial color="#06b6d4" transparent opacity={0.35} roughness={0.3} metalness={0.3} />
        </mesh>
      </Float>

      <Float speed={2} rotationIntensity={0.8} floatIntensity={0.6}>
        <mesh position={[1, 0.5, -0.5]}>
          <sphereGeometry args={[0.45, 24, 24]} />
          <meshStandardMaterial color="#10b981" transparent opacity={0.45} roughness={0.2} metalness={0.5} />
        </mesh>
      </Float>

      <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.7}>
        <mesh position={[-1, -0.4, -0.8]}>
          <octahedronGeometry args={[0.5]} />
          <meshStandardMaterial color="#38bdf8" transparent opacity={0.4} roughness={0.2} metalness={0.4} />
        </mesh>
      </Float>
    </group>
  );
}

/** One-time device capability detection for 3D rendering (evaluated lazily, then cached). */
let deviceSupports3D: boolean | null = null;
function detect3DSupport(): boolean {
  if (deviceSupports3D !== null) return deviceSupports3D;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile = window.innerWidth < 768;
  const lowHardware = typeof navigator !== "undefined" && navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;

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

export const DashboardHeroScene: React.FC = () => {
  // Capabilities are fixed for the lifetime of the page — initialize once, no effect needed.
  const [shouldRender3D] = useState<boolean>(detect3DSupport);

  if (!shouldRender3D) {
    return <SceneFallback variant="dashboard" className="h-[200px]" />;
  }

  return (
    <div className="absolute inset-0 w-full h-[220px] overflow-hidden pointer-events-none opacity-60">
      <Suspense fallback={<SceneFallback variant="dashboard" className="h-[200px]" />}>
        <Canvas
          dpr={[1, 1.5]}
          gl={{ antialias: true, powerPreference: "high-performance" }}
          camera={{ position: [0, 0, 4.5], fov: 45 }}
        >
          <ambientLight intensity={0.8} />
          <directionalLight position={[5, 5, 5]} intensity={1} color="#ffffff" />
          <pointLight position={[-5, 2, 2]} intensity={0.8} color="#10b981" />
          <DriftingCubes />
        </Canvas>
      </Suspense>
    </div>
  );
};

export default DashboardHeroScene;
