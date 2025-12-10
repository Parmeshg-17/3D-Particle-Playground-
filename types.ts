export enum ParticleShape {
  SPHERE = 'Sphere',
  CUBE = 'Cube',
  HEART = 'Heart',
  FLOWER = 'Flower',
  SATURN = 'Saturn',
  BUDDHA = 'Buddha',
  FIREWORKS = 'Fireworks',
}

export interface GestureState {
  hasHands: boolean;
  pinchStrength: number; // 0 (open) to 1 (closed)
  handDistance: number; // Normalized distance between hands
  center: { x: number; y: number }; // Normalized screen coordinates (-1 to 1)
  isClosed: boolean;
}

export interface AppConfig {
  particleCount: number;
  baseColor: string;
  shape: ParticleShape;
  enableCamera: boolean;
  noiseStrength: number;
  interactionStrength: number;
  size: number;
}