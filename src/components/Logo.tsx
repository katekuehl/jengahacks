import React from 'react';
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <div className={cn("inline-flex items-center", className)}>
      <style>{`
        @keyframes tumble {
          0%, 15% { transform: translate(0, 0) rotate(0deg); }
          30% { transform: translate(15px, 0) rotate(2deg); }
          45% { transform: translate(46px, 10px) rotate(15deg); }
          65% { transform: translate(100px, 200px) rotate(120deg); opacity: 0; }
          100% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
        }

        @keyframes slideOut {
          0%, 15% { transform: translateX(0px); }
          30% { transform: translateX(46px); }
          100% { transform: translateX(46px); }
        }

        @keyframes fallCrumble {
          0%, 40% { transform: translate(0, 0) rotate(0deg); }
          60% { transform: translate(10px, 150px) rotate(45deg); opacity: 0; }
          100% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
        }

        .logo-pull {
          animation: slideOut 3.5s ease-in-out infinite;
        }

        .logo-tower {
          transform-origin: 100px 190px;
          animation: tumble 3.5s ease-in-out infinite;
        }

        .logo-block-top {
          animation: fallCrumble 3.5s ease-in-out infinite;
        }
      `}</style>
      <svg 
        width="260" 
        height="260" 
        viewBox="0 0 200 260" 
        xmlns="http://www.w3.org/2000/svg"
        className="h-10 sm:h-12 w-auto overflow-visible"
      >
        <g className="logo-tower" stroke="#2f4f1f" strokeWidth="6" strokeLinejoin="round" fill="#8cc942">
          {/* Bottom - mostly stable but tumbles with tower */}
          <rect x="40" y="200" width="120" height="30" rx="4"/>
          <rect x="40" y="170" width="120" height="30" rx="4"/>

          {/* Middle */}
          <rect x="55" y="140" width="90" height="30" rx="4"/>
          <rect className="logo-pull" x="55" y="110" width="90" height="30" rx="4"/>

          {/* Top - falls more dramatically */}
          <g className="logo-block-top">
            <rect x="40" y="90" width="120" height="30" rx="4"/>
            <rect x="40" y="60" width="120" height="30" rx="4"/>
          </g>
        </g>
      </svg>
      <span className="text-lg sm:text-xl font-bold tracking-tight ml-2">JengaHacks</span>
    </div>
  );
};

export default Logo;
