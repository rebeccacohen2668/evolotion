
import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Dna, Target, Users, Zap, Search, Activity, ChevronRight, BarChart3, RefreshCw } from 'lucide-react';
import { GameStep, Individual, Environment, Allele } from './types';
import { ENVIRONMENTS, MUTATION_RATE, QUIZ_QUESTIONS } from './constants';
import BeetleComponent from './components/BeetleComponent';
import PredatorComponent from './components/PredatorComponent';
import StepIndicator from './components/StepIndicator';

const App: React.FC = () => {
  const [generation, setGeneration] = useState(1);
  const [step, setStep] = useState<GameStep>(GameStep.VARIATION);
  const [population, setPopulation] = useState<Individual[]>([]);
  const [environment, setEnvironment] = useState<Environment>(ENVIRONMENTS[0]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState<number | null>(null);
  const [observationLog, setObservationLog] = useState<string[]>(["המערכת הופעלה. אוכלוסיית חיפושיות ראשונית נוצרה."]);
  const [stats, setStats] = useState({ green: 0, brown: 0, hybrid: 0 });
  const [predator, setPredator] = useState({ x: 50, y: -20, visible: false });
  const [isProcessing, setIsProcessing] = useState(false);

  const getIndividualColor = (alleles: [Allele, Allele]): string => {
    const gCount = alleles.filter(a => a === 'G').length;
    if (gCount === 2) return '#166534'; // ירוק יער (כהה)
    if (gCount === 1) return '#a3e635'; // ליים בהיר (היברידי)
    return '#78350f'; // חום אדמה
  };

  const updateStats = useCallback((pop: Individual[]) => {
    const green = pop.filter(ind => ind.alleles.filter(a => a === 'G').length === 2).length;
    const brown = pop.filter(ind => ind.alleles.filter(a => a === 'B').length === 2).length;
    const hybrid = pop.length - green - brown;
    setStats({ green, brown, hybrid });
  }, []);

  const addLog = (msg: string) => {
    setObservationLog(prev => [msg, ...prev].slice(0, 5));
  };

  const initializePopulation = useCallback(() => {
    const newPop: Individual[] = Array.from({ length: 20 }).map((_, i) => {
      const a1: Allele = Math.random() > 0.5 ? 'G' : 'B';
      const a2: Allele = Math.random() > 0.5 ? 'G' : 'B';
      const alleles: [Allele, Allele] = [a1, a2];
      return {
        id: `gen${Date.now()}-${i}`,
        alleles,
        color: getIndividualColor(alleles),
        isAlive: true,
        x: 10 + Math.random() * 80,
        y: 10 + Math.random() * 80,
      };
    });
    setPopulation(newPop);
    updateStats(newPop);
  }, [updateStats]);

  useEffect(() => {
    initializePopulation();
  }, [initializePopulation]);

  const nextStep = () => {
    setStep(prev => (prev + 1) % 7);
  };

  const handleStepAction = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    switch (step) {
      case GameStep.VARIATION:
        addLog("תצפית: השונות הגנטית קיימת מראש. שים לב לצבעים השונים.");
        nextStep();
        break;

      case GameStep.MUTATION:
        let mCount = 0;
        const mutatedPop = population.map(ind => {
          if (Math.random() < MUTATION_RATE) {
            mCount++;
            const idx = Math.random() > 0.5 ? 0 : 1;
            const newAllele: Allele = ind.alleles[idx] === 'G' ? 'B' : 'G';
            const alleles: [Allele, Allele] = [ind.alleles[0], ind.alleles[1]];
            alleles[idx] = newAllele;
            return { ...ind, alleles, color: getIndividualColor(alleles) };
          }
          return ind;
        });
        setPopulation(mutatedPop);
        updateStats(mutatedPop);
        addLog(`שכפול DNA: התרחשו ${mCount} מוטציות אקראיות.`);
        nextStep();
        break;

      case GameStep.ENV_CHANGE:
        const nextIdx = (ENVIRONMENTS.indexOf(environment) + 1) % ENVIRONMENTS.length;
        setEnvironment(ENVIRONMENTS[nextIdx]);
        addLog(`שינוי סביבתי: הסביבה כעת היא ${ENVIRONMENTS[nextIdx].name}.`);
        nextStep();
        break;

      case GameStep.SELECTION:
        addLog("סלקציה: הטורף מחפש חיפושיות שבולטות על הרקע.");
        const currentPop = [...population];
        const candidatesForDeath: number[] = [];
        
        currentPop.forEach((ind, index) => {
          const gCount = ind.alleles.filter(a => a === 'G').length;
          let survivalProb = 0.5;
          
          if (environment.type === 'LUSH') {
            survivalProb = gCount === 2 ? 0.98 : gCount === 1 ? 0.4 : 0.05;
          } else if (environment.type === 'MEADOW') {
            survivalProb = gCount === 1 ? 0.98 : 0.2;
          } else { 
            survivalProb = gCount === 0 ? 0.98 : gCount === 1 ? 0.4 : 0.05;
          }
          
          if (Math.random() > survivalProb) {
            candidatesForDeath.push(index);
          }
        });

        const shuffledToEat = candidatesForDeath.sort(() => Math.random() - 0.5);
        const actualEatenIndices = shuffledToEat.slice(0, 14);

        for (const index of actualEatenIndices) {
          const prey = currentPop[index];
          setPredator({ x: prey.x, y: prey.y, visible: true });
          await new Promise(r => setTimeout(r, 300));
          setPopulation(prev => prev.map((p, i) => i === index ? { ...p, isAlive: false } : p));
          await new Promise(r => setTimeout(r, 50));
        }
        
        setPredator({ x: 50, y: -20, visible: false });
        addLog(`הטריפה הסתיימה. רק המוסווים ביותר שרדו ברובם.`);
        nextStep();
        break;

      case GameStep.INHERITANCE:
        const survivors = population.filter(p => p.isAlive);
        if (survivors.length < 2) {
          addLog("האוכלוסייה קטנה מדי להתרבות! מתחילים מחדש...");
          initializePopulation();
          setStep(GameStep.VARIATION);
        } else {
          const nextGen: Individual[] = Array.from({ length: 20 }).map((_, i) => {
            const parent1 = survivors[Math.floor(Math.random() * survivors.length)];
            const parent2 = survivors[Math.floor(Math.random() * survivors.length)];
            const childAllele1 = parent1.alleles[Math.random() > 0.5 ? 0 : 1];
            const childAllele2 = parent2.alleles[Math.random() > 0.5 ? 0 : 1];
            const alleles: [Allele, Allele] = [childAllele1, childAllele2];
            
            return {
              id: `gen${generation + 1}-${i}`,
              alleles,
              color: getIndividualColor(alleles),
              isAlive: true,
              x: 10 + Math.random() * 80,
              y: 10 + Math.random() * 80,
            };
          });
          setPopulation(nextGen);
          updateStats(nextGen);
          addLog("תורשה: השורדים התרבו. הצאצאים ירשו שילוב של אללים מהוריהם.");
          nextStep();
        }
        break;

      case GameStep.POPULATION_CHANGE:
        addLog(`דור ${generation} הושלם. בדוק את השינוי בגרף התכונות.`);
        setGeneration(prev => prev + 1);
        nextStep();
        break;

      case GameStep.QUIZ:
        break;
    }
    setIsProcessing(false);
  };

  const handleQuizAnswer = (index: number) => {
    setQuizAnswered(index);
  };

  const finishQuiz = () => {
    setQuizIndex(prev => (prev + 1) % QUIZ_QUESTIONS.length);
    setQuizAnswered(null);
    setStep(GameStep.VARIATION);
  };

  const getChartData = () => [
    { name: 'ירוק כהה (GG)', value: stats.green, color: '#166534' },
    { name: 'ירוק בהיר (GB)', value: stats.hybrid, color: '#a3e635' },
    { name: 'חום (BB)', value: stats.brown, color: '#78350f' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-2 md:p-6 flex flex-col font-sans overflow-hidden">
      {/* Quiz Overlay - Improved for visibility and accessibility */}
      {step === GameStep.QUIZ && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 md:p-8 overflow-y-auto">
          <div className="max-w-2xl w-full bg-slate-900 border border-slate-700 rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden animate-slideUp">
            <div className="bg-indigo-600 p-6 flex flex-col items-center justify-center text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 bg-white/5 rounded-full -mr-12 -mt-12"></div>
              <Zap size={40} className="mb-2 relative z-10" />
              <h2 className="text-2xl font-black relative z-10 uppercase tracking-widest">בקרת הבנה</h2>
            </div>
            
            <div className="p-6 md:p-10 space-y-8">
              <div className="space-y-4">
                <p className="text-xl md:text-2xl font-bold text-slate-100 text-center leading-relaxed">
                  {QUIZ_QUESTIONS[quizIndex].question}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {QUIZ_QUESTIONS[quizIndex].options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuizAnswer(i)}
                    disabled={quizAnswered !== null}
                    className={`w-full p-5 text-right rounded-2xl border-2 transition-all duration-300 text-base font-bold shadow-sm flex items-center justify-between gap-4 ${
                      quizAnswered === null 
                        ? 'border-slate-800 bg-slate-800/50 hover:border-indigo-500 hover:bg-slate-800' 
                        : i === QUIZ_QUESTIONS[quizIndex].correctIndex 
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 scale-[1.02]'
                          : quizAnswered === i 
                            ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                            : 'opacity-40 border-slate-900'
                    }`}
                  >
                    <span className="flex-1">{opt}</span>
                    {quizAnswered !== null && i === QUIZ_QUESTIONS[quizIndex].correctIndex && (
                       <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                         <ChevronRight className="text-white w-4 h-4 rotate-180" />
                       </div>
                    )}
                  </button>
                ))}
              </div>

              {quizAnswered !== null && (
                <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 animate-fadeIn">
                  <div className="flex items-start gap-3 mb-6">
                    <div className={`p-2 rounded-lg shrink-0 ${quizAnswered === QUIZ_QUESTIONS[quizIndex].correctIndex ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                      <Search size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-wider text-slate-400 mb-1">הסבר מדעי</h4>
                      <p className="text-slate-200 font-medium leading-relaxed italic">
                        {QUIZ_QUESTIONS[quizIndex].explanation}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={finishQuiz}
                    className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black transition-all shadow-xl text-xl flex items-center justify-center gap-3 active:scale-95"
                  >
                    המשך לסימולציה <ChevronRight size={24} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <header className="max-w-6xl w-full mx-auto flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-2xl mb-4 shrink-0">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
            <Activity size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">מעבדת אבולוציה</h1>
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Natural Selection Simulator</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => window.location.reload()} className="p-2 text-slate-500 hover:text-white transition-colors" title="איפוס">
            <RefreshCw size={20} />
          </button>
          <div className="bg-slate-800 px-5 py-2 rounded-xl border border-slate-700 flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">דור:</span>
            <span className="text-2xl font-black text-indigo-400 leading-none">{generation}</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1 overflow-hidden">
        <div className="lg:col-span-1 space-y-4 flex flex-col h-full overflow-hidden">
          <section className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-2">
              <Search size={14} className="text-slate-500" />
              <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-wider">יומן תצפיות מדעי</h3>
            </div>
            <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar pr-1">
              {observationLog.map((log, i) => (
                <div key={i} className={`text-xs p-3 rounded-lg border-r-2 leading-relaxed transition-all duration-500 ${i === 0 ? 'bg-indigo-500/10 border-indigo-500 text-indigo-200' : 'bg-slate-800/50 border-slate-700 text-slate-500'}`}>
                  {log}
                </div>
              ))}
            </div>
          </section>

          <section className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shrink-0">
            <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-wider mb-3">פרמטר סביבה</h3>
            <div className="p-3 bg-slate-800 rounded-xl border border-slate-700">
              <p className="text-xs font-bold text-white mb-1">{environment.name}</p>
              <p className="text-[10px] text-slate-400 italic leading-tight">{environment.description}</p>
            </div>
          </section>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-4 overflow-hidden">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-inner overflow-hidden flex flex-col relative h-full">
            <StepIndicator currentStep={step} />
            
            <div 
              className="relative w-full flex-1 transition-colors duration-[2000ms] overflow-hidden"
              style={{ backgroundColor: environment.color }}
            >
              <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
              
              <PredatorComponent x={predator.x} y={predator.y} visible={predator.visible} />
              
              {population.map(ind => (
                <BeetleComponent key={ind.id} individual={ind} />
              ))}
            </div>

            <div className="p-4 bg-slate-900/50 border-t border-slate-800 shrink-0">
              <button 
                onClick={handleStepAction}
                disabled={step === GameStep.QUIZ || isProcessing}
                className={`w-full py-4 rounded-xl text-lg font-black transition-all shadow-xl flex items-center justify-center gap-3 ${
                  (step === GameStep.QUIZ || isProcessing)
                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white hover:scale-[1.01] active:scale-[0.98]'
                }`}
              >
                {isProcessing ? "מעבד נתונים..." : (
                  <>
                    {step === GameStep.VARIATION && "זהה שונות גנטית"}
                    {step === GameStep.MUTATION && "שכפול DNA ומוטציות"}
                    {step === GameStep.ENV_CHANGE && "חולל שינוי סביבתי"}
                    {step === GameStep.SELECTION && "הפעל לחץ טריפה"}
                    {step === GameStep.INHERITANCE && "הורשה לצאצאים"}
                    {step === GameStep.POPULATION_CHANGE && "ניתוח שינוי דורי"}
                    <ChevronRight size={20} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 flex flex-col gap-4 overflow-hidden">
          <section className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex-1 flex flex-col overflow-hidden">
            <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-wider mb-6 flex items-center gap-2">
              <BarChart3 size={14} /> הרכב תכונות באוכלוסייה
            </h3>
            <div className="flex-1 min-h-0 w-full relative">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart data={getChartData()} margin={{ top: 0, right: 0, left: -30, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} interval={0} />
                  <YAxis domain={[0, 20]} tick={{ fill: '#64748b', fontSize: 10 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                    itemStyle={{ fontSize: '12px' }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {getChartData().map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <div className="bg-indigo-500/5 border border-indigo-500/10 p-4 rounded-2xl flex items-start gap-3 shrink-0">
             <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 shrink-0">
               <Dna size={14} />
             </div>
             <div>
               <h4 className="text-[10px] font-black text-indigo-400 uppercase mb-1">הערה פדגוגית</h4>
               <p className="text-[10px] text-indigo-200/60 leading-tight">האבולוציה מתרחשת באוכלוסייה, לא בפרט. שים לב כיצד תדירות האללים משתנה מדור לדור.</p>
             </div>
          </div>
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
        .animate-slideUp { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
};

export default App;
