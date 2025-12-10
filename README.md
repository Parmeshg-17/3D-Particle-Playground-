ZenParticles (3D Gesture Particle Playground)

ZenParticles is a single-file interactive 3D particle playground that uses your webcam (MediaPipe Hands) to detect hand gestures in real time and control a GPU-friendly particle system built with Three.js. This README explains how to run, use, tweak and extend the project.

Contents

zenparticles.html — single-file HTML/JS/CSS (the app)

(optional) exported assets created at runtime (screenshots, recordings)

Quick start

Save the delivered single-file content as zenparticles.html.

Open it in a modern, hardware-accelerated browser (Chrome, Edge, Firefox).

For camera input, open via file:// works in most browsers, but some browsers restrict camera access for files — if camera permission fails, host it on a static server (example: npx http-server or python -m http.server).

Allow camera access when prompted. If you deny access or your device lacks a camera, use the manual fallback (mouse/touch).

Controls & UI
Gesture controls (camera / MediaPipe Hands)

Open hands (fingers spread) → particles expand, spread and emission increases.

Close hands (fist) → particles contract and calm.

Hands distance: moving hands closer or further creates a subtle global scale change.

Quick closing 'snap': a rapid closing motion triggers a fireworks burst when the Fireworks template is selected.

Mouse / touch fallback

Click Enable mouse/touch.

Drag vertically → change global scale (up to expand, down to contract).

Drag horizontally → change spread/emission.

UI elements

Template selector — choose from Hearts, Flowers, Saturn, Buddha, Fireworks.

Color picker — change particle hue in real-time.

Sliders — particle count, particle size, motion/noise strength.

Toggle — enable/disable camera gesture control.

Screenshot — save canvas as PNG.

Record — save a short WebM recording (default 5s).

Keyboard shortcuts:

Space — toggle camera on/off

R — reset view

S — take screenshot

Performance & compatibility

The system uses Three.js Points and a custom GLSL shader for GPU-friendly rendering.

requestAnimationFrame is used for animations; canvas is rendered at device pixel ratio (DPR up to 2).

Auto-fallback: If your device appears low-end (low deviceMemory or few CPU cores), the app automatically reduces particle count and default sizes.

If you experience low framerate:

Lower Particle Count.

Lower Particle Size and Noise.

Close background tabs and use a hardware-accelerated browser (Chrome/Edge recommended).

Camera permission & troubleshooting

If camera permission is denied:

The app shows a clear UX message and you can enable mouse/touch controls.

For local file:// usage, some browsers may block the camera. Serve the file via a local static server:

Node: npx http-server

Python 3: python -m http.server 8000

If hand detection is jittery:

Improve lighting (bright, even light), place hands against a contrasting background, bring hands closer to the camera for better tracking.

If no hands are detected:

Make sure camera is enabled in the browser and MediaPipe Hands has loaded.

Where gesture thresholds live (tweakable)

Open zenparticles.html in an editor and find the gesture constants near the top of the script:

// Gesture thresholds & tweakable constants
const GESTURE_THRESHOLD_SPREAD = 0.12; // normalized finger-tip spread threshold (open vs closed)
const GESTURE_THRESHOLD_SNAP_VELOCITY = 0.65; // quick closing velocity to trigger fireworks
const HANDS_MIN_CONFIDENCE = 0.6; // detection confidence


Increase GESTURE_THRESHOLD_SPREAD to require a wider finger spread to count as "open".

Lower GESTURE_THRESHOLD_SNAP_VELOCITY to make the snap/closing detection more sensitive (fires easier).

HANDS_MIN_CONFIDENCE affects how strict detection/tracking must be for events to fire.

Swapping or changing the hand-pose model

The app uses MediaPipe Hands (CDN: @mediapipe/hands), which offers a fast, accurate model for browser-based hand tracking. To swap for another model (e.g., TensorFlow.js HandPose or a custom model), change the initMediaPipe() function and onHandsResults():

Replace the Hands and Camera setup with your model's initialization and frame feed.

Keep the processing interface so onHandsResults(results) receives a landmarks array similar to MediaPipe:

results.multiHandLandmarks — array of hands, each with normalized {x,y,z} landmarks.

Update the handSpread() function logic if the landmark indexing differs.

Key places to edit:

initMediaPipe() — current MediaPipe instantiation.

onHandsResults(results) — how landmarks are parsed and converted into spread, distance and snap signals.

Code structure & extension points

Main components (all inside the single HTML):

Three.js setup (initThree, initPoints) — renderer, scene, camera, shader-based Points.

Textures (loadParticleTextures) — canvas-generated sprites for each template.

Gesture handling (initMediaPipe, onHandsResults, updateGestureState) — converts landmarks to control parameters.

Template behaviors — selectTemplate() and spawnFireworkBurst() for fireworks.

UI & controls — event listeners for sliders, toggles, screenshot & recording.

Performance fallback — autoFallback() adjusts defaults for low-end devices.

To add:

New particle templates: add a canvas texture in loadParticleTextures() and add an entry to the templates list.

GPU-based physics: migrate particle positions to GPGPU (ping-pong FBOs) for much larger particle counts.

SDF shapes in shader: replace canvas textures with analytic signed-distance functions in GLSL for crisper scaling.

Licensing & credits

ZenParticles — provided as an example/demo. Use freely for personal and non-commercial experiments.

Uses:

Three.js (MIT)

MediaPipe Hands (Apache 2.0)

If you reuse or redistribute parts of the code, please retain attribution.

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1PPYTUt_EnGOBdguCk1FbrsQ8UXFvSJB1

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
