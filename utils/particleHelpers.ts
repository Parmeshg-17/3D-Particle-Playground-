import { ParticleShape } from '../types';
import * as THREE from 'three';

const RANDOM_SEED = 0.5;

// Helper to get random point in sphere
const randomInSphere = () => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = Math.cbrt(Math.random());
  const sinPhi = Math.sin(phi);
  return new THREE.Vector3(
    r * sinPhi * Math.cos(theta),
    r * sinPhi * Math.sin(theta),
    r * Math.cos(phi)
  );
};

export const generateTargetPositions = (count: number, shape: ParticleShape, scale: number = 2): Float32Array => {
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    let x = 0, y = 0, z = 0;
    const idx = i * 3;

    switch (shape) {
      case ParticleShape.SPHERE: {
        const p = randomInSphere();
        x = p.x; y = p.y; z = p.z;
        break;
      }
      case ParticleShape.CUBE: {
        x = (Math.random() - 0.5) * 1.5;
        y = (Math.random() - 0.5) * 1.5;
        z = (Math.random() - 0.5) * 1.5;
        break;
      }
      case ParticleShape.HEART: {
        // Parametric heart
        const t = Math.random() * Math.PI * 2;
        const u = Math.random(); // volume
        // Heart curve
        const hx = 16 * Math.pow(Math.sin(t), 3);
        const hy = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
        // Add some volume thickness
        const thickness = (Math.random() - 0.5) * 4;
        
        x = (hx / 16) * 1.2;
        y = (hy / 16) * 1.2;
        z = thickness * 0.1; 
        break;
      }
      case ParticleShape.FLOWER: {
        // Rose/Flower polar curve
        const k = 4; // petals
        const theta = Math.random() * Math.PI * 2;
        const r = Math.cos(k * theta); 
        const rad = Math.sqrt(Math.random()) * r + 0.2; // Fill
        
        x = rad * Math.cos(theta);
        y = rad * Math.sin(theta);
        // Curve z slightly for 3D effect
        z = Math.sin(rad * Math.PI) * 0.3 + (Math.random() - 0.5) * 0.1;
        break;
      }
      case ParticleShape.SATURN: {
        const isRing = Math.random() > 0.4;
        if (isRing) {
            // Ring
            const theta = Math.random() * Math.PI * 2;
            const radius = 1.2 + Math.random() * 0.8;
            x = Math.cos(theta) * radius;
            z = Math.sin(theta) * radius;
            y = (Math.random() - 0.5) * 0.05;
            
            // Tilt the ring
            const tilt = Math.PI / 6;
            const ty = y * Math.cos(tilt) - z * Math.sin(tilt);
            const tz = y * Math.sin(tilt) + z * Math.cos(tilt);
            y = ty;
            z = tz;
        } else {
            // Planet body
            const p = randomInSphere();
            x = p.x * 0.8;
            y = p.y * 0.8;
            z = p.z * 0.8;
        }
        break;
      }
      case ParticleShape.BUDDHA: {
        // Simplified Meditating figure approximation (stacked ovals)
        const rand = Math.random();
        if (rand < 0.3) {
            // Head
            const p = randomInSphere();
            x = p.x * 0.25;
            y = p.y * 0.3 + 0.6;
            z = p.z * 0.25;
        } else if (rand < 0.7) {
            // Body / Torso
            x = (Math.random() - 0.5) * 0.7 * (1 - Math.abs(Math.random()-0.5));
            y = (Math.random() - 0.5) * 0.8; 
            z = (Math.random() - 0.5) * 0.4;
        } else {
            // Legs / Base
            const theta = Math.random() * Math.PI; // Half circle
            const r = 0.5 + Math.random() * 0.3;
            x = Math.cos(theta) * r;
            y = -0.5 + (Math.random() * 0.2);
            z = (Math.random() - 0.5) * 0.5;
        }
        break;
      }
      case ParticleShape.FIREWORKS: {
        // Explosion origin is 0,0,0, particles scattered outwards
        // We actually want them concentrated in center then exploded. 
        // For the static shape target, let's make a large sphere burst.
        const p = randomInSphere();
        const dist = 0.2 + Math.random() * 2.5; // varied distance
        x = p.x * dist;
        y = p.y * dist;
        z = p.z * dist;
        break;
      }
    }

    positions[idx] = x * scale;
    positions[idx + 1] = y * scale;
    positions[idx + 2] = z * scale;
  }

  return positions;
};