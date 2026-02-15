
import React from 'react';
import { GameStep } from '../types';

interface Props {
  currentStep: GameStep;
}

const steps = [
  "שונות",
  "מוטציה",
  "סביבה",
  "סלקציה",
  "תורשה",
  "שינוי",
  "מסקנות"
];

const StepIndicator: React.FC<Props> = ({ currentStep }) => {
  return (
    <div className="w-full bg-slate-950/40 p-3 flex items-center justify-between border-b border-slate-800 overflow-x-auto">
      {steps.map((label, index) => (
        <React.Fragment key={index}>
          <div className="flex items-center gap-2 min-w-fit px-2">
            <div 
              className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-mono border transition-all duration-300
                ${index === currentStep ? 'bg-indigo-600 border-indigo-400 text-white' : 
                  index < currentStep ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-900 border-slate-800 text-slate-700'}`}
            >
              {index + 1}
            </div>
            <span className={`text-[10px] font-black uppercase tracking-tight transition-colors ${index === currentStep ? 'text-indigo-400' : 'text-slate-600'}`}>
              {label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className="h-[1px] bg-slate-800 flex-1 mx-2 min-w-[10px]"></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default StepIndicator;
