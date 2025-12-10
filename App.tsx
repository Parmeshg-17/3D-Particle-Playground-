import React, { useState, useRef } from 'react';
import ParticleScene from './components/ParticleScene';
import ControlPanel from './components/ControlPanel';
import HandController from './components/HandController';
import { AppConfig, GestureState, ParticleShape } from './types';

const App: React.FC = () => {
  // Application State
  const [config, setConfig] = useState<AppConfig>({
    particleCount: 8000,
    baseColor: '#55ffff',
    shape: ParticleShape.SPHERE,
    enableCamera: false,
    noiseStrength: 1.0,
    interactionStrength: 1.0,
    size: 1.2
  });

  // Mutable Gesture State (High frequency updates)
  const gestureRef = useRef<GestureState>({
    hasHands: false,
    pinchStrength: 0,
    handDistance: 0.5,
    center: { x: 0, y: 0 },
    isClosed: false
  });

  const handleGestureUpdate = (state: GestureState) => {
    gestureRef.current = state;
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black text-white font-sans selection:bg-purple-500/30">
      
      {/* 3D Scene Layer */}
      <div className="absolute inset-0 z-10">
        <ParticleScene config={config} gestureRef={gestureRef} />
      </div>

      {/* UI Overlay Layer */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        {/* Pointer events auto-enabled on children */}
        <div className="pointer-events-auto">
          <ControlPanel config={config} setConfig={setConfig} />
        </div>
        
        {/* Hand Tracker (Hidden or PIP) */}
        <div className="pointer-events-auto">
            <HandController enabled={config.enableCamera} onUpdate={handleGestureUpdate} />
        </div>
      </div>

      {/* Loading Overlay (Optional, if needed) */}
    </div>
  );
};

export default App;