import React from 'react';
import { AppConfig, ParticleShape } from '../types';
import { Camera, MousePointer2, Settings2, RefreshCcw, Hand, Maximize2, Minimize2 } from 'lucide-react';

interface ControlPanelProps {
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
  fps?: number;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ config, setConfig }) => {
  const shapes = Object.values(ParticleShape);

  const updateConfig = (key: keyof AppConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed top-4 right-4 z-50 w-80 max-h-[90vh] overflow-y-auto bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-5 text-white shadow-2xl transition-all duration-300">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          ZenParticles
        </h1>
        <div className="p-2 rounded-full bg-white/5">
            <Settings2 size={18} className="text-white/70" />
        </div>
      </div>

      {/* Camera Toggle */}
      <div className="mb-6">
        <button
          onClick={() => updateConfig('enableCamera', !config.enableCamera)}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
            config.enableCamera 
              ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-900/20' 
              : 'bg-white/10 hover:bg-white/20 text-white/80'
          }`}
        >
          {config.enableCamera ? <Camera size={20} /> : <MousePointer2 size={20} />}
          {config.enableCamera ? 'Camera Control On' : 'Use Mouse Mode'}
        </button>
        <p className="text-xs text-white/40 mt-2 text-center">
            {config.enableCamera 
                ? "Close hand to contract. Open to expand." 
                : "Mouse controls orbit. Auto-play mode."}
        </p>
      </div>

      {/* Shape Selector */}
      <div className="mb-6">
        <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3 block">
            Shape Template
        </label>
        <div className="grid grid-cols-3 gap-2">
          {shapes.map((s) => (
            <button
              key={s}
              onClick={() => updateConfig('shape', s)}
              className={`text-xs py-2 px-1 rounded-lg transition-all border ${
                config.shape === s
                  ? 'bg-blue-600/30 border-blue-500 text-blue-100'
                  : 'bg-white/5 border-transparent hover:bg-white/10 text-white/60'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div className="mb-6">
         <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3 block">
            Particle Color
        </label>
        <div className="flex gap-2">
            {['#ffffff', '#ff5555', '#55ff55', '#5555ff', '#ff55ff', '#55ffff', '#ffff55'].map(c => (
                <button
                    key={c}
                    onClick={() => updateConfig('baseColor', c)}
                    className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${
                        config.baseColor === c ? 'border-white' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c }}
                />
            ))}
            <input 
                type="color" 
                value={config.baseColor} 
                onChange={(e) => updateConfig('baseColor', e.target.value)}
                className="w-6 h-6 rounded-full overflow-hidden opacity-0 absolute ml-[calc(100%-2rem)] cursor-pointer"
            />
        </div>
      </div>

      {/* Sliders */}
      <div className="space-y-4 mb-4">
        <div>
            <div className="flex justify-between text-xs text-white/60 mb-1">
                <span>Particle Count</span>
                <span>{config.particleCount}</span>
            </div>
            <input
                type="range"
                min="1000"
                max="15000"
                step="1000"
                value={config.particleCount}
                onChange={(e) => updateConfig('particleCount', parseInt(e.target.value))}
                className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
            />
        </div>
        <div>
            <div className="flex justify-between text-xs text-white/60 mb-1">
                <span>Size</span>
                <span>{config.size.toFixed(1)}</span>
            </div>
            <input
                type="range"
                min="0.1"
                max="3.0"
                step="0.1"
                value={config.size}
                onChange={(e) => updateConfig('size', parseFloat(e.target.value))}
                className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
            />
        </div>
        <div>
            <div className="flex justify-between text-xs text-white/60 mb-1">
                <span>Noise / Chaos</span>
                <span>{config.noiseStrength}</span>
            </div>
            <input
                type="range"
                min="0"
                max="5"
                step="0.1"
                value={config.noiseStrength}
                onChange={(e) => updateConfig('noiseStrength', parseFloat(e.target.value))}
                className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
            />
        </div>
      </div>

      {/* Footer Instructions */}
      <div className="pt-4 border-t border-white/10 text-[10px] text-white/40 leading-relaxed">
        <p className="flex items-center gap-2 mb-1">
            <Hand size={12} /> Gestures:
        </p>
        <ul className="list-disc pl-4 space-y-1">
            <li>Open hand to expand</li>
            <li>Fist to collapse (Black hole mode)</li>
            <li>Two hands to scale scene</li>
        </ul>
      </div>

    </div>
  );
};

export default ControlPanel;