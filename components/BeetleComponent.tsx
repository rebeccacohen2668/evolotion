
import React from 'react';
import { Individual } from '../types';

interface Props {
  individual: Individual;
}

const BeetleComponent: React.FC<Props> = ({ individual }) => {
  const isEaten = !individual.isAlive;
  
  return (
    <div
      className={`absolute transition-all duration-700 ease-in-out ${isEaten ? 'opacity-0 scale-0 rotate-180' : 'opacity-100 scale-100'}`}
      style={{
        left: `${individual.x}%`,
        top: `${individual.y}%`,
        transform: `translate(-50%, -50%)`,
      }}
    >
      <svg viewBox="0 0 100 100" width="32" height="32" className="drop-shadow-md">
        <path d="M20 40 L10 35 M20 50 L8 50 M20 60 L10 65" stroke="black" strokeWidth="3" />
        <path d="M80 40 L90 35 M80 50 L92 50 M80 60 L90 65" stroke="black" strokeWidth="3" />
        <ellipse cx="50" cy="55" rx="30" ry="35" fill={individual.color} stroke="black" strokeWidth="2" />
        <circle cx="50" cy="25" r="15" fill="black" />
        <path d="M50 25 L50 90" stroke="black" strokeWidth="1" opacity="0.3" />
        <circle cx="35" cy="45" r="3" fill="black" opacity="0.3" />
        <circle cx="65" cy="45" r="3" fill="black" opacity="0.3" />
        <circle cx="35" cy="65" r="3" fill="black" opacity="0.3" />
        <circle cx="65" cy="65" r="3" fill="black" opacity="0.3" />
      </svg>
    </div>
  );
};

export default BeetleComponent;
