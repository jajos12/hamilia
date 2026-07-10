"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group, Mesh } from "three";

interface FallbackAvatarProps {
  isSpeaking: boolean;
  color?: string;
}

export function FallbackAvatar({
  isSpeaking,
  color = "#74B9FF",
}: FallbackAvatarProps) {
  const groupRef = useRef<Group>(null);
  const mouthRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    // Breathing animation
    groupRef.current.scale.y = 1 + Math.sin(t * 2) * 0.02;

    // Speaking animation
    if (isSpeaking) {
      groupRef.current.rotation.z = Math.sin(t * 3) * 0.05;
      groupRef.current.position.y = Math.sin(t * 4) * 0.03;

      // Mouth animation
      if (mouthRef.current) {
        const mouthOpen = Math.abs(Math.sin(t * 8)) * 0.04;
        mouthRef.current.scale.y = 1 + mouthOpen * 10;
        mouthRef.current.scale.x = 1 + Math.sin(t * 6) * 0.2;
      }
    } else {
      groupRef.current.rotation.z = 0;
      groupRef.current.position.y = 0;

      if (mouthRef.current) {
        mouthRef.current.scale.y = 1;
        mouthRef.current.scale.x = 1;
      }
    }
  });

  return (
    <group ref={groupRef}>
      {/* Head */}
      <mesh position={[0, 0.5, 0]}>
        <sphereGeometry args={[0.25, 32, 32]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
      </mesh>

      {/* Body */}
      <mesh position={[0, 0, 0]}>
        <capsuleGeometry args={[0.15, 0.4, 8, 16]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
      </mesh>

      {/* Eyes */}
      <mesh position={[-0.08, 0.52, 0.2]}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshStandardMaterial color="#fff" />
      </mesh>
      <mesh position={[0.08, 0.52, 0.2]}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshStandardMaterial color="#fff" />
      </mesh>

      {/* Pupils */}
      <mesh position={[-0.08, 0.52, 0.22]}>
        <sphereGeometry args={[0.015, 16, 16]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <mesh position={[0.08, 0.52, 0.22]}>
        <sphereGeometry args={[0.015, 16, 16]} />
        <meshStandardMaterial color="#111" />
      </mesh>

      {/* Mouth */}
      <mesh ref={mouthRef} position={[0, 0.44, 0.22]}>
        <boxGeometry args={[0.06, 0.015, 0.01]} />
        <meshStandardMaterial color="#333" />
      </mesh>
    </group>
  );
}
