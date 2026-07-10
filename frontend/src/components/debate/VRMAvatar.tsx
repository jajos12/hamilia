"use client";

import { useRef, useEffect, useState } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { VRM, VRMLoaderPlugin, VRMUtils } from "@pixiv/three-vrm";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Box3, Vector3, Group } from "three";

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

  useEffect(() => {
    const vrm = (scene as Group & { userData: { vrm?: VRM } }).userData.vrm;
    if (vrm) {
      VRMUtils.removeUnnecessaryVertices(vrm.scene);
      VRMUtils.removeUnnecessaryJoints(vrm.scene);
      vrm.scene.traverse((obj) => {
        obj.frustumCulled = false;
      });
      vrmRef.current = vrm;

      // Auto-fit: calculate bounding box and center/scale
      const box = new Box3().setFromObject(vrm.scene);
      const size = box.getSize(new Vector3());
      const center = box.getCenter(new Vector3());

      // Target height: fill ~85% of viewport height
      const targetHeight = 2.2;
      const scale = targetHeight / size.y;

      if (groupRef.current) {
        // Center horizontally
        groupRef.current.position.x = -center.x * scale;
        // Position feet at y=0 (bottom of container)
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

    // Idle: subtle breathing
    vrm.expressionManager.setValue("oh", Math.sin(t * 2) * 0.05);

    // Idle: blink every ~3-5 seconds
    const blinkCycle = t % (3 + Math.sin(t * 0.3) * 2);
    if (blinkCycle > 2.8) {
      vrm.expressionManager.setValue("blink", 1);
    } else {
      vrm.expressionManager.setValue("blink", 0);
    }

    // Speaking: mouth movement
    if (isSpeaking) {
      const mouthOpen = Math.sin(t * 14) * 0.3 + 0.5;
      vrm.expressionManager.setValue("aa", mouthOpen);
      if (groupRef.current) {
        groupRef.current.rotation.y =
          rotation[1] + Math.sin(t * 1.5) * 0.03;
        groupRef.current.rotation.z = Math.sin(t * 2.3) * 0.02;
      }
    } else {
      vrm.expressionManager.setValue("aa", 0);
      if (groupRef.current) {
        groupRef.current.rotation.y = rotation[1];
        groupRef.current.rotation.z = 0;
      }
    }

    // Expression presets
    if (expression === "confident") {
      vrm.expressionManager.setValue("happy", 0.15);
      vrm.expressionManager.setValue("angry", 0);
    } else if (expression === "challenging") {
      vrm.expressionManager.setValue("happy", 0);
      vrm.expressionManager.setValue("angry", 0.1);
    } else {
      vrm.expressionManager.setValue("happy", 0);
      vrm.expressionManager.setValue("angry", 0);
    }

    vrm.update(state.clock.getDelta());
  });

  return (
    <group ref={groupRef} rotation={rotation}>
      <primitive object={scene} />
    </group>
  );
}
