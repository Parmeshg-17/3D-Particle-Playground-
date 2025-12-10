import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker, HandLandmarkerResult } from '@mediapipe/tasks-vision';
import { GestureState } from '../types';

interface HandControllerProps {
  onUpdate: (state: GestureState) => void;
  enabled: boolean;
}

const HandController: React.FC<HandControllerProps> = ({ onUpdate, enabled }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loaded, setLoaded] = useState(false);
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const requestRef = useRef<number>();
  const lastVideoTime = useRef<number>(-1);

  // Initialize MediaPipe
  useEffect(() => {
    if (!enabled) return;

    const init = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );
        const landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 2
        });
        handLandmarkerRef.current = landmarker;
        setLoaded(true);
      } catch (err) {
        console.error("Failed to load MediaPipe:", err);
      }
    };

    init();

    return () => {
      if (handLandmarkerRef.current) {
        handLandmarkerRef.current.close();
      }
    };
  }, [enabled]);

  // Start Webcam
  useEffect(() => {
    if (!enabled || !loaded || !videoRef.current) return;

    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: 640, height: 480, frameRate: 30 } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.addEventListener("loadeddata", predictWebcam);
        }
      } catch (err) {
        console.error("Camera access denied or failed", err);
      }
    };

    startWebcam();

    return () => {
      // Cleanup stream
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, loaded]);

  const predictWebcam = () => {
    if (!handLandmarkerRef.current || !videoRef.current) return;

    const startTimeMs = performance.now();
    
    // Detect only if frame has changed
    if (videoRef.current.currentTime !== lastVideoTime.current) {
      lastVideoTime.current = videoRef.current.currentTime;
      const result = handLandmarkerRef.current.detectForVideo(videoRef.current, startTimeMs);
      processResults(result);
    }
    
    requestRef.current = requestAnimationFrame(predictWebcam);
  };

  const processResults = (result: HandLandmarkerResult) => {
    const hands = result.landmarks;
    const hasHands = hands && hands.length > 0;
    
    let pinchStrength = 0;
    let center = { x: 0, y: 0 };
    let handDistance = 0.5; // Default middle
    
    if (hasHands) {
      // 1. Calculate Pinch (Thumb Tip to Index Tip)
      // Landmark 4 = Thumb Tip, 8 = Index Tip
      let totalPinch = 0;
      
      hands.forEach(hand => {
        const thumb = hand[4];
        const index = hand[8];
        const dist = Math.hypot(thumb.x - index.x, thumb.y - index.y, thumb.z - index.z);
        // Normalize: dist usually 0.02 (closed) to 0.2 (open)
        // Map to 0 (open) -> 1 (closed)
        const closed = Math.max(0, Math.min(1, 1 - (dist - 0.02) / 0.15));
        totalPinch += closed;
      });
      pinchStrength = totalPinch / hands.length;

      // 2. Calculate Center (Average of all wrist points)
      let cx = 0, cy = 0;
      hands.forEach(hand => {
        cx += hand[0].x; // Wrist
        cy += hand[0].y;
      });
      // Map to -1 to 1 coordinates (Webcam is mirrored usually, so flip X)
      center = {
        x: (1 - (cx / hands.length)) * 2 - 1,
        y: -( (cy / hands.length) * 2 - 1 ) // Y is inverted in 3D
      };

      // 3. Hand Distance (if 2 hands)
      if (hands.length === 2) {
        const h1 = hands[0][0]; // Wrist hand 1
        const h2 = hands[1][0]; // Wrist hand 2
        const d = Math.hypot(h1.x - h2.x, h1.y - h2.y);
        handDistance = d; // Usually 0.1 to 0.8
      }
    }

    onUpdate({
      hasHands,
      pinchStrength,
      handDistance,
      center,
      isClosed: pinchStrength > 0.7
    });
  };

  return (
    <div className={`fixed bottom-4 left-4 z-40 transition-opacity duration-500 ${enabled ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="relative overflow-hidden rounded-lg border border-white/20 shadow-lg bg-black/80">
        <video 
          ref={videoRef}
          autoPlay 
          playsInline
          muted
          className={`w-32 h-24 object-cover transform -scale-x-100 ${loaded ? 'opacity-60' : 'opacity-0'}`}
        />
        {!loaded && enabled && (
            <div className="absolute inset-0 flex items-center justify-center text-xs text-white/50">
                Loading AI...
            </div>
        )}
        <div className="absolute bottom-1 right-1">
            <div className={`w-2 h-2 rounded-full ${loaded ? 'bg-green-500' : 'bg-red-500'}`} />
        </div>
      </div>
    </div>
  );
};

export default HandController;