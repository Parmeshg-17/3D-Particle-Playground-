import React, { useMemo, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { AppConfig, GestureState } from '../types';
import { generateTargetPositions } from '../utils/particleHelpers';

// Shader code
const vertexShader = `
  attribute float size;
  attribute vec3 color;
  varying vec3 vColor;
  
  void main() {
    vColor = color;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  varying vec3 vColor;
  
  void main() {
    // Circular particle
    vec2 xy = gl_PointCoord.xy - vec2(0.5);
    float ll = length(xy);
    if (ll > 0.5) discard;
    
    // Soft edge
    float alpha = (0.5 - ll) * 2.0;
    gl_FragColor = vec4(vColor, alpha);
  }
`;

interface ParticlesProps {
  config: AppConfig;
  gestureRef: React.MutableRefObject<GestureState>;
}

const Particles: React.FC<ParticlesProps> = ({ config, gestureRef }) => {
  const meshRef = useRef<THREE.Points>(null);
  const targetPositionsRef = useRef<Float32Array>(new Float32Array(0));
  const currentPositionsRef = useRef<Float32Array>(new Float32Array(0));
  const velocitiesRef = useRef<Float32Array>(new Float32Array(0));
  
  // Initialize or update particles when count/shape changes
  const { positions, colors, sizes } = useMemo(() => {
    const count = config.particleCount;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const siz = new Float32Array(count);
    const color = new THREE.Color(config.baseColor);

    // Initial random scatter
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
      
      // Slight color variation
      const c = color.clone().offsetHSL(0, 0, (Math.random() - 0.5) * 0.2);
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;

      siz[i] = config.size * (0.5 + Math.random());
    }
    
    // Reset velocities
    velocitiesRef.current = new Float32Array(count * 3);
    currentPositionsRef.current = pos.slice();

    return { positions: pos, colors: col, sizes: siz };
  }, [config.particleCount, config.baseColor, config.size]);

  // Update target positions when shape changes
  useEffect(() => {
    targetPositionsRef.current = generateTargetPositions(config.particleCount, config.shape);
  }, [config.shape, config.particleCount]);

  // Animation Loop
  useFrame((state) => {
    if (!meshRef.current) return;

    const { hasHands, pinchStrength, center, handDistance, isClosed } = gestureRef.current;
    const positionsAttr = meshRef.current.geometry.attributes.position;
    const count = config.particleCount;
    
    const currentPos = currentPositionsRef.current;
    const targetPos = targetPositionsRef.current;
    const vels = velocitiesRef.current;

    // Settings
    const lerpSpeed = 0.03 + (config.interactionStrength * 0.05);
    const noiseAmp = config.noiseStrength * 0.02;
    const time = state.clock.getElapsedTime();

    // Interaction Factors
    // If pinching (closed), contract: scale factor < 1
    // If open, expand: scale factor > 1
    // Default scale 1
    let globalScale = 1;
    let spread = 0;

    if (hasHands) {
        // Map pinch 0 (open) -> 1 (closed)
        // Closed = Scale down (0.2)
        // Open = Scale up (1.5)
        // Neutral = 1.0
        // We use pinchStrength to interpolate
        
        // Inverse logic from prompt: "Hands closing -> particles contract"
        // PinchStrength 1 = Contract
        globalScale = 1.5 - (pinchStrength * 1.3); 
        
        // Hand distance affects zoom/scale too?
        // Let's use hand distance for an additional multiplier if 2 hands
        if (handDistance > 0) {
            globalScale *= (0.5 + handDistance); // 0.1 dist -> 0.6x, 0.8 dist -> 1.3x
        }

        // Mouse/Hand repulsion point
        // center is -1 to 1. Map to world space approx (-5 to 5)
        // Actually screen projection is needed but approx is fine for effect
    } else {
        // Idle animation breathing
        globalScale = 1 + Math.sin(time) * 0.1;
    }

    // Explosion trigger for fireworks
    const isExploding = config.shape === 'Fireworks' && !isClosed; 

    for (let i = 0; i < count; i++) {
        const ix = i * 3;
        const iy = ix + 1;
        const iz = ix + 2;

        let tx = targetPos[ix] * globalScale;
        let ty = targetPos[iy] * globalScale;
        let tz = targetPos[iz] * globalScale;

        // Add Noise
        tx += Math.sin(time * 2 + i) * noiseAmp;
        ty += Math.cos(time * 1.5 + i) * noiseAmp;
        tz += Math.sin(time * 0.5 + i) * noiseAmp;

        // Interaction: Repulse/Attract to hand center
        if (hasHands) {
            const handX = center.x * 5; // Aspect ratio approx
            const handY = center.y * 3;
            
            const dx = currentPos[ix] - handX;
            const dy = currentPos[iy] - handY;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            // If fist (isClosed), attract strongly like black hole
            // If open, repulse gently
            if (dist < 3.0) {
                const force = isClosed ? -0.1 : 0.05;
                vels[ix] += (dx / dist) * force * config.interactionStrength;
                vels[iy] += (dy / dist) * force * config.interactionStrength;
            }
        }

        // Physics Update
        // Move towards target
        const ax = (tx - currentPos[ix]) * lerpSpeed;
        const ay = (ty - currentPos[iy]) * lerpSpeed;
        const az = (tz - currentPos[iz]) * lerpSpeed;

        vels[ix] += ax;
        vels[iy] += ay;
        vels[iz] += az;

        // Damping
        vels[ix] *= 0.92;
        vels[iy] *= 0.92;
        vels[iz] *= 0.92;

        currentPos[ix] += vels[ix];
        currentPos[iy] += vels[iy];
        currentPos[iz] += vels[iz];

        // Update Buffer
        positionsAttr.setXYZ(i, currentPos[ix], currentPos[iy], currentPos[iz]);
    }
    
    positionsAttr.needsUpdate = true;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={sizes.length}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

const ParticleScene: React.FC<ParticlesProps> = (props) => {
  return (
    <div className="w-full h-screen bg-black relative">
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }} dpr={[1, 2]}>
        <color attach="background" args={['#050505']} />
        <ambientLight intensity={0.5} />
        <Particles {...props} />
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none" 
           style={{ background: 'radial-gradient(circle at 50% 50%, transparent 60%, rgba(0,0,0,0.8) 100%)' }} />
    </div>
  );
};

export default ParticleScene;