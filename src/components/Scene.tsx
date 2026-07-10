import { Canvas } from '@react-three/fiber';
import { Environment, ContactShadows, Float, OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom, DepthOfField, Vignette, Noise } from '@react-three/postprocessing';
import { Cube } from './Cube';
import { Particles } from './Particles';
import { CameraRig } from './CameraRig';
import { useCubeStore } from '../store';

export function Scene({ isHovered, isRunning, view }: { isHovered: boolean; isRunning: boolean; view: string }) {
  const setCubeRef = useCubeStore(s => s.setCubeRef);
  
  return (
    <div className="fixed inset-0 w-full h-full z-0 pointer-events-auto">
      <Canvas
        camera={{ position: [0, 0, 12], fov: 35 }}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#020202']} />
        <fog attach="fog" args={['#020202', 10, 20]} />
        
        {/* Environment & Lighting */}
        <ambientLight intensity={0.1} />
        <spotLight position={[10, 20, 10]} angle={0.15} penumbra={1} intensity={2} castShadow color="#ffffff" />
        <pointLight position={[-10, -10, -10]} intensity={1.5} color="#4444ff" />
        <pointLight position={[10, 0, -10]} intensity={1.5} color="#ff4444" />
        
        <Environment preset="city" />

        {view === 'home' ? <CameraRig /> : (
          <OrbitControls 
            enablePan={false} 
            maxPolarAngle={Math.PI / 1.5} 
            minDistance={8} 
            maxDistance={15}
            makeDefault
          />
        )}

        <Float speed={isRunning ? 0 : 2} rotationIntensity={isRunning ? 0 : 0.5} floatIntensity={isRunning ? 0 : 1} floatingRange={[-0.2, 0.2]}>
          <group position={[0, 0.5, 0]}>
            <Cube ref={setCubeRef} isHovered={isHovered} isRunning={isRunning} view={view} />
          </group>
        </Float>
        
        {view !== 'galaxy' && <Particles count={1500} />}

        {/* Shadows to ground the cube */}
        <ContactShadows 
          position={[0, -3.5, 0]} 
          opacity={0.8} 
          scale={20} 
          blur={2.5} 
          far={4.5} 
          color="#000000"
        />

        {/* Cinematic Post-Processing */}
        <EffectComposer>
          <Bloom luminanceThreshold={0.2} mipmapBlur intensity={1.5} radius={0.8} />
          <DepthOfField focusDistance={0.02} focalLength={0.05} bokehScale={3} height={480} />
          <Noise opacity={0.02} />
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
