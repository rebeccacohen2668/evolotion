
import React from 'react';
import { Individual } from '../types';

interface Props {
  individual: Individual;
  isSelectionStep: boolean;
}

const IndividualComponent: React.FC<Props> = ({ individual, isSelectionStep }) => {
  const opacity = individual.isAlive ? 'opacity-100' : 'opacity-0 scale-50 transition-all duration-1000';
  
  return (
    <div
      className={`absolute w-6 h-6 rounded-full border-2 border-white shadow-md flex items-center justify-center transition-all duration-500 ${opacity}`}
      style={{
        backgroundColor: individual.color,
        left: `${individual.x}%`,
        top: `${individual.y}%`,
        transform: 'translate(-50%, -50%)'
      }}
    >
      <div className="w-1 h-1 bg-black rounded-full mb-1 mx-0.5"></div>
      <div className="w-1 h-1 bg-black rounded-full mb-1 mx-0.5"></div>
    </div>
  );
};

export default IndividualComponent;
