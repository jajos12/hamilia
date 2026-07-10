"use client";

import { useRef, useEffect, useState } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { VRM, VRMLoaderPlugin, VRMUtils } from "@pixiv/three-vrm";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Box3, Vector3, Group, Euler } from "three";
import * as THREE from "three";

interface VRMAvatarProps {
  url: string;
  isSpeaking: boolean;
  expression?: "neutral" | "confident" | "challenging";
  rotation?: [number, number, number];
}

export function VRMAvatar({
  url,
  isSpeaking,
  expression = "neutral",
  rotation = [0, 0, 0],
}: VRMAvatarProps) {
  const gltf = useLoader(GLTFLoader, url, (loader) => {
    loader.register((parser) => new VRMLoaderPlugin(parser));
  });
  const scene = gltf.scene;
  const vrmRef = useRef<VRM | null>(null);
  const groupRef = useRef<Group>(null);
  const [fitted, setFitted] = useState(false);

  // Animation state
  const headRef = useRef<{ current: THREE.Object3D | null }>({ current: null });
  const leftArmRef = useRef<{ current: THREE.Object3D | null }>({ current: null });
  const rightArmRef = useRef<{ current: THREE.Object3D | null }>({ current: null });
  const leftHandRef = useRef<{ current: THREE.Object3D | null }>({ current: null });
  const rightHandRef = useRef<{ current: THREE.Object3D | null }>({ current: null });
  const spineRef = useRef<{ current: THREE.Object3D | null }>({ current: null });

  const baseRotations = useRef<Map<THREE.Object3D, Euler>>(new Map());
  const gesturePhase = useRef(0);
  const lastGestureTime = useRef(0);

  useEffect(() => {
    const vrm = (scene as Group & { userData: { vrm?: VRM } }).userData.vrm;
    if (vrm) {
      VRMUtils.removeUnnecessaryVertices(vrm.scene);
      VRMUtils.removeUnnecessaryJoints(vrm.scene);
      vrm.scene.traverse((obj) => {
        obj.frustumCulled = false;
      });
      vrmRef.current = vrm;

      // Find bones for body animation
      const humanoid = vrm.humanoid;
      if (humanoid) {
        headRef.current.current = humanoid.getBoneNode("head") ?? null;
        leftArmRef.current.current = humanoid.getBoneNode("leftUpperArm") ?? null;
        rightArmRef.current.current = humanoid.getBoneNode("rightUpperArm") ?? null;
        leftHandRef.current.current = humanoid.getBoneNode("leftHand") ?? null;
        rightHandRef.current.current = humanoid.getBoneNode("rightHand") ?? null;
        spineRef.current.current = humanoid.getBoneNode("spine") ?? null;

        // Store base rotations
        [headRef, leftArmRef, rightArmRef, leftHandRef, rightHandRef, spineRef].forEach((ref) => {
          if (ref.current.current) {
            baseRotations.current.set(ref.current.current, new Euler().copy(ref.current.current.rotation));
          }
        });
      }

      // Auto-fit: calculate bounding box and center/scale
      const box = new Box3().setFromObject(vrm.scene);
      const size = box.getSize(new Vector3());
      const center = box.getCenter(new Vector3());

      const targetHeight = 2.2;
      const scale = targetHeight / size.y;

      if (groupRef.current) {
        groupRef.current.position.x = -center.x * scale;
        groupRef.current.position.y = -box.min.y * scale;
        groupRef.current.position.z = -center.z * scale;
        groupRef.current.scale.setScalar(scale);
      }
      setFitted(true);
    }
  }, [scene]);

  useFrame((state) => {
    const vrm = vrmRef.current;
    if (!vrm || !vrm.expressionManager) return;

    const t = state.clock.elapsedTime;
    const dt = state.clock.getDelta();

    // ── IDLE: Subtle breathing ───────────────────────────────
    if (vrm.expressionManager) {
      vrm.expressionManager.setValue("oh", Math.sin(t * 2) * 0.05);
    }

    // ── IDLE: Blinking ───────────────────────────────────────
    const blinkCycle = t % (3 + Math.sin(t * 0.3) * 2);
    if (blinkCycle > 2.8) {
      vrm.expressionManager?.setValue("blink", 1);
    } else {
      vrm.expressionManager?.setValue("blink", 0);
    }

    // ── SPEAKING: Mouth + Body Language ──────────────────────
    if (isSpeaking) {
      // Mouth movement
      const mouthOpen = Math.sin(t * 14) * 0.35 + 0.5;
      vrm.expressionManager?.setValue("aa", mouthOpen);
      vrm.expressionManager?.setValue("ih", Math.sin(t * 11) * 0.15 + 0.1);
      vrm.expressionManager?.setValue("ou", Math.sin(t * 9) * 0.1 + 0.05);

      // Head nods while speaking
      if (headRef.current.current) {
        const base = baseRotations.current.get(headRef.current.current) || new Euler();
        headRef.current.current.rotation.x = base.x + Math.sin(t * 1.8) * 0.08;
        headRef.current.current.rotation.y = base.y + Math.sin(t * 1.2) * 0.05;
        headRef.current.current.rotation.z = base.z + Math.sin(t * 2.3) * 0.03;
      }

      // Spine lean
      if (spineRef.current.current) {
        const base = baseRotations.current.get(spineRef.current.current) || new Euler();
        spineRef.current.current.rotation.x = base.x + Math.sin(t * 1.5) * 0.04;
        spineRef.current.current.rotation.y = base.y + Math.sin(t * 0.8) * 0.03;
      }

      // Hand gestures - periodic emphasis gestures
      gesturePhase.current += dt * 1.2;
      if (gesturePhase.current - lastGestureTime.current > 2.5 + Math.sin(t * 0.5) * 1.5) {
        lastGestureTime.current = gesturePhase.current;
        // Trigger a gesture
        if (rightHandRef.current.current) {
          const base = baseRotations.current.get(rightHandRef.current.current) || new Euler();
          const gestureIntensity = 0.6 + Math.random() * 0.4;
          rightHandRef.current.current.rotation.x = base.x - gestureIntensity * 0.8;
          rightHandRef.current.current.rotation.y = base.y + (Math.random() - 0.5) * 0.5;
          rightHandRef.current.current.rotation.z = base.z + (Math.random() - 0.5) * 0.4;
        }
        if (leftHandRef.current.current && Math.random() > 0.6) {
          const base = baseRotations.current.get(leftHandRef.current.current) || new Euler();
          const gestureIntensity = 0.4 + Math.random() * 0.3;
          leftHandRef.current.current.rotation.x = base.x - gestureIntensity * 0.6;
          leftHandRef.current.current.rotation.y = base.y + (Math.random() - 0.5) * 0.4;
          leftHandRef.current.current.rotation.z = base.z + (Math.random() - 0.5) * 0.3;
        }
      }

      // Smooth return to base for hands
      [rightHandRef, leftHandRef].forEach((ref) => {
        if (ref.current.current) {
          const base = baseRotations.current.get(ref.current.current) || new Euler();
          ref.current.current.rotation.x += (base.x - ref.current.current.rotation.x) * dt * 3;
          ref.current.current.rotation.y += (base.y - ref.current.current.rotation.y) * dt * 3;
          ref.current.current.rotation.z += (base.z - ref.current.current.rotation.z) * dt * 3;
        }
      });

      // Arm movement
      if (rightArmRef.current.current) {
        const base = baseRotations.current.get(rightArmRef.current.current) || new Euler();
        rightArmRef.current.current.rotation.x = base.x + Math.sin(t * 1.3) * 0.12;
        rightArmRef.current.current.rotation.y = base.y + Math.sin(t * 0.9) * 0.08;
        rightArmRef.current.current.rotation.z = base.z + Math.sin(t * 1.7) * 0.06;
      }
      if (leftArmRef.current.current) {
        const base = baseRotations.current.get(leftArmRef.current.current) || new Euler();
        leftArmRef.current.current.rotation.x = base.x + Math.sin(t * 1.1) * 0.08;
        leftArmRef.current.current.rotation.y = base.y + Math.sin(t * 1.4) * 0.06;
      }

      // Body sway
      if (groupRef.current) {
        groupRef.current.rotation.y = rotation[1] + Math.sin(t * 0.7) * 0.02;
        groupRef.current.rotation.z = Math.sin(t * 1.1) * 0.015;
      }
    } else {
      // Not speaking - return to base pose
      vrm.expressionManager?.setValue("aa", 0);
      vrm.expressionManager?.setValue("ih", 0);
      vrm.expressionManager?.setValue("ou", 0);

      // Smooth return for all bones
      [headRef, spineRef, rightArmRef, leftArmRef, rightHandRef, leftHandRef].forEach((ref) => {
        if (ref.current.current) {
          const base = baseRotations.current.get(ref.current.current) || new Euler();
          ref.current.current.rotation.x += (base.x - ref.current.current.rotation.x) * dt * 2;
          ref.current.current.rotation.y += (base.y - ref.current.current.rotation.y) * dt * 2;
          ref.current.current.rotation.z += (base.z - ref.current.current.rotation.z) * dt * 2;
        }
      });

      // Idle body sway
      if (groupRef.current) {
        groupRef.current.rotation.y = rotation[1] + Math.sin(t * 0.4) * 0.015;
        groupRef.current.rotation.z = Math.sin(t * 0.6) * 0.01;
      }

      // Occasional idle gestures (look around, shift weight)
      const idleCycle = t % 8;
      if (idleCycle < 0.5) {
        if (headRef.current.current) {
          const base = baseRotations.current.get(headRef.current.current) || new Euler();
          headRef.current.current.rotation.y = base.y + Math.sin(t * 2) * 0.15;
        }
      }
    }

    // ── EXPRESSION PRESETS ───────────────────────────────────
    if (expression === "confident") {
      vrm.expressionManager?.setValue("happy", 0.2);
      vrm.expressionManager?.setValue("angry", 0);
      vrm.expressionManager?.setValue("sad", 0);
      vrm.expressionManager?.setValue("surprised", 0.05);
    } else if (expression === "challenging") {
      vrm.expressionManager?.setValue("happy", 0);
      vrm.expressionManager?.setValue("angry", 0.15);
      vrm.expressionManager?.setValue("sad", 0);
      vrm.expressionManager?.setValue("surprised", 0);
    } else {
      vrm.expressionManager?.setValue("happy", 0);
      vrm.expressionManager?.setValue("angry", 0);
      vrm.expressionManager?.setValue("sad", 0);
      vrm.expressionManager?.setValue("surprised", 0);
    }

    vrm.update(dt);
  });

  return (
    <group ref={groupRef} rotation={rotation}>
      <primitive object={scene} />
    </group>
  );
}