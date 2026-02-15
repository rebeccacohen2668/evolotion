
import React from 'react';
import { Bird } from 'lucide-react';

interface Props {
  x: number;
  y: number;
  visible: boolean;
}

const PredatorComponent: React.FC<Props> = ({ x, y, visible }) => {
  return (
    <div 
      className={`absolute z-50 pointer-events-none transition-all duration-300 ease-out flex items-center justify-center ${visible ? 'scale-100 opacity-100' : 'scale-150 opacity-0'}`}
      style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
    >
      <div className="bg-slate-800 p-2 rounded-full shadow-2xl border-2 border-white ring-4 ring-indigo-500/20">
        <Bird className="text-white w-8 h-8" />
      </div>
    </div>
  );
};

export default PredatorComponent;
