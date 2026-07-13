import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Mic, Square, Send, MessageSquare, Volume2, VolumeX, RefreshCw, AlertCircle, Cpu } from 'lucide-react';
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
    
    return { headAnchor, bodyAnchor, bodyUpper, eyeRight: eye, eyeLeft: eyeLeft.children[0], mouthAnchor };
};

interface Message {
  id: string;
  sender: 'user' | 'coach';
  text: string;
  timestamp: Date;
}

function cleanTextForSpeech(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold asterisks
    .replace(/\*([^*]+)\*/g, '$1')     // Remove italic asterisks
    .replace(/`([^`]+)`/g, '$1')       // Remove code highlights
    .replace(/[-*+]\s+/g, '')          // Remove bullet characters
    .replace(/^\s*\d+\.\s+/gm, '')     // Remove numbered lists (e.g. 1. F2L -> F2L)
    .replace(/[\n\r]+/g, ' ')          // Replace newlines with single spaces
    .replace(/[^a-zA-Z0-9\s.,?!'\u00C0-\u00FF-]/g, '') // Strip other special characters
    .trim();
}

export function AICoach() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationState = useRef<{
      animationFrameId?: number;
      mouseTimeout?: number;
  }>({}); 

  const characterModelRef = useRef<any>(null);
  const mouthAnimationRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Custom ElevenLabs/API status tracking
  const [voiceSource, setVoiceSource] = useState<'elevenlabs' | 'webspeech' | 'none'>('none');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'coach',
      text: "Speed cuber, welcome to the neural matrix! I am your Cubeverse Neural Coach. Speak or write your query to optimize your algorithms, plan your next CFOP transition, or smash through your PB!",
      timestamp: new Date()
    }
  ]);

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
      characterModelRef.current = model;
      
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
            if (!canvasRef.current) return;
            const rect = canvasRef.current.getBoundingClientRect();
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
        if (audioRef.current) {
          audioRef.current.pause();
        }
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
        stopMouthWiggle();
    };
  }, []);

  // Scroll to bottom of chat list
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, isListening]);

  const startMouthWiggle = () => {
    if (characterModelRef.current?.mouthAnchor && (window as any).TweenMax) {
      const { TweenMax, Sine } = window as any;
      if (mouthAnimationRef.current) {
        mouthAnimationRef.current.kill();
      }
      mouthAnimationRef.current = TweenMax.to(characterModelRef.current.mouthAnchor.scale, 0.12, {
        y: 0.25,
        x: 1.3,
        repeat: -1,
        yoyo: true,
        ease: Sine.easeInOut
      });
    }
  };

  const stopMouthWiggle = () => {
    if (mouthAnimationRef.current) {
      mouthAnimationRef.current.kill();
      mouthAnimationRef.current = null;
    }
    if (characterModelRef.current?.mouthAnchor && (window as any).TweenMax) {
      const { TweenLite, Sine } = window as any;
      TweenLite.to(characterModelRef.current.mouthAnchor.scale, 0.15, {
        x: 1,
        y: 1,
        ease: Sine.easeOut
      });
    }
  };

  const speakText = async (text: string) => {
    // Standard cleanup
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    stopMouthWiggle();
    setIsSpeaking(false);
    setVoiceSource('none');

    try {
      setIsSpeaking(true);
      startMouthWiggle();

      // Attempt ElevenLabs backend convert
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('ElevenLabs conversion failed (possibly missing API key)');
      }

      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onplay = () => {
        setIsSpeaking(true);
        startMouthWiggle();
        setVoiceSource('elevenlabs');
      };

      audio.onended = () => {
        setIsSpeaking(false);
        stopMouthWiggle();
        setVoiceSource('none');
      };

      audio.onerror = () => {
        console.warn("ElevenLabs audio object failed, falling back to Web Speech Synthesis.");
        fallbackSpeech(text);
      };

      await audio.play();

    } catch (err) {
      console.warn("ElevenLabs TTS endpoint failed or key absent. Using local Web Speech API fallback:", err);
      fallbackSpeech(text);
    }
  };

  const fallbackSpeech = (text: string) => {
    if (!window.speechSynthesis) {
      setIsSpeaking(false);
      stopMouthWiggle();
      setVoiceSource('none');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    
    // Attempt picking an elegant English speaker voice
    const premiumVoice = voices.find(v => 
      v.lang.startsWith('en') && 
      (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Premium'))
    ) || voices.find(v => v.lang.startsWith('en'));

    if (premiumVoice) {
      utterance.voice = premiumVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      startMouthWiggle();
      setVoiceSource('webspeech');
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      stopMouthWiggle();
      setVoiceSource('none');
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      stopMouthWiggle();
      setVoiceSource('none');
    };

    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setTranscript("Speech recognition is not supported in this browser. Please use keyboard input below.");
      return;
    }

    // Cancel current outputs
    if (audioRef.current) audioRef.current.pause();
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    stopMouthWiggle();
    setIsSpeaking(false);

    try {
      const rec = new SpeechRecognition();
      recognitionRef.current = rec;
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
        setTranscript("Listening... speak now.");
      };

      rec.onresult = async (event: any) => {
        const text = event.results[0][0].transcript;
        if (text) {
          setTranscript(text);
          await handleSend(text);
        }
      };

      rec.onerror = (e: any) => {
        console.error("Speech recognition error:", e);
        setTranscript("I didn't quite catch that. Feel free to type below instead!");
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.start();
    } catch (err) {
      console.error("Failed to start speech recognition:", err);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const toggleListen = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleSend = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed) return;

    // Save message locally
    const userMessage: Message = {
      id: Math.random().toString(),
      sender: 'user',
      text: trimmed,
      timestamp: new Date()
    };
    
    const currentHistory = [...messages, userMessage];
    setMessages(currentHistory);
    setInputText('');
    setIsLoading(true);
    setTranscript("Analyzing neural parameters...");

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: trimmed,
          history: currentHistory.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            text: msg.text
          }))
        }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      const coachText = data.text || "Connection scrambled. Please re-engage link.";

      const coachMessage: Message = {
        id: Math.random().toString(),
        sender: 'coach',
        text: coachText,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, coachMessage]);
      setTranscript(coachText);

      // Speak text
      const speechReadyText = cleanTextForSpeech(coachText);
      await speakText(speechReadyText);

    } catch (err) {
      console.error("Error communicating with Gemini:", err);
      const errText = "System Alert: Neural link unstable. Verify your API keys in Settings > Secrets or check network interference.";
      
      setMessages(prev => [...prev, {
        id: Math.random().toString(),
        sender: 'coach',
        text: errText,
        timestamp: new Date()
      }]);
      setTranscript(errText);
      await speakText("Connection error. Link scrambled.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-8 pb-12 flex flex-col gap-6">
      {/* Page Header */}
      <div className="text-center z-10 flex flex-col items-center gap-1">
        <VapourText className="text-3xl md:text-4xl">Neural Coach</VapourText>
        <p className="text-xs text-white/40 tracking-[0.25em] uppercase font-mono mt-1 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Cortical Uplink Synced
        </p>
      </div>

      {/* Main Grid Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pointer-events-auto">
        
        {/* Left Column: Zdog 3D Character Viewport */}
        <div className="lg:col-span-5 flex flex-col gap-4 items-center justify-start">
          <div className="w-full aspect-square md:max-w-md rounded-3xl border border-white/10 glass-panel-apple relative overflow-hidden flex flex-col items-center justify-between p-6 shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
            
            {/* Corner Tech Decorators */}
            <div className="absolute top-4 left-4 font-mono text-[9px] text-white/30 uppercase tracking-widest flex items-center gap-1.5">
              <Cpu size={11} className="text-[#00FF88]" />
              SYS: COCH-v4.0
            </div>
            <div className="absolute top-4 right-4 font-mono text-[9px] text-white/30 uppercase tracking-widest">
              LNK: ENGAGED
            </div>

            {/* Glowing rings and background */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#00FF88]/5 to-transparent pointer-events-none" />
            <div className={`absolute w-72 h-72 rounded-full border border-emerald-500/10 blur-xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ${isSpeaking ? 'bg-[#00FF88]/10 border-emerald-400/20 scale-110' : isListening ? 'bg-blue-500/10 border-blue-400/20' : 'bg-transparent'}`} />

            {/* Zdog Canvas */}
            <div className="w-full flex-1 flex items-center justify-center relative">
              <canvas ref={canvasRef} className="w-full h-full block touch-none z-10" />
            </div>

            {/* Diagnostics Footer of Character Box */}
            <div className="w-full border-t border-white/5 pt-4 flex justify-between items-center z-10">
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] uppercase tracking-widest text-white/30">Coach State</span>
                <span className="text-xs font-bold font-mono text-white/80 uppercase">
                  {isSpeaking ? (
                    <span className="text-[#00FF88] animate-pulse">● Speaking</span>
                  ) : isListening ? (
                    <span className="text-blue-400 animate-pulse">● Listening...</span>
                  ) : isLoading ? (
                    <span className="text-amber-400 animate-pulse">● Processing</span>
                  ) : (
                    "● Idle / Watching"
                  )}
                </span>
              </div>
              <div className="flex flex-col items-end gap-0.5">
                <span className="text-[9px] uppercase tracking-widest text-white/30">Audio Engine</span>
                <span className="text-xs font-bold font-mono text-white/80 uppercase flex items-center gap-1">
                  {voiceSource === 'elevenlabs' ? (
                    <>
                      <Volume2 size={11} className="text-[#00FF88]" />
                      ElevenLabs
                    </>
                  ) : voiceSource === 'webspeech' ? (
                    <>
                      <Volume2 size={11} className="text-amber-400" />
                      Browser TTS
                    </>
                  ) : (
                    <>
                      <VolumeX size={11} className="text-white/40" />
                      Standby
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Info Box */}
          <div className="w-full md:max-w-md p-4 rounded-2xl border border-white/5 bg-white/[0.02] text-center text-[10px] text-white/40 font-mono tracking-wider flex items-center justify-center gap-2">
            <Sparkles size={12} className="text-[#00FF88]" />
            <span>Interactive real-time voice & text coaching using Gemini</span>
          </div>
        </div>

        {/* Right Column: Chat Box Interface */}
        <div className="lg:col-span-7 flex flex-col h-[520px] md:h-[580px] rounded-3xl border border-white/10 glass-panel-apple overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
          
          {/* Chat Header */}
          <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
            <div className="flex items-center gap-2">
              <MessageSquare size={16} className="text-[#00FF88]" />
              <span className="text-xs font-bold tracking-widest uppercase text-white/80">Neural Connection Logs</span>
            </div>
            <button 
              onClick={() => {
                setMessages([
                  {
                    id: Math.random().toString(),
                    sender: 'coach',
                    text: "Logs purged. Neural Coach re-initialized. Ready for query.",
                    timestamp: new Date()
                  }
                ]);
                setTranscript('');
              }}
              className="text-[9px] text-white/40 hover:text-white/80 uppercase tracking-widest font-mono flex items-center gap-1 transition-colors"
            >
              <RefreshCw size={9} />
              Clear Logs
            </button>
          </div>

          {/* Messages Thread */}
          <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4 scrollbar-hide">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`max-w-[85%] flex flex-col gap-1 ${msg.sender === 'user' ? 'self-end items-end' : 'self-start items-start'}`}
              >
                <div 
                  className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-emerald-500/10 text-white border border-emerald-500/20 rounded-br-sm' 
                      : 'bg-white/5 text-white/90 border border-white/5 rounded-bl-sm'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[8px] font-mono text-white/20 px-1">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </motion.div>
            ))}

            {/* Spinner when thinking */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="self-start flex items-center gap-3 bg-white/5 border border-white/5 px-4 py-3 rounded-2xl text-xs text-white/50 rounded-bl-sm font-mono tracking-widest uppercase"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Processing Scramble Algorithms...
              </motion.div>
            )}

            {/* Scroll Anchor */}
            <div ref={messagesEndRef} />
          </div>

          {/* Transcript / Action Alert Bar */}
          <AnimatePresence>
            {(transcript || isListening) && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="px-6 py-2.5 bg-[#00FF88]/5 border-t border-[#00FF88]/10 text-xs text-[#00FF88]/80 font-mono tracking-wide flex items-center justify-between gap-4"
              >
                <div className="truncate flex-1">
                  <span className="font-bold text-[#00FF88] uppercase mr-2">
                    {isListening ? "Listening:" : "Coach Voice:"}
                  </span>
                  {transcript || "Speak clearly into your microphone..."}
                </div>
                {isSpeaking && (
                  <button 
                    onClick={() => {
                      if (audioRef.current) audioRef.current.pause();
                      if (window.speechSynthesis) window.speechSynthesis.cancel();
                      setIsSpeaking(false);
                      stopMouthWiggle();
                    }}
                    className="text-[9px] hover:text-[#00FF88] uppercase font-bold border border-[#00FF88]/30 px-2 py-0.5 rounded transition-all whitespace-nowrap"
                  >
                    Mute Audio
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Voice Fallback Warning Notice */}
          {voiceSource === 'webspeech' && (
            <div className="px-6 py-1.5 bg-amber-500/10 text-[9px] text-amber-400/80 font-mono tracking-widest uppercase flex items-center gap-1.5 border-t border-amber-500/10">
              <AlertCircle size={10} />
              Local Synthesizer Engaged (ELEVENLABS_API_KEY absent in settings)
            </div>
          )}

          {/* Chat Typing & Action Inputs */}
          <div className="p-4 bg-white/[0.01] border-t border-white/5 flex gap-3 items-center">
            
            {/* Mic voice button */}
            <button
              onClick={toggleListen}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                isListening 
                  ? 'bg-red-500 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]' 
                  : 'bg-white/5 text-white hover:bg-white/10 hover:text-[#00FF88] border border-white/5'
              }`}
              title={isListening ? "Stop listening" : "Start speaking (Web Speech API)"}
            >
              {isListening ? <Square size={16} /> : <Mic size={18} />}
            </button>

            {/* TextInput */}
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSend(inputText);
                  }
                }}
                disabled={isLoading || isListening}
                placeholder={isListening ? "Listening to mic input..." : "Ask: 'Provide F2L slot-3 setup' or ask Roux strategies..."}
                className="w-full h-12 px-4 rounded-xl bg-white/5 text-white text-sm border border-white/5 focus:outline-none focus:border-[#00FF88]/30 placeholder-white/30 disabled:opacity-50"
              />
            </div>

            {/* Send button */}
            <button
              onClick={() => handleSend(inputText)}
              disabled={isLoading || isListening || !inputText.trim()}
              className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 text-white hover:text-[#00FF88] border border-white/5 disabled:opacity-30 disabled:text-white/40 flex items-center justify-center transition-colors"
            >
              <Send size={16} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
