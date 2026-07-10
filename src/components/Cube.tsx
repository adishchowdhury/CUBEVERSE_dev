import { useRef, useMemo, useImperativeHandle, forwardRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RoundedBox } from '@react-three/drei';

export interface CubeRef {
  doMove: (move: string) => void;
  playSequence: (seq: string) => void;
  scramble: () => string;
  reset: () => void;
  isSolved: () => boolean;
}

const playTick = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300 + Math.random() * 50, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch (e) {}
};

const Sticker = ({ position, rotation, color, isHovered }: any) => (
  <mesh position={position} rotation={rotation}>
    <planeGeometry args={[0.9, 0.9]} />
    <meshPhysicalMaterial color={color} emissive={color} emissiveIntensity={isHovered ? 2 : 0.8} roughness={0.2} metalness={0.1} />
  </mesh>
);

const offset = 1.05;

export const Cube = forwardRef<CubeRef, { isHovered?: boolean, isRunning?: boolean, view?: string }>(({ isHovered: parentHovered, isRunning, view }, ref) => {
  const groupRef = useRef<THREE.Group>(null);
  const cubeletsRef = useRef<(THREE.Group | null)[]>([]);
  
  const [hoveredPiece, setHoveredPiece] = useState<number | null>(null);
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null);

  const { camera, controls } = useThree();
  const dragRef = useRef<{
    active: boolean; idx: number;
    x: number; y: number; z: number;
    faceNormal: THREE.Vector3;
    startX: number; startY: number;
  } | null>(null);

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!dragRef.current?.active) return;
      
      const state = dragRef.current;
      const dx = e.clientX - state.startX;
      const dy = e.clientY - state.startY;

      if (Math.abs(dx) > 20 || Math.abs(dy) > 20) {
        const swipeCam = new THREE.Vector3(dx, -dy, 0).normalize();
        const swipeWorld = swipeCam.transformDirection(camera.matrixWorld);
        const swipeLocal = swipeWorld.transformDirection(groupRef.current!.matrixWorld.clone().invert());
        
        const rotationVector = state.faceNormal.clone().cross(swipeLocal);
        
        let domAxis = 'x';
        let maxVal = Math.abs(rotationVector.x);
        if (Math.abs(rotationVector.y) > maxVal) { maxVal = Math.abs(rotationVector.y); domAxis = 'y'; }
        if (Math.abs(rotationVector.z) > maxVal) { maxVal = Math.abs(rotationVector.z); domAxis = 'z'; }

        const sign = Math.sign(rotationVector[domAxis as 'x' | 'y' | 'z']);
        const layer = Math.round(state[domAxis as keyof typeof state] as number);
        
        let moveStr = '';
        if (domAxis === 'x') {
           if (layer === 1) moveStr = sign < 0 ? "R" : "R'";
           else if (layer === -1) moveStr = sign < 0 ? "L'" : "L";
           else moveStr = sign < 0 ? "M'" : "M";
        } else if (domAxis === 'y') {
           if (layer === 1) moveStr = sign < 0 ? "U" : "U'";
           else if (layer === -1) moveStr = sign < 0 ? "D'" : "D";
           else moveStr = sign < 0 ? "E'" : "E";
        } else if (domAxis === 'z') {
           if (layer === 1) moveStr = sign < 0 ? "F" : "F'";
           else if (layer === -1) moveStr = sign < 0 ? "B'" : "B";
           else moveStr = sign < 0 ? "S" : "S'";
        }

        if (moveStr) queue.current.push(moveStr);
        dragRef.current = null;
        if (controls) (controls as any).enabled = true;
      }
    };

    const handlePointerUp = () => { 
      dragRef.current = null; 
      if (controls) (controls as any).enabled = true;
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      if (controls) (controls as any).enabled = true;
    };
  }, [camera, controls]);

  const onPointerDown = (e: any, p: any) => {
    e.stopPropagation();
    if (currentMove.current || queue.current.length > 0) return;
    if (controls) (controls as any).enabled = false;

    const normal = e.face?.normal?.clone() || new THREE.Vector3(0,0,1);
    const normalMatrix = new THREE.Matrix3().getNormalMatrix(e.object.matrixWorld);
    normal.applyMatrix3(normalMatrix).normalize();
    
    if (groupRef.current) {
       const cubeMatInv = new THREE.Matrix3().getNormalMatrix(groupRef.current.matrixWorld).invert();
       normal.applyMatrix3(cubeMatInv).normalize();
    }
    
    const axes = [
      new THREE.Vector3(1,0,0), new THREE.Vector3(-1,0,0),
      new THREE.Vector3(0,1,0), new THREE.Vector3(0,-1,0),
      new THREE.Vector3(0,0,1), new THREE.Vector3(0,0,-1)
    ];
    let bestAxis = axes[0];
    let maxDot = -Infinity;
    for (const a of axes) {
      const d = normal.dot(a);
      if (d > maxDot) { maxDot = d; bestAxis = a; }
    }

    dragRef.current = {
      active: true, idx: p.idx,
      x: p.x, y: p.y, z: p.z,
      faceNormal: bestAxis,
      startX: e.clientX, startY: e.clientY
    };
  };

  const queue = useRef<string[]>([]);
  const currentMove = useRef<{ axis: 'x'|'y'|'z', layer: number, angle: number, currentAngle: number, pieces: THREE.Group[], speed: number } | null>(null);

  const initialPieces = useMemo(() => {
    const p = [];
    let i = 0;
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          p.push({ x, y, z, idx: i++ });
        }
      }
    }
    return p;
  }, []);

  useImperativeHandle(ref, () => ({
    doMove: (move: string) => {
      queue.current.push(move);
    },
    playSequence: (seq: string) => {
      const moves = seq.split(' ').filter(m => m.trim().length > 0);
      queue.current.push(...moves);
    },
    scramble: () => {
      const moves = ['R', "R'", 'L', "L'", 'U', "U'", 'D', "D'", 'F', "F'", 'B', "B'"];
      const generated = [];
      for (let i=0; i<20; i++) {
        const move = moves[Math.floor(Math.random() * moves.length)];
        generated.push(move);
        queue.current.push(move + " FAST");
      }
      return generated.join(" ");
    },
    reset: () => {
      queue.current = [];
      currentMove.current = null;
      initialPieces.forEach((p, i) => {
        const c = cubeletsRef.current[i];
        if (c) {
          c.position.set(p.x * offset, p.y * offset, p.z * offset);
          c.quaternion.identity();
          c.updateMatrix();
        }
      });
    },
    isSolved: () => {
      if (currentMove.current || queue.current.length > 0) return false;
      if (!groupRef.current) return false;
      
      const normalsByColor: Record<string, THREE.Vector3[]> = {};
      
      groupRef.current.updateMatrixWorld();
      
      cubeletsRef.current.forEach(piece => {
        if (!piece) return;
        piece.children.forEach(child => {
          if (child.type === 'Mesh' && (child as THREE.Mesh).geometry.type === 'PlaneGeometry') {
            const mat = (child as THREE.Mesh).material as THREE.MeshPhysicalMaterial;
            const color = mat.color.getHexString();
            
            const normalMatrix = new THREE.Matrix3().getNormalMatrix(child.matrixWorld);
            const normal = new THREE.Vector3(0, 0, 1).applyMatrix3(normalMatrix).normalize();
            
            normal.x = Math.round(normal.x);
            normal.y = Math.round(normal.y);
            normal.z = Math.round(normal.z);
            
            if (!normalsByColor[color]) normalsByColor[color] = [];
            normalsByColor[color].push(normal);
          }
        });
      });
      
      for (const color in normalsByColor) {
        const normals = normalsByColor[color];
        if (normals.length === 0) continue;
        const first = normals[0];
        for (let i = 1; i < normals.length; i++) {
          if (!normals[i].equals(first)) return false;
        }
      }
      
      return true;
    }
  }));

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    // Clamp delta to prevent explosion if browser lags
    const dt = Math.min(delta, 0.1);
    
    // Smoothly transition cube position based on view/state
    const targetX = 0; // Always keep the cube centered
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, dt * 3);
    
    // Ambient rotation
    if (!currentMove.current && queue.current.length === 0) {
      if (isRunning) {
        // Completely stable and still during solving so user can focus
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, 0, dt * 4);
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0, dt * 4);
      } else if (view === 'home' || view === 'library') {
        groupRef.current.rotation.y += dt * 0.1;
        groupRef.current.rotation.x += dt * 0.05;
      } else {
        // In nexus, snap to user view, no auto rotation so they can see moves clearly
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, 0, dt * 4);
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0, dt * 4);
      }
    }

    if (!currentMove.current && queue.current.length > 0) {
      let moveStr = queue.current.shift()!;
      let speedMultiplier = 1;
      if (moveStr.includes("FAST")) {
        speedMultiplier = 4;
        moveStr = moveStr.replace(" FAST", "");
      }

      let axis: 'x'|'y'|'z' = 'x';
      let layer = 1;
      let angle = -Math.PI / 2;

      if (moveStr.startsWith('R')) { axis = 'x'; layer = 1; angle = -Math.PI / 2; }
      else if (moveStr.startsWith('L')) { axis = 'x'; layer = -1; angle = Math.PI / 2; }
      else if (moveStr.startsWith('U')) { axis = 'y'; layer = 1; angle = -Math.PI / 2; }
      else if (moveStr.startsWith('D')) { axis = 'y'; layer = -1; angle = Math.PI / 2; }
      else if (moveStr.startsWith('F')) { axis = 'z'; layer = 1; angle = -Math.PI / 2; }
      else if (moveStr.startsWith('B')) { axis = 'z'; layer = -1; angle = Math.PI / 2; }
      else if (moveStr.startsWith('M')) { axis = 'x'; layer = 0; angle = Math.PI / 2; }
      else if (moveStr.startsWith('E')) { axis = 'y'; layer = 0; angle = Math.PI / 2; }
      else if (moveStr.startsWith('S')) { axis = 'z'; layer = 0; angle = -Math.PI / 2; }
      
      if (moveStr.includes("'")) angle *= -1;
      if (moveStr.includes("2")) angle *= 2;

      const eps = 0.1;
      const activePieces = cubeletsRef.current.filter(piece => {
        if (!piece) return false;
        const pos = piece.position;
        return Math.abs(pos[axis] - layer * offset) < eps;
      }) as THREE.Group[];

      currentMove.current = {
        axis, layer, angle, currentAngle: 0, pieces: activePieces, speed: 10 * speedMultiplier
      };
    }

    if (currentMove.current) {
      const move = currentMove.current;
      const remaining = Math.abs(move.angle - move.currentAngle);
      const speedFactor = Math.max(0.15, Math.pow(remaining / Math.abs(move.angle), 0.5));
      const step = Math.sign(move.angle) * dt * move.speed * speedFactor * 2; 
      
      let nextAngle = move.currentAngle + step;
      let isFinished = false;
      if (Math.abs(nextAngle) >= Math.abs(move.angle)) {
        nextAngle = move.angle;
        isFinished = true;
      }

      const diff = nextAngle - move.currentAngle;
      move.currentAngle = nextAngle;

      const q = new THREE.Quaternion();
      const axisVec = new THREE.Vector3();
      axisVec[move.axis] = 1;
      q.setFromAxisAngle(axisVec, diff);

      move.pieces.forEach(p => {
        p.position.applyQuaternion(q);
        p.quaternion.premultiply(q);
      });

      if (isFinished) {
        playTick();
        move.pieces.forEach(p => {
          // Snap position to exactly align with grid
          p.position.x = Math.round(p.position.x / offset) * offset;
          p.position.y = Math.round(p.position.y / offset) * offset;
          p.position.z = Math.round(p.position.z / offset) * offset;
          
          // Snap quaternion rotation to exact 90-degree orthogonal matrices to eliminate drift
          const mat = new THREE.Matrix4().makeRotationFromQuaternion(p.quaternion);
          for (let j = 0; j < 16; j++) {
             mat.elements[j] = Math.round(mat.elements[j]);
          }
          p.quaternion.setFromRotationMatrix(mat);
        });
        currentMove.current = null;
      }
    }
  });

  return (
    <group ref={groupRef}>
      {initialPieces.map((p) => {
        const isHovered = hoveredPiece === p.idx || parentHovered;
        const isSelected = selectedPiece === p.idx;
        return (
          <group 
            key={p.idx} 
            position={[p.x * offset, p.y * offset, p.z * offset]} 
            ref={(el) => cubeletsRef.current[p.idx] = el}
            onPointerOver={(e) => { e.stopPropagation(); setHoveredPiece(p.idx); }}
            onPointerOut={(e) => { setHoveredPiece(null); }}
            onPointerDown={(e) => onPointerDown(e, p)}
            onClick={(e) => { e.stopPropagation(); setSelectedPiece(p.idx === selectedPiece ? null : p.idx); }}
          >
            <RoundedBox args={[1, 1, 1]} radius={0.1} smoothness={4} castShadow receiveShadow>
              <meshPhysicalMaterial color="#111111" metalness={0.8} roughness={0.2} clearcoat={1} emissive="#00D1FF" emissiveIntensity={isSelected ? 0.5 : 0} />
            </RoundedBox>
            {p.x === 1 && <Sticker position={[0.51, 0, 0]} rotation={[0, Math.PI / 2, 0]} color="#ff0000" isHovered={isHovered} />}
            {p.x === -1 && <Sticker position={[-0.51, 0, 0]} rotation={[0, -Math.PI / 2, 0]} color="#ff8800" isHovered={isHovered} />}
            {p.y === 1 && <Sticker position={[0, 0.51, 0]} rotation={[-Math.PI / 2, 0, 0]} color="#ffffff" isHovered={isHovered} />}
            {p.y === -1 && <Sticker position={[0, -0.51, 0]} rotation={[Math.PI / 2, 0, 0]} color="#ffd500" isHovered={isHovered} />}
            {p.z === 1 && <Sticker position={[0, 0, 0.51]} rotation={[0, 0, 0]} color="#00ff00" isHovered={isHovered} />}
            {p.z === -1 && <Sticker position={[0, 0, -0.51]} rotation={[0, Math.PI, 0]} color="#0000ff" isHovered={isHovered} />}
          </group>
        );
      })}
    </group>
  );
});
