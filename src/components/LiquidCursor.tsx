import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';

export function LiquidCursor() {
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Raw cursor positions
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Super fluid liquid spring parameters
  const springConfig = { damping: 30, stiffness: 220, mass: 0.6 };
  const trailX = useSpring(mouseX, springConfig);
  const trailY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      // Offset by half of the circle's base dimensions (24px -> 12px)
      mouseX.set(e.clientX - 12);
      mouseY.set(e.clientY - 12);
      if (!isVisible) setIsVisible(true);
    };

    // Global detection of clickable/interactive elements
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      
      const isClickable = 
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.closest('button') ||
        target.closest('a') ||
        target.classList.contains('cursor-pointer') ||
        window.getComputedStyle(target).cursor === 'pointer';

      setIsHovering(!!isClickable);
    };

    const handleMouseLeaveWindow = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseleave', handleMouseLeaveWindow);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseleave', handleMouseLeaveWindow);
    };
  }, [mouseX, mouseY, isVisible]);

  if (!isVisible) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 w-6 h-6 rounded-full border border-white/20 pointer-events-none z-[99999] hidden md:block shadow-[0_0_8px_rgba(0,0,0,0.5)]"
      style={{
        x: trailX,
        y: trailY,
        scale: isHovering ? 2.2 : 1.0,
        backgroundColor: isHovering ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.7)',
        borderColor: isHovering ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.25)',
        backdropFilter: isHovering ? 'blur(3px)' : 'blur(0px)',
      }}
      animate={{
        opacity: isVisible ? 1 : 0,
      }}
      transition={{
        scale: { type: 'spring', stiffness: 300, damping: 20 },
        backgroundColor: { duration: 0.3 },
        borderColor: { duration: 0.3 },
      }}
    />
  );
}
