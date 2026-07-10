import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

export function CameraRig() {
  const target = useRef(new THREE.Vector3(0, 0, 12));

  useFrame((state, delta) => {
    // Clamp delta
    const dt = Math.min(delta, 0.1);
    
    // Calculate pointer-based target position
    // Normalizing pointer coordinates roughly between -1 and 1
    const x = (state.pointer.x * state.viewport.width) / 10;
    const y = (state.pointer.y * state.viewport.height) / 10;

    target.current.set(x, y, 12);
    
    // Lerp the camera position towards the target
    state.camera.position.lerp(target.current, dt * 2);
    state.camera.lookAt(0, 0, 0);
  });

  return null;
}
