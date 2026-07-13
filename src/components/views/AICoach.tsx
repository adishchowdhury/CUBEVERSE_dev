import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Mic, Square } from 'lucide-react';
import { VapourText } from '../VapourText';

// --- Constants ---
const PALETTE = {
    dark: "#080000",
    light: "#fff",
    skin: "hsl(120, 40%, 80%)",
    skinHighlight: "hsl(120, 40%, 90%)",
    skinShadow: "hsl(120, 30%, 60%)",
    flesh: "hsl(120, 50%, 30%)",
    tears: "hsla(195, 75%, 60%, 0.7)",
};

const SCENE_SIZE = 400;

const createCharacterModel = (illo: any) => {
    const Zdog = (window as any).Zdog;
    const headAnchor = new Zdog.Anchor({ addTo: illo, translate: { y: -42 } });
    new Zdog.Group({ addTo: headAnchor });
    new Zdog.Shape({ addTo: headAnchor.children[0], stroke: 228, color: PALETTE.skinShadow, path: [{ x: -4.5 }, { x: 4.5 }] });
    new Zdog.Shape({ addTo: headAnchor.children[0], stroke: 216, color: PALETTE.skin, translate: { x: -4.5 } });

    const eyeAnchor = new Zdog.Anchor({ addTo: headAnchor, translate: { x: -66, y: -30, z: 84 }, rotate: { y: Zdog.TAU / 11 } });
    const eyeGroup = new Zdog.Group({ addTo: eyeAnchor });
    
    // Eye Shadow
    new Zdog.Shape({
        addTo: eyeGroup,
        fill: true,
        stroke: 0,
        color: PALETTE.skinShadow,
        scale: 1.15,
        path: [ { x: 0, y: 0, z: 3 }, { bezier: [ { x: 24, y: 0, z: 3 }, { x: 36, y: 21, z: 0 }, { x: 36, y: 36, z: 0 } ] }, { bezier: [ { x: 36, y: 51, z: 0 }, { x: 24, y: 63, z: 3 }, { x: 0, y: 63, z: 3 } ] }, { bezier: [ { x: -24, y: 63, z: 3 }, { x: -36, y: 51, z: 0 }, { x: -36, y: 36, z: 0 } ] }, { bezier: [ { x: -36, y: 21, z: 0 }, { x: -24, y: 0, z: 3 }, { x: 0, y: 0, z: 3 } ] } ]
    });

    const eye = new Zdog.Shape({addTo: eyeGroup,fill: true,stroke: 3,color: PALETTE.dark,translate: { y: 6 },path: [{ x: 0, y: 0, z: 3 },{ bezier: [ { x: 24, y: 0, z: 3 },{ x: 36, y: 21, z: 0 },{ x: 36, y: 36, z: 0 }]},{ bezier: [ { x: 36, y: 51, z: 0 },{ x: 24, y: 63, z: 3 },{ x: 0, y: 63, z: 3 }]},{ bezier: [ { x: -24, y: 63, z: 3 },{ x: -36, y: 51, z: 0 },{ x: -36, y: 36, z: 0 }]},{ bezier: [ { x: -36, y: 21, z: 0 },{ x: -24, y: 0, z: 3 },{ x: 0, y: 0, z: 3 }]}]});
    
    // Eye Highlight
    eye.copy({
        addTo: eye,
        fill: true,
        color: PALETTE.light,
        scale: 0.4,
        translate: { x: -9, y: 9, z: 3 }
    });

    const eyeLeft = eyeAnchor.copyGraph({ translate: { x: 66, y: -30, z: 84 }, rotate: { y: Zdog.TAU / -11 } });
    
    const mouthAnchor = new Zdog.Anchor({ addTo: headAnchor, translate: { y: 36, z: 96 }, rotate: { x: Zdog.TAU / -45 } });
    const mouthGroup = new Zdog.Group({ addTo: mouthAnchor });
    new Zdog.Shape({ addTo: mouthGroup, stroke: 3, fill: true, color: PALETTE.skinShadow, scale: 1.1, translate: {y: -5}, path: [ { x: 0, y: 0 }, { bezier: [ { x: 18, y: 0, z: 0 }, { x: 30, y: 21, z: -6 }, { x: 30, y: 30, z: -6 } ] }, { bezier: [ { x: 30, y: 51, z: -6 }, { x: 24, y: 33, z: -3 }, { x: 0, y: 33, z: -3 } ] }, { bezier: [ { x: -24, y: 33, z: -3 }, { x: -30, y: 51, z: -6 }, { x: -30, y: 30, z: -6 } ] }, { bezier: [ { x: -30, y: 21, z: -6 }, { x: -18, y: 0, z: 0 }, { x: 0, y: 0, z: 0 } ] } ] });
    new Zdog.Shape({ addTo: mouthGroup, stroke: 0, fill: true, color: PALETTE.flesh, path: [ { x: 0, y: 0 }, { bezier: [ { x: 18, y: 0, z: 0 }, { x: 30, y: 21, z: -6 }, { x: 30, y: 30, z: -6 } ] }, { bezier: [ { x: 30, y: 51, z: -6 }, { x: 24, y: 33, z: -3 }, { x: 0, y: 33, z: -3 } ] }, { bezier: [ { x: -24, y: 33, z: -3 }, { x: -30, y: 51, z: -6 }, { x: -30, y: 30, z: -6 } ] }, { bezier: [ { x: -30, y: 21, z: -6 }, { x: -18, y: 0, z: 0 }, { x: 0, y: 0, z: 0 } ] } ] });
    new Zdog.Shape({ addTo: mouthGroup, stroke: 7, fill: false, color: PALETTE.light, translate: { y: 25, z: -6 }, path: [ { x: 0, y: 0, z: 0 }, { bezier: [ { x: 24, y: 0, z: 0 }, { x: 24, y: 10, z: -7 }, { x: 24, y: 10, z: -7 } ] }, { x: 26, y: 13, z: -8 }, { bezier: [ { x: 26, y: 13, z: -7 }, { x: 16, y: 5, z: 0 }, { x: 0, y: 5, z: 0 } ] }, { bezier: [ { x: -16, y: 5, z: 0 }, { x: -26, y: 13, z: -7 }, { x: -26, y: 13, z: -8 } ] }, { x: -24, y: 10, z: -7 }, { bezier: [ { x: -24, y: 10, z: -7 }, { x: -24, y: 0, z: 0 }, { x: 0, y: 0, z: 0 } ] } ] });
    
    // Lips
    const lipGroup = new Zdog.Group({ addTo: mouthAnchor });
    new Zdog.Shape({ addTo: lipGroup, stroke: 7, fill: false, translate: { y: 8, z: -4 }, color: PALETTE.skinShadow, rotate: { x: Zdog.TAU / -45 }, path: [ { x: -33, y: 30, z: -6 }, { bezier: [ { x: -35, y: 40, z: -6 }, { x: -30, y: 40, z: -4 }, { x: -30, y: 40, z: -4 } ] } ], closed: false });
    new Zdog.Shape({ addTo: lipGroup, stroke: 7, fill: false, translate: { y: 4, z: -1 }, color: PALETTE.skinHighlight, path: [ { x: -33, y: 30, z: -6 }, { bezier: [ { x: -35, y: 40, z: -6 }, { x: -30, y: 40, z: -4 }, { x: -30, y: 40, z: -4 } ] } ], closed: false });
    const lipLeftGroup = lipGroup.copyGraph();
    lipLeftGroup.children.forEach((lip: any) => lip.scale.x = -1);

    const bodyAnchor = new Zdog.Anchor({ addTo: illo, translate: { y: 81 } });
    const bodyGroup = new Zdog.Group({ addTo: bodyAnchor });
    const bodyUpperGroup = new Zdog.Group({ addTo: bodyGroup });
    const bodyUpper = new Zdog.Shape({ addTo: bodyUpperGroup, stroke: 63, fill: true, color: PALETTE.skinShadow, translate: { y: 6 } });
    bodyUpper.copy({ stroke: 57, color: PALETTE.skin, translate: { x: -3 } });
    
    const armGroup = new Zdog.Group({ addTo: bodyAnchor, translate: { z: -6 }, rotate: { x: Zdog.TAU / 16 } });
    const arm = new Zdog.Shape({ addTo: armGroup, stroke: 30, color: PALETTE.skinShadow, path: [ { x: -35, y: -6, z: 0 }, { bezier: [ { x: -33, y: -6, z: 0 }, { x: -45, y: -6, z: 0 }, { x: -54, y: 30, z: 0 } ] } ], closed: false });
    arm.copy({ stroke: 27, color: PALETTE.skin });
    const armLeft = armGroup.copyGraph({ rotate: { x: Zdog.TAU / 16, y: Zdog.TAU / 2 } });
    armLeft.children[1].stroke = 21;
    armLeft.children[1].translate = { x: 1, y: 1 };
    
    const bodyLowerGroup = new Zdog.Group({ addTo: bodyGroup, translate: { y: 30 } });
    new Zdog.Shape({ addTo: bodyLowerGroup, stroke: 69, fill: true, color: PALETTE.skinShadow, translate: { y: 6 }, path: [{ x: -4.5 }, { x: 4.5 }] }).copy({ stroke: 66, color: PALETTE.skin, translate: { x: -3, y: 4.5 }, path: [{ x: -4.5 }, { x: 4.5 }] });
    
    const legGroup = new Zdog.Group({ addTo: illo, translate: { y: 141, z: -3 } });
    new Zdog.Shape({ addTo: legGroup, stroke: 28, color: PALETTE.skinShadow, translate: { y: 6 }, path: [ { x: -21, y: -6, z: 0 }, { bezier: [ { x: -18, y: -6, z: 0 }, { x: -24, y: -6, z: 0 }, { x: -24, y: 24, z: 0 } ] } ], closed: false }).copy({ stroke: 24, color: PALETTE.skin });
    const footGroup = new Zdog.Group({ addTo: legGroup, translate: { x: -25, y: 42, z: 4 }, rotate: { x: Zdog.TAU / 4 } });
    new Zdog.Hemisphere({ addTo: footGroup, stroke: 5, diameter: 23, color: PALETTE.skinShadow, backface: PALETTE.skinShadow }).copy({ diameter: 20, color: PALETTE.skin, backface: PALETTE.skin, translate: { y: -2, z: 2 } });
    const legLeft = legGroup.copyGraph({ rotate: { y: Zdog.TAU / 2 } });
    legLeft.children[1].stroke = 20;
    legLeft.children[1].translate = { x: 1, y: 9 };
    legLeft.children[2].translate = { x: -25, y: 42, z: -4 };
    
    return { headAnchor, bodyAnchor, bodyUpper, eyeRight: eye, eyeLeft: eyeLeft.children[0] };
};

export function AICoach() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationState = useRef<{
      animationFrameId?: number;
      mouseTimeout?: number;
  }>({}); 

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  useEffect(() => {
    let scriptsLoaded = 0;

    const initializeAnimation = () => {
      if (!canvasRef.current || !(window as any).Zdog || !(window as any).TweenMax) {
        setTimeout(initializeAnimation, 50);
        return;
      }
      const { Zdog, TweenMax, TweenLite, Sine } = window as any;
      const illo = new Zdog.Illustration({
        element: canvasRef.current,
        resize: true,
        onResize: function(this: any, width: number, height: number) { this.zoom = Math.min(width, height) / SCENE_SIZE; },
        dragRotate: true,
      });
      
      const model = createCharacterModel(illo);
      
      const setupAnimations = () => {
        TweenMax.to(model.bodyUpper.scale, 0.5, { x: 0.95, y: 0.97, repeat: -1, yoyo: true, ease: Sine.easeInOut });

        const blink = () => {
            const randomDelay = Math.random() * 6 + 2;
            TweenMax.to([model.eyeRight.scale, model.eyeLeft.scale], 0.07, { y: 0, repeat: 1, yoyo: true, delay: randomDelay, onComplete: blink });
        };
        blink();

        return { stop: () => TweenMax.killAll() };
      };

      const setupEventListeners = () => {
        let lookAroundTimeout: any;
        const lookAround = () => {
            const randomY = (Math.random() * 40 - 20) / 360 * Zdog.TAU;
            const randomDuration = Math.random() + 0.5;
            TweenLite.to(model.headAnchor.rotate, randomDuration, { y: randomY, ease: Sine.easeInOut });
            TweenLite.to(model.bodyAnchor.rotate, randomDuration, { y: randomY / 2, ease: Sine.easeInOut, onComplete: () => {
                lookAroundTimeout = setTimeout(lookAround, Math.random() * 1000 + 500);
            }});
        };
        lookAround();

        const watchPlayer = (x: number, y: number) => {
            const rect = canvasRef.current!.getBoundingClientRect();
            const rotX = (x - (rect.left + rect.width / 2)) / Zdog.TAU;
            const rotY = -(y - (rect.top + rect.height / 2)) / Zdog.TAU;
            TweenMax.to(model.headAnchor.rotate, 0.5, { x: rotY / 100, y: -rotX / 100, ease: Sine.easeOut });
            TweenMax.to(model.bodyAnchor.rotate, 0.5, { x: rotY / 200, y: -rotX / 200, ease: Sine.easeOut });
        };

        const resetAll = () => {
            TweenLite.to(model.headAnchor.rotate, 0.5, { x: 0, y: 0, ease: Sine.easeOut });
            TweenLite.to(model.bodyAnchor.rotate, 0.5, { x: 0, y: 0, ease: Sine.easeOut });
            lookAround();
        };

        const handleMouseMove = (e: MouseEvent) => {
            TweenLite.killTweensOf(model.headAnchor.rotate);
            TweenLite.killTweensOf(model.bodyAnchor.rotate);
            clearTimeout(lookAroundTimeout);
            watchPlayer(e.clientX, e.clientY);
            clearTimeout(animationState.current.mouseTimeout);
            animationState.current.mouseTimeout = setTimeout(resetAll, 2000) as any;
        };

        document.body.addEventListener("mousemove", handleMouseMove);
        return () => document.body.removeEventListener("mousemove", handleMouseMove);
      };

      const animate = () => {
        illo.updateRenderGraph();
        animationState.current.animationFrameId = requestAnimationFrame(animate);
      };

      const animationManager = setupAnimations();
      const removeEventListeners = setupEventListeners();
      animate();

      return () => {
        if (animationState.current.animationFrameId) cancelAnimationFrame(animationState.current.animationFrameId);
        removeEventListeners();
        animationManager.stop();
      };
    };

    const scripts = ["https://unpkg.com/zdog@1/dist/zdog.dist.min.js", "https://cdnjs.cloudflare.com/ajax/libs/gsap/2.1.3/TweenMax.min.js"];
    const onAllScriptsLoaded = () => {
        scriptsLoaded++;
        if (scriptsLoaded === scripts.length) initializeAnimation();
    };
    const loadScript = (src: string) => {
      if (document.querySelector(`script[src="${src}"]`)) { onAllScriptsLoaded(); return; }
      const script = document.createElement('script');
      script.src = src;
      script.onload = onAllScriptsLoaded;
      document.body.appendChild(script);
    };
    scripts.forEach(loadScript);

    return () => {
        if ((window as any).TweenMax) {
            (window as any).TweenMax.killAll();
        }
    };
  }, []);

  const toggleListen = () => {
      setIsListening(!isListening);
      if (!isListening) {
          setTranscript("Listening... Tell me about your cubing progress or ask for algorithms.");
          // Simulating voice processing for the mockup
          setTimeout(() => {
              setTranscript("Processing your voice via ElevenLabs and Gemini...");
              setTimeout(() => {
                  setIsListening(false);
                  setTranscript("That's a great algorithm. Let's work on reducing your lookahead pauses next.");
              }, 2000);
          }, 3000);
      }
  };

  return (
      <div className="w-full relative pointer-events-none flex flex-col items-center gap-6 pb-12">
          <div className="pointer-events-none z-10 text-center">
              <VapourText className="text-3xl md:text-4xl">Neural Coach</VapourText>
          </div>
          
          <div className="w-64 h-64 md:w-80 md:h-80 rounded-full glass-panel-apple border border-white/10 flex items-center justify-center p-4 relative overflow-hidden pointer-events-auto shadow-[0_8px_32px_rgba(0,0,0,0.4)] my-4">
              {/* Soft pulsing green ring */}
              <div className="absolute inset-0 border border-[#00FF88]/20 rounded-full animate-pulse"></div>
              <canvas ref={canvasRef} className="w-full h-full block touch-none" />
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-lg mx-auto glass-panel-apple p-5 text-center pointer-events-auto z-10 relative shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-white/10 rounded-2xl"
          >
              <div className="mb-4 min-h-12 flex items-center justify-center">
                  <p className="calligraphy text-base md:text-lg text-white/80 liquid-transition">
                      {transcript || "Hello, I am your interactive AI coach. How can I help you improve?"}
                  </p>
              </div>
              <div className="flex justify-center items-center gap-4">
                  <button 
                      onClick={toggleListen}
                      className={`w-14 h-14 rounded-full flex items-center justify-center transition-all liquid-transition ${isListening ? 'bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.5)]' : 'glass-panel-apple text-white hover:bg-white/10'}`}
                  >
                      {isListening ? <Square size={20} /> : <Mic size={20} />}
                  </button>
              </div>
          </motion.div>
      </div>
  );
}
