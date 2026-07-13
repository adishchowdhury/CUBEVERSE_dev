import React from 'react';

export const VapourText = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={`inline-block ${className}`}>
      <span className="relative inline-block font-calligraphy calligraphy text-white font-bold tracking-widest uppercase">
        {React.Children.map(children, (child) => {
          if (typeof child === 'string') {
            return child.split('').map((char, index) => (
              <span
                key={index}
                className="inline-block animate-[vapour_4s_linear_infinite]"
                style={{
                  animationDelay: `${Math.random() * 2}s`,
                  textShadow: '0 0 10px rgba(255,255,255,0.8), 0 0 20px rgba(255,255,255,0.5)',
                }}
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            ));
          }
          return child;
        })}
      </span>
      <style>{`
        @keyframes vapour {
          0% { transform: translateY(0) scale(1); opacity: 1; filter: blur(0px); }
          50% { transform: translateY(-20px) scale(1.1); opacity: 0.5; filter: blur(5px); }
          100% { transform: translateY(-40px) scale(1.2); opacity: 0; filter: blur(10px); }
        }
      `}</style>
    </div>
  );
};
