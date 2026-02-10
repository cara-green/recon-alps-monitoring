import React from 'react';

const MeribelLogo = ({ size = 32, className = "" }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 120 120" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Main mountain */}
      <path d="M60 25 L95 85 L25 85 Z" fill="currentColor" stroke="#1e40af" strokeWidth="2"/>
      
      {/* Snow line */}
      <path d="M60 25 L70 45 L60 40 L50 45 Z" fill="white"/>
      
      {/* Secondary peak */}
      <path d="M75 85 L90 55 L105 85 Z" fill="currentColor" opacity="0.7" stroke="currentColor" strokeWidth="1.5"/>
      
      {/* Snowflake accent */}
      <g transform="translate(35, 35)" opacity="0.6">
        <line x1="0" y1="5" x2="0" y2="-5" stroke="#60a5fa" strokeWidth="1.5"/>
        <line x1="5" y1="0" x2="-5" y2="0" stroke="#60a5fa" strokeWidth="1.5"/>
        <line x1="3.5" y1="3.5" x2="-3.5" y2="-3.5" stroke="#60a5fa" strokeWidth="1.5"/>
        <line x1="3.5" y1="-3.5" x2="-3.5" y2="3.5" stroke="#60a5fa" strokeWidth="1.5"/>
      </g>
    </svg>
  );
};

export default MeribelLogo;
