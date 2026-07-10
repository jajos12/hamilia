"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { PerformanceMonitor } from "@react-three/drei";
import { VRMAvatar } from "./VRMAvatar";

interface SingleAvatarSceneProps {
  avatarUrl: string;
  isSpeaking: boolean;
  expression?: "neutral" | "confident" | "challenging";
  rotation?: [number, number, number];
  fallbackColor?: string;
}

export function SingleAvatarScene({
  avatarUrl,
  isSpeaking,
  expression = "neutral",
  rotation = [0, 0, 0],
  fallbackColor = "#74B9FF",
}: SingleAvatarSceneProps) {
  return (
    <div className="w-full h-full relative overflow-hidden">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0.8, 2.8], fov: 28 }}
        shadows={false}
        gl={{ antialias: true, alpha: true }}
        style={{
          background: "transparent",
          width: "100%",
          height: "100%",
        }}
        resize={{ scroll: false, debounce: { scroll: 0, resize: 0 } }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 4, 3]} intensity={1.0} />
        <directionalLight position={[-3, 4, 3]} intensity={0.5} />

        <PerformanceMonitor
          bounds={(refreshRate) => (refreshRate > 60 ? [50, 70] : [30, 50])}
        >
          <Suspense fallback={null}>
            <VRMAvatar
              url={avatarUrl}
              isSpeaking={isSpeaking}
              expression={expression}
              rotation={rotation}
            />
          </Suspense>
        </PerformanceMonitor>

        <Environment preset="apartment" />
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={1.5}
          maxDistance={5}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.1}
          zoomSpeed={0.5}
          target={[0, 0.8, 0]}
        />
      </Canvas>
    </div>
  );
}
