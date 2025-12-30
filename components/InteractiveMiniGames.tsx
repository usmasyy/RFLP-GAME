import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Beaker, Droplet, Zap, ThermometerSun, FlaskConical, Pipette } from 'lucide-react';

interface MiniGameProps {
    onComplete: () => void;
    onClose?: () => void;
}

// ============================================================================
// INTERACTIVE DNA EXTRACTION - Drag and Drop Reagents
// ============================================================================

interface Reagent {
    id: string;
    name: string;
    color: string;
    icon: React.ElementType;
    hint: string;
}

const EXTRACTION_REAGENTS: Reagent[] = [
    { id: 'lysis', name: 'Lysis Buffer', color: 'from-blue-400 to-blue-600', icon: Beaker, hint: 'Breaks cell membranes to release contents' },
    { id: 'proteinase', name: 'Proteinase K', color: 'from-green-400 to-green-600', icon: FlaskConical, hint: 'Digests proteins to purify DNA' },
    { id: 'rnase', name: 'RNase A', color: 'from-purple-400 to-purple-600', icon: Droplet, hint: 'Removes RNA contamination' },
    { id: 'ethanol', name: 'Cold Ethanol', color: 'from-cyan-400 to-cyan-600', icon: Beaker, hint: 'Precipitates DNA for collection' },
    { id: 'water', name: 'Distilled Water', color: 'from-gray-400 to-gray-600', icon: Droplet, hint: '⚠️ Wrong reagent - will dilute sample!' },
];

const CORRECT_ORDER = ['lysis', 'proteinase', 'rnase', 'ethanol'];

export const InteractiveDnaExtraction: React.FC<MiniGameProps> = ({ onComplete, onClose }) => {
    const [addedReagents, setAddedReagents] = useState<string[]>([]);
    const [draggedId, setDraggedId] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
    const [tubeGlow, setTubeGlow] = useState<string>('');
    const [isShaking, setIsShaking] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [readyForNextStep, setReadyForNextStep] = useState(false);

    const showFeedback = (message: string, type: 'success' | 'error' | 'info') => {
        setFeedback({ message, type });
        setTimeout(() => setFeedback(null), 3000);
    };

    const handleDragStart = (e: React.DragEvent, reagentId: string) => {
        setDraggedId(reagentId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (!draggedId || isComplete) return;

        const reagent = EXTRACTION_REAGENTS.find(r => r.id === draggedId);
        if (!reagent) return;

        const expectedNext = CORRECT_ORDER[addedReagents.length];

        if (addedReagents.includes(draggedId)) {
            showFeedback('You already added this reagent!', 'info');
        } else if (draggedId === expectedNext) {
            const newAddedReagents = [...addedReagents, draggedId];
            setAddedReagents(newAddedReagents);
            setTubeGlow('shadow-green-500/50');
            showFeedback(`✓ ${reagent.name} added! ${reagent.hint}`, 'success');
            setTimeout(() => setTubeGlow(''), 500);

            if (newAddedReagents.length === CORRECT_ORDER.length) {
                setIsShaking(true);
                setTimeout(() => {
                    setIsShaking(false);
                    setIsComplete(true);
                }, 2000);
            }
        } else if (draggedId === 'water') {
            setTubeGlow('shadow-red-500/50');
            showFeedback(`✗ Wrong reagent! ${reagent.hint}`, 'error');
            setTimeout(() => setTubeGlow(''), 500);
        } else {
            const correctReagent = EXTRACTION_REAGENTS.find(r => r.id === expectedNext);
            setTubeGlow('shadow-yellow-500/50');
            showFeedback(`Not yet! Add ${correctReagent?.name} first (${correctReagent?.hint})`, 'info');
            setTimeout(() => setTubeGlow(''), 500);
        }

        setDraggedId(null);
    };

    if (isComplete) {
        return (
            <div className="text-center p-6">
                <div className="text-6xl mb-4 animate-bounce">🧬</div>
                <h3 className="text-2xl font-bold text-green-400 mb-2">DNA Extraction Complete!</h3>
                <p className="text-gray-300 mb-6">You successfully extracted purified DNA using the correct protocol.</p>
                <div className="bg-gray-800 p-4 rounded-lg mb-6">
                    <h4 className="text-yellow-300 font-bold mb-2">Protocol Summary:</h4>
                    <ol className="text-left text-sm text-gray-300 space-y-1">
                        <li>1. Lysis Buffer → Broke cell membranes</li>
                        <li>2. Proteinase K → Digested proteins</li>
                        <li>3. RNase A → Removed RNA</li>
                        <li>4. Cold Ethanol → Precipitated DNA</li>
                    </ol>
                </div>
                <button
                    onClick={onComplete}
                    className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-lg font-bold text-lg transition-all transform hover:scale-105"
                >
                    Collect Extracted DNA
                </button>
            </div>
        );
    }

    return (
        <div className="p-4">
            <h3 className="text-xl font-bold text-blue-300 mb-2">Interactive DNA Extraction</h3>
            <p className="text-gray-400 text-sm mb-4">Drag reagents to the test tube in the correct order to extract DNA.</p>

            {/* Feedback message */}
            {feedback && (
                <div className={`mb-4 p-3 rounded-lg text-center font-medium animate-pulse ${feedback.type === 'success' ? 'bg-green-900/50 text-green-300 border border-green-500' :
                    feedback.type === 'error' ? 'bg-red-900/50 text-red-300 border border-red-500' :
                        'bg-yellow-900/50 text-yellow-300 border border-yellow-500'
                    }`}>
                    {feedback.message}
                </div>
            )}

            <div className="grid grid-cols-2 gap-6">
                {/* Reagent shelf */}
                <div className="space-y-2">
                    <h4 className="font-bold text-gray-300 flex items-center gap-2">
                        <FlaskConical className="w-5 h-5" /> Reagent Shelf
                    </h4>
                    <div className="space-y-2">
                        {EXTRACTION_REAGENTS.map(reagent => {
                            const Icon = reagent.icon;
                            const isUsed = addedReagents.includes(reagent.id);
                            return (
                                <div
                                    key={reagent.id}
                                    draggable={!isUsed}
                                    onDragStart={(e) => handleDragStart(e, reagent.id)}
                                    className={`p-3 rounded-lg border-2 flex items-center gap-3 transition-all ${isUsed
                                        ? 'bg-gray-800 border-gray-700 opacity-50 cursor-not-allowed'
                                        : `bg-gradient-to-r ${reagent.color} border-white/20 cursor-grab hover:scale-105 hover:shadow-lg active:cursor-grabbing`
                                        }`}
                                >
                                    <Icon className="w-6 h-6 text-white" />
                                    <span className="font-medium text-white">{reagent.name}</span>
                                    {isUsed && <span className="ml-auto text-green-400">✓</span>}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Test tube drop zone */}
                <div className="flex flex-col items-center">
                    <h4 className="font-bold text-gray-300 mb-2">Test Tube</h4>
                    <div
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        className={`relative w-32 h-64 rounded-b-full rounded-t-lg border-4 border-gray-500 bg-gray-800/50 flex flex-col-reverse items-center overflow-hidden transition-all ${tubeGlow} ${isShaking ? 'animate-shake' : ''
                            }`}
                    >
                        {/* Tube contents */}
                        {addedReagents.map((reagentId, index) => {
                            const reagent = EXTRACTION_REAGENTS.find(r => r.id === reagentId);
                            if (!reagent) return null;
                            return (
                                <div
                                    key={reagentId}
                                    className={`w-full h-12 bg-gradient-to-r ${reagent.color} flex items-center justify-center text-xs font-bold text-white opacity-90`}
                                    style={{ animation: 'fadeInUp 0.3s ease-out' }}
                                >
                                    {reagent.name.split(' ')[0]}
                                </div>
                            );
                        })}

                        {/* Drop hint */}
                        {addedReagents.length < CORRECT_ORDER.length && (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm text-center p-4 pointer-events-none">
                                {draggedId ? '⬇️ Drop here!' : 'Drag reagents here'}
                            </div>
                        )}

                        {/* Tube cap */}
                        <div className="absolute -top-3 w-20 h-6 bg-gray-600 rounded-t-lg border-2 border-gray-500" />
                    </div>

                    {/* Progress indicator */}
                    <div className="mt-4 flex gap-1">
                        {CORRECT_ORDER.map((_, idx) => (
                            <div
                                key={idx}
                                className={`w-3 h-3 rounded-full transition-all ${idx < addedReagents.length ? 'bg-green-500' : 'bg-gray-600'
                                    }`}
                            />
                        ))}
                    </div>
                    <p className="text-gray-400 text-sm mt-2">Step {addedReagents.length + 1} of {CORRECT_ORDER.length}</p>
                </div>
            </div>

            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0) rotate(0); }
                    20% { transform: translateX(-5px) rotate(-2deg); }
                    40% { transform: translateX(5px) rotate(2deg); }
                    60% { transform: translateX(-3px) rotate(-1deg); }
                    80% { transform: translateX(3px) rotate(1deg); }
                }
                .animate-shake { animation: shake 0.5s ease-in-out infinite; }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

// ============================================================================
// INTERACTIVE ELECTROPHORESIS - Voltage Control & Band Migration
// ============================================================================

interface DNAFragment {
    id: number;
    size: number; // bp
    position: number; // migration distance 0-100
    lane: number;
}

export const InteractiveElectrophoresis: React.FC<MiniGameProps> = ({ onComplete, onClose }) => {
    const [voltage, setVoltage] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [samples, setSamples] = useState<DNAFragment[]>([]);
    const [loadedWells, setLoadedWells] = useState<boolean[]>([false, false, false, false]);
    const [draggedSample, setDraggedSample] = useState<number | null>(null);
    const [runTime, setRunTime] = useState(0);
    const [phase, setPhase] = useState<'load' | 'run' | 'complete'>('load');

    const SAMPLE_SIZES: number[][] = [
        [500, 1000, 2500, 5000],      // Crime scene
        [750, 1500, 3000, 6000],      // Suspect 1
        [500, 1000, 2500, 5000],      // Suspect 2 (matches!)
        [600, 1200, 2800, 5500],      // Suspect 3
    ];

    const handleLoadWell = (wellIndex: number) => {
        if (loadedWells[wellIndex] || draggedSample === null) return;

        const newLoadedWells = [...loadedWells];
        newLoadedWells[wellIndex] = true;
        setLoadedWells(newLoadedWells);

        const newSamples = SAMPLE_SIZES[wellIndex].map((size, i) => ({
            id: wellIndex * 10 + i,
            size,
            position: 0,
            lane: wellIndex,
        }));
        setSamples(prev => [...prev, ...newSamples]);
        setDraggedSample(null);
    };

    const allWellsLoaded = loadedWells.every(Boolean);

    // Migration simulation
    useEffect(() => {
        if (!isRunning || voltage === 0) return;

        const timer = setInterval(() => {
            setSamples(prev => prev.map(fragment => {
                // Smaller fragments migrate faster (inversely proportional to log of size)
                const migrationRate = (voltage / 100) * (10 / Math.log10(fragment.size));
                return {
                    ...fragment,
                    position: Math.min(fragment.position + migrationRate, 95)
                };
            }));
            setRunTime(prev => prev + 0.1);
        }, 100);

        return () => clearInterval(timer);
    }, [isRunning, voltage]);

    // Check completion
    useEffect(() => {
        if (samples.length > 0 && samples.every(s => s.position > 40) && isRunning) {
            setIsRunning(false);
            setPhase('complete');
        }
    }, [samples, isRunning]);

    if (phase === 'complete') {
        return (
            <div className="text-center p-6">
                <div className="text-6xl mb-4">⚡</div>
                <h3 className="text-2xl font-bold text-blue-400 mb-2">Electrophoresis Complete!</h3>
                <p className="text-gray-300 mb-4">DNA fragments have been separated by size.</p>

                {/* Results visualization */}
                <div className="bg-gray-900 p-4 rounded-lg mb-6 border-2 border-blue-500">
                    <div className="flex justify-around">
                        {['Crime Scene', 'Suspect 1', 'Suspect 2', 'Suspect 3'].map((label, i) => (
                            <div key={i} className="text-center">
                                <p className="text-xs text-gray-400 mb-2">{label}</p>
                                <div className="w-8 h-40 bg-gray-800 rounded relative">
                                    {samples.filter(s => s.lane === i).map(fragment => (
                                        <div
                                            key={fragment.id}
                                            className={`absolute w-full h-1.5 rounded-full ${i === 2 ? 'bg-green-400' : 'bg-pink-400'}`}
                                            style={{ top: `${fragment.position}%` }}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    <p className="text-green-400 mt-4 font-bold">🔍 Suspect 2 matches the crime scene DNA!</p>
                </div>

                <button
                    onClick={onComplete}
                    className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-lg font-bold text-lg transition-all transform hover:scale-105"
                >
                    Continue Analysis
                </button>
            </div>
        );
    }

    return (
        <div className="p-4">
            <h3 className="text-xl font-bold text-blue-300 mb-2">Gel Electrophoresis</h3>
            <p className="text-gray-400 text-sm mb-4">
                {phase === 'load'
                    ? 'Drag DNA samples to load the wells, then run electrophoresis.'
                    : 'Adjust voltage to separate DNA fragments by size.'}
            </p>

            <div className="grid grid-cols-3 gap-4">
                {/* Sample tubes */}
                <div className="space-y-2">
                    <h4 className="font-bold text-gray-300 flex items-center gap-2">
                        <Pipette className="w-5 h-5" /> DNA Samples
                    </h4>
                    {['Crime Scene', 'Suspect 1', 'Suspect 2', 'Suspect 3'].map((label, i) => (
                        <div
                            key={i}
                            draggable={!loadedWells[i]}
                            onDragStart={() => setDraggedSample(i)}
                            className={`p-2 rounded-lg border-2 text-sm transition-all ${loadedWells[i]
                                ? 'bg-gray-800 border-gray-700 opacity-50'
                                : 'bg-gradient-to-r from-pink-500 to-purple-600 border-white/20 cursor-grab hover:scale-105'
                                }`}
                        >
                            {label} {loadedWells[i] && '✓'}
                        </div>
                    ))}
                </div>

                {/* Gel apparatus */}
                <div className="col-span-2">
                    <div className="bg-gray-900 p-4 rounded-lg border-2 border-gray-700">
                        {/* Electrodes */}
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-red-400 font-bold">− Cathode</span>
                            <span className="text-blue-400 font-bold">+ Anode</span>
                        </div>

                        {/* Wells and gel */}
                        <div className="relative bg-blue-900/30 rounded-lg h-48 border border-blue-800 overflow-hidden">
                            {/* Loading wells */}
                            <div className="absolute top-0 left-0 right-0 flex justify-around p-2">
                                {loadedWells.map((loaded, i) => (
                                    <div
                                        key={i}
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={() => handleLoadWell(i)}
                                        className={`w-10 h-4 rounded-sm border-2 transition-all ${loaded
                                            ? 'bg-pink-500 border-pink-400'
                                            : draggedSample !== null
                                                ? 'bg-blue-600 border-blue-400 animate-pulse'
                                                : 'bg-gray-700 border-gray-600'
                                            }`}
                                    />
                                ))}
                            </div>

                            {/* Migrating bands */}
                            {samples.map(fragment => (
                                <div
                                    key={fragment.id}
                                    className="absolute w-8 h-1 bg-pink-400 rounded-full shadow-lg shadow-pink-500/50 transition-all duration-100"
                                    style={{
                                        left: `${10 + fragment.lane * 22}%`,
                                        top: `${10 + fragment.position * 0.8}%`,
                                    }}
                                />
                            ))}

                            {/* Electric current visualization */}
                            {isRunning && voltage > 0 && (
                                <div className="absolute inset-0 pointer-events-none">
                                    {[...Array(5)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="absolute h-full w-px bg-gradient-to-b from-blue-400 via-transparent to-blue-400 opacity-30"
                                            style={{
                                                left: `${20 + i * 15}%`,
                                                animation: `pulse 1s ease-in-out infinite ${i * 0.2}s`
                                            }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Controls */}
                        <div className="mt-4 space-y-3">
                            <div className="flex items-center gap-4">
                                <Zap className={`w-5 h-5 ${isRunning ? 'text-yellow-400 animate-pulse' : 'text-gray-500'}`} />
                                <input
                                    type="range"
                                    min={0}
                                    max={150}
                                    value={voltage}
                                    onChange={(e) => setVoltage(Number(e.target.value))}
                                    disabled={!allWellsLoaded || phase === 'complete'}
                                    className="flex-grow accent-blue-500"
                                />
                                <span className={`text-sm font-mono w-16 ${voltage > 0 ? 'text-yellow-400' : 'text-gray-500'}`}>
                                    {voltage}V
                                </span>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsRunning(!isRunning)}
                                    disabled={!allWellsLoaded || voltage === 0}
                                    className={`flex-grow py-2 rounded-lg font-bold transition-all ${isRunning
                                        ? 'bg-red-600 hover:bg-red-700'
                                        : allWellsLoaded && voltage > 0
                                            ? 'bg-green-600 hover:bg-green-700'
                                            : 'bg-gray-700 cursor-not-allowed'
                                        }`}
                                >
                                    {isRunning ? '⏸ Pause' : '▶ Run'}
                                </button>
                            </div>

                            {isRunning && (
                                <p className="text-center text-sm text-blue-300 animate-pulse">
                                    Running... {runTime.toFixed(1)}s
                                </p>
                            )}

                            {!allWellsLoaded && (
                                <p className="text-center text-sm text-yellow-400">
                                    Load all 4 samples to begin
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// INTERACTIVE SOUTHERN BLOTTING - Transfer Visualization
// ============================================================================

export const InteractiveSouthernBlotting: React.FC<MiniGameProps> = ({ onComplete, onClose }) => {
    const [step, setStep] = useState(0);
    const [isTransferring, setIsTransferring] = useState(false);
    const [transferProgress, setTransferProgress] = useState(0);
    const [uvExposed, setUvExposed] = useState(false);

    const steps = [
        { title: 'Prepare Gel', icon: '🧪', description: 'Place the electrophoresis gel on the blotting apparatus' },
        { title: 'Add Membrane', icon: '📄', description: 'Place nitrocellulose membrane on top of the gel' },
        { title: 'Set Up Stack', icon: '📚', description: 'Add filter papers and weight for capillary transfer' },
        { title: 'Transfer DNA', icon: '⬆️', description: 'Allow buffer to transfer DNA from gel to membrane' },
        { title: 'UV Crosslink', icon: '☀️', description: 'Fix DNA permanently to membrane with UV light' },
    ];

    const handleNextStep = () => {
        if (step === 3) {
            setIsTransferring(true);
        } else if (step === 4) {
            setUvExposed(true);
            setTimeout(() => {
                onComplete();
            }, 2000);
        } else {
            setStep(s => s + 1);
        }
    };

    useEffect(() => {
        if (!isTransferring) return;

        const timer = setInterval(() => {
            setTransferProgress(prev => {
                if (prev >= 100) {
                    setIsTransferring(false);
                    setStep(4);
                    return 100;
                }
                return prev + 2;
            });
        }, 100);

        return () => clearInterval(timer);
    }, [isTransferring]);

    return (
        <div className="p-4">
            <h3 className="text-xl font-bold text-yellow-300 mb-2">Southern Blotting</h3>
            <p className="text-gray-400 text-sm mb-4">Transfer DNA from gel to membrane for hybridization.</p>

            {/* Step progress */}
            <div className="flex justify-between mb-6">
                {steps.map((s, i) => (
                    <div key={i} className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all ${i < step ? 'bg-green-600' :
                            i === step ? 'bg-yellow-500 animate-pulse' :
                                'bg-gray-700'
                            }`}>
                            {i < step ? '✓' : s.icon}
                        </div>
                        <span className={`text-xs mt-1 ${i === step ? 'text-yellow-400' : 'text-gray-500'}`}>
                            {s.title}
                        </span>
                    </div>
                ))}
            </div>

            {/* Visualization */}
            <div className="relative bg-gray-900 rounded-xl p-6 h-64 border-2 border-yellow-500/30 overflow-hidden">
                {/* UV light effect */}
                {uvExposed && (
                    <div className="absolute inset-0 bg-gradient-to-b from-purple-500/50 to-transparent animate-pulse" />
                )}

                {/* Blotting stack visualization */}
                <div className="relative h-full flex flex-col items-center justify-end">
                    {/* Weight */}
                    {step >= 2 && (
                        <div className="w-40 h-6 bg-gray-600 rounded-t-lg border-2 border-gray-500 flex items-center justify-center text-xs text-gray-300">
                            Weight
                        </div>
                    )}

                    {/* Paper towels */}
                    {step >= 2 && (
                        <div className="w-48 h-12 bg-gray-400 border-x-2 border-gray-500 flex items-center justify-center text-xs text-gray-700">
                            Paper Towels
                        </div>
                    )}

                    {/* Membrane */}
                    {step >= 1 && (
                        <div className={`w-48 h-8 border-2 border-yellow-400 flex items-center justify-center text-xs transition-all ${uvExposed ? 'bg-yellow-300 text-gray-800' : 'bg-white/90 text-gray-700'
                            }`}>
                            Membrane {uvExposed && '(DNA Fixed!)'}
                            {/* Transferred bands */}
                            {transferProgress > 0 && (
                                <div className="absolute flex gap-4">
                                    {[20, 40, 60, 80].map((pos, i) => (
                                        <div
                                            key={i}
                                            className="w-6 h-1 bg-pink-400 rounded-full transition-all"
                                            style={{ opacity: transferProgress / 100 }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Gel */}
                    <div className="w-48 h-12 bg-blue-800 border-2 border-blue-600 flex items-center justify-center relative overflow-hidden">
                        <span className="text-xs text-blue-200">Agarose Gel</span>
                        {/* DNA bands in gel */}
                        <div className="absolute flex gap-4">
                            {[20, 40, 60, 80].map((pos, i) => (
                                <div
                                    key={i}
                                    className="w-6 h-1 bg-pink-400 rounded-full transition-all"
                                    style={{
                                        opacity: isTransferring ? 1 - (transferProgress / 100) : (step < 3 ? 1 : transferProgress > 0 ? 0 : 1)
                                    }}
                                />
                            ))}
                        </div>

                        {/* Transfer arrows */}
                        {isTransferring && (
                            <div className="absolute -top-4 flex gap-4">
                                {[0, 1, 2, 3].map(i => (
                                    <span key={i} className="text-yellow-400 animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}>
                                        ↑
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Buffer tray */}
                    <div className="w-56 h-4 bg-cyan-800 rounded-b-lg border-2 border-cyan-600" />
                </div>
            </div>

            {/* Current step info and action */}
            <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                <p className="text-gray-300 mb-3">{steps[step].description}</p>

                {isTransferring ? (
                    <div>
                        <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all"
                                style={{ width: `${transferProgress}%` }}
                            />
                        </div>
                        <p className="text-center text-sm text-yellow-400 mt-2 animate-pulse">
                            Transferring DNA... {transferProgress}%
                        </p>
                    </div>
                ) : (
                    <button
                        onClick={handleNextStep}
                        className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 rounded-lg font-bold transition-all transform hover:scale-105"
                    >
                        {step < 4 ? steps[step].title : '☀️ UV Crosslink DNA'}
                    </button>
                )}
            </div>
        </div>
    );
};


// ============================================================================
// INTERACTIVE PROBE HYBRIDIZATION - Probe Binding & Washing
// ============================================================================


export const InteractiveProbeHybridization: React.FC<MiniGameProps> = ({ onComplete, onClose }) => {
    const [step, setStep] = useState(0);
    const [membraneRef, setMembraneRef] = useState<HTMLDivElement | null>(null);
    const [draggedItem, setDraggedItem] = useState<'probe' | 'wash' | null>(null);
    const [probeAdded, setProbeAdded] = useState(false);
    const [washed, setWashed] = useState(false);

    // Step 0: Add Probe
    // Step 1: Incubate (auto)
    // Step 2: Wash
    // Step 3: Complete

    const handleDragStart = (e: React.DragEvent, item: 'probe' | 'wash') => {
        setDraggedItem(item);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();

        if (draggedItem === 'probe' && step === 0) {
            setProbeAdded(true);
            setStep(1);
            // Simulate incubation
            setTimeout(() => {
                setStep(2);
            }, 2500);
        } else if (draggedItem === 'wash' && step === 2) {
            setWashed(true);
            setStep(3);
        }

        setDraggedItem(null);
    };

    if (step === 3) {
        return (
            <div className="text-center p-6">
                <div className="text-6xl mb-4 animate-pulse">☢️</div>
                <h3 className="text-2xl font-bold text-purple-400 mb-2">Hybridization Complete!</h3>
                <p className="text-gray-300 mb-6">The radioactive probe has bound specifically to the target DNA sequences.</p>
                <button
                    onClick={onComplete}
                    className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 rounded-lg font-bold text-lg transition-all transform hover:scale-105"
                >
                    Proceed to Detection
                </button>
            </div>
        );
    }

    return (
        <div className="p-4">
            <h3 className="text-xl font-bold text-purple-300 mb-2">Probe Hybridization</h3>
            <p className="text-gray-400 text-sm mb-4">
                {step === 0 ? 'Drag the Radioactive Probe to the membrane.' :
                    step === 1 ? 'Incubating... Probe is binding to target DNA.' :
                        'Drag the Wash Buffer to remove unbound probe.'}
            </p>

            <div className="grid grid-cols-3 gap-6">
                {/* Tools */}
                <div className="space-y-4">
                    <div
                        draggable={step === 0}
                        onDragStart={(e) => handleDragStart(e, 'probe')}
                        className={`p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${step === 0
                            ? 'bg-purple-900/50 border-purple-500 cursor-grab hover:scale-105'
                            : 'bg-gray-800 border-gray-700 opacity-50 cursor-not-allowed'
                            }`}
                    >
                        <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center animate-pulse">☢️</div>
                        <span className="font-bold text-purple-200">Radioactive Probe</span>
                    </div>

                    <div
                        draggable={step === 2}
                        onDragStart={(e) => handleDragStart(e, 'wash')}
                        className={`p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${step === 2
                            ? 'bg-blue-900/50 border-blue-500 cursor-grab hover:scale-105'
                            : 'bg-gray-800 border-gray-700 opacity-50 cursor-not-allowed'
                            }`}
                    >
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">💧</div>
                        <span className="font-bold text-blue-200">Wash Buffer</span>
                    </div>
                </div>

                {/* Membrane Area */}
                <div className="col-span-2 flex items-center justify-center">
                    <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                        className={`w-64 h-80 bg-white/90 rounded-lg border-4 transition-all relative overflow-hidden flex items-center justify-center ${step === 0 && draggedItem === 'probe' ? 'border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.5)]' :
                            step === 2 && draggedItem === 'wash' ? 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]' :
                                'border-gray-300'
                            }`}
                    >
                        <span className="text-gray-400 absolute top-2 font-mono text-xs">Nitrocellulose Membrane</span>

                        {/* DNA Bands (invisible initially, probe highlights them) */}
                        <div className="space-y-8 w-full px-8">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="w-full h-2 rounded-full relative bg-gray-200">
                                    {/* Probe glow effect */}
                                    {(probeAdded || washed) && (
                                        <div className={`absolute inset-0 bg-purple-500 rounded-full transition-all duration-1000 ${step === 1 ? 'opacity-50 blur-sm' :
                                            step >= 2 ? 'opacity-100 shadow-[0_0_10px_rgba(168,85,247,0.8)]' : 'opacity-0'
                                            }`} />
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Floating probe particles during incubation */}
                        {step === 1 && (
                            <div className="absolute inset-0 pointer-events-none">
                                {[...Array(20)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="absolute w-2 h-2 bg-purple-400 rounded-full animate-ping"
                                        style={{
                                            left: `${Math.random() * 100}%`,
                                            top: `${Math.random() * 100}%`,
                                            animationDuration: `${1 + Math.random()}s`,
                                            animationDelay: `${Math.random()}s`
                                        }}
                                    />
                                ))}
                                <div className="absolute inset-x-0 bottom-4 text-center font-bold text-purple-600 animate-bounce">
                                    Hybridizing...
                                </div>
                            </div>
                        )}

                        {/* Washing effect */}
                        {step === 2 && !washed && (
                            <div className="absolute inset-0 pointer-events-none bg-purple-200/30" />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// INTERACTIVE AUTORADIOGRAPHY - Film Exposure & Reveal
// ============================================================================

export const InteractiveAutoradiography: React.FC<MiniGameProps> = ({ onComplete, onClose }) => {
    const [hasFilm, setHasFilm] = useState(false);
    const [exposureProgress, setExposureProgress] = useState(0);
    const [isDeveloping, setIsDeveloping] = useState(false);
    const [isFilmReady, setIsFilmReady] = useState(false);

    // 0: Place Film
    // 1: Exposing (timer)
    // 2: Develop
    // 3: Film Ready
    // 4: Result Complete

    useEffect(() => {
        if (hasFilm && exposureProgress < 100) {
            const timer = setInterval(() => {
                setExposureProgress(prev => {
                    if (prev >= 100) {
                        return 100;
                    }
                    return prev + 1;
                });
            }, 50);
            return () => clearInterval(timer);
        }
    }, [hasFilm, exposureProgress]);

    const handleDevelop = () => {
        setIsDeveloping(true);
        setTimeout(() => {
            setIsDeveloping(false);
            setIsFilmReady(true);
        }, 3000);
    };

    // Show the developed film
    if (isFilmReady) {
        return (
            <div className="p-4 h-full flex flex-col">
                <h3 className="text-xl font-bold text-pink-300 mb-2">Autoradiography Complete</h3>
                <p className="text-gray-400 text-sm mb-4">Here is your developed film showing the DNA pattern:</p>

                <div className="flex-grow flex items-center justify-center">
                    <div className="w-72 h-96 bg-black rounded-lg border-4 border-pink-500 relative overflow-hidden flex flex-col items-center justify-center p-6">
                        <span className="text-pink-300 font-mono text-xs mb-4">Developed Film</span>

                        {/* DNA Band Pattern */}
                        <div className="space-y-6 w-full px-8">
                            {/* Crime Scene Lane */}
                            <div className="flex items-center gap-4">
                                <span className="text-pink-300 text-xs w-16">Crime</span>
                                <div className="flex-grow space-y-1">
                                    <div className="h-1.5 bg-pink-300 rounded-full shadow-lg shadow-pink-500/50" style={{ width: '60%' }}></div>
                                    <div className="h-1.5 bg-pink-300 rounded-full shadow-lg shadow-pink-500/50" style={{ width: '50%' }}></div>
                                    <div className="h-1.5 bg-pink-300 rounded-full shadow-lg shadow-pink-500/50" style={{ width: '40%' }}></div>
                                    <div className="h-1.5 bg-pink-300 rounded-full shadow-lg shadow-pink-500/50" style={{ width: '30%' }}></div>
                                </div>
                            </div>

                            {/* Suspect 1 Lane */}
                            <div className="flex items-center gap-4">
                                <span className="text-pink-300 text-xs w-16">Susp. 1</span>
                                <div className="flex-grow space-y-1">
                                    <div className="h-1.5 bg-pink-300 rounded-full shadow-lg shadow-pink-500/50" style={{ width: '70%' }}></div>
                                    <div className="h-1.5 bg-pink-300 rounded-full shadow-lg shadow-pink-500/50" style={{ width: '55%' }}></div>
                                    <div className="h-1.5 bg-pink-300 rounded-full shadow-lg shadow-pink-500/50" style={{ width: '45%' }}></div>
                                    <div className="h-1.5 bg-pink-300 rounded-full shadow-lg shadow-pink-500/50" style={{ width: '35%' }}></div>
                                </div>
                            </div>

                            {/* Suspect 2 Lane (Match!) */}
                            <div className="flex items-center gap-4 p-2 bg-green-900/40 rounded border border-green-500/50">
                                <span className="text-green-400 text-xs w-16 font-bold">Susp. 2</span>
                                <div className="flex-grow space-y-1">
                                    <div className="h-1.5 bg-green-400 rounded-full shadow-lg shadow-green-500/50" style={{ width: '60%' }}></div>
                                    <div className="h-1.5 bg-green-400 rounded-full shadow-lg shadow-green-500/50" style={{ width: '50%' }}></div>
                                    <div className="h-1.5 bg-green-400 rounded-full shadow-lg shadow-green-500/50" style={{ width: '40%' }}></div>
                                    <div className="h-1.5 bg-green-400 rounded-full shadow-lg shadow-green-500/50" style={{ width: '30%' }}></div>
                                </div>
                            </div>

                            {/* Suspect 3 Lane */}
                            <div className="flex items-center gap-4">
                                <span className="text-pink-300 text-xs w-16">Susp. 3</span>
                                <div className="flex-grow space-y-1">
                                    <div className="h-1.5 bg-pink-300 rounded-full shadow-lg shadow-pink-500/50" style={{ width: '65%' }}></div>
                                    <div className="h-1.5 bg-pink-300 rounded-full shadow-lg shadow-pink-500/50" style={{ width: '48%' }}></div>
                                    <div className="h-1.5 bg-pink-300 rounded-full shadow-lg shadow-pink-500/50" style={{ width: '42%' }}></div>
                                    <div className="h-1.5 bg-pink-300 rounded-full shadow-lg shadow-pink-500/50" style={{ width: '32%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <p className="text-green-400 font-bold mb-4">✓ DNA Pattern Analysis Complete!</p>
                    <p className="text-gray-400 mb-6">Suspect 2's DNA matches the crime scene DNA pattern.</p>
                    <button
                        onClick={onComplete}
                        className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-lg font-bold text-white shadow-lg transform transition-all hover:scale-105"
                    >
                        Complete Analysis
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 h-full flex flex-col">
            <h3 className="text-xl font-bold text-pink-300 mb-2">Autoradiography</h3>

            <div className="flex-grow flex items-center justify-center relative">
                {/* Cassette / Membrane Base */}
                <div className="w-64 h-80 bg-gray-800 rounded-lg border-4 border-gray-600 relative flex items-center justify-center overflow-hidden">
                    {/* Membrane (underneath) */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-50">
                        <span className="text-gray-500 font-mono text-xs">Membrane (Radioactive)</span>
                    </div>

                    {/* X-Ray Film Overlay */}
                    {hasFilm ? (
                        <div className={`absolute inset-0 transition-all duration-[5s] ${isDeveloping ? 'bg-black' : 'bg-gray-900/90'
                            }`}>
                            {exposureProgress < 100 ? (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-16 h-16 border-4 border-t-pink-500 border-gray-600 rounded-full animate-spin" />
                                    <span className="absolute mt-24 text-pink-400 font-mono">Exposing... {exposureProgress}%</span>
                                </div>
                            ) : isDeveloping ? (
                                <div className="absolute inset-0 flex items-center justify-center flex-col">
                                    <div className="text-6xl animate-bounce">🖼️</div>
                                    <span className="text-white mt-4">Developing Film...</span>
                                </div>
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-green-400 font-bold border-2 border-green-500 px-4 py-2 rounded">Exposure Complete</span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center border-2 border-dashed border-gray-500 m-4 rounded hover:bg-gray-700/50 cursor-pointer transition-colors"
                            onClick={() => setHasFilm(true)}>
                            <span className="text-gray-300">Click to place X-Ray Film</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-6 text-center h-16">
                {!hasFilm && (
                    <p className="text-gray-400 animate-pulse">Place the X-ray film over the membrane to detect radioactivity.</p>
                )}
                {hasFilm && exposureProgress < 100 && (
                    <p className="text-pink-300">Radioactive decay is creating latent images on the film...</p>
                )}
                {exposureProgress === 100 && !isDeveloping && !isFilmReady && (
                    <button
                        onClick={handleDevelop}
                        className="px-8 py-3 bg-gradient-to-r from-pink-500 to-red-600 hover:from-pink-600 hover:to-red-700 rounded-lg font-bold text-white shadow-lg transform transition-all hover:scale-105"
                    >
                        Develop Film
                    </button>
                )}
            </div>
        </div>
    );
};

// ============================================================================
// INTERACTIVE DNA DIGESTION - Enzyme Selection & Incubation
// ============================================================================

export const InteractiveDnaDigestion: React.FC<MiniGameProps> = ({ onComplete, onClose }) => {
    const [selectedEnzyme, setSelectedEnzyme] = useState<string | null>(null);
    const [enzymeAdded, setEnzymeAdded] = useState(false);
    const [temperature, setTemperature] = useState(25);
    const [digestionTime, setDigestionTime] = useState(0);
    const [isIncubating, setIsIncubating] = useState(false);
    const [isDigested, setIsDigested] = useState(false);

    const enzymes = [
        { id: 'ecori', name: 'EcoRI', seq: 'G|AATTC', optimalTemp: 37, color: 'bg-red-500' },
        { id: 'hindiii', name: 'HindIII', seq: 'A|AGCTT', optimalTemp: 37, color: 'bg-blue-500' },
        { id: 'bamhi', name: 'BamHI', seq: 'G|GATCC', optimalTemp: 37, color: 'bg-green-500' },
    ];

    // Drag handlers
    const handleDragStart = (e: React.DragEvent, enzymeId: string) => {
        e.dataTransfer.setData('enzymeId', enzymeId);
        e.dataTransfer.effectAllowed = 'copy';
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (enzymeAdded) return;

        const enzymeId = e.dataTransfer.getData('enzymeId');
        if (enzymeId) {
            setSelectedEnzyme(enzymeId);
            setEnzymeAdded(true);
        }
    };

    // Incubation logic
    useEffect(() => {
        if (isIncubating && temperature >= 35 && temperature <= 40) {
            const timer = setInterval(() => {
                setDigestionTime(t => {
                    if (t >= 100) {
                        setIsIncubating(false);
                        setIsDigested(true);
                        return 100;
                    }
                    return t + 2;
                });
            }, 100);
            return () => clearInterval(timer);
        }
    }, [isIncubating, temperature]);

    if (isDigested) {
        return (
            <div className="text-center p-6">
                <div className="text-6xl mb-4 animate-bounce">✂️</div>
                <h3 className="text-2xl font-bold text-green-400 mb-2">Digestion Complete!</h3>
                <p className="text-gray-300 mb-6">The restriction enzyme has cut the DNA at specific recognition sites, creating fragments.</p>
                <button
                    onClick={onComplete}
                    className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-lg font-bold text-lg transition-all transform hover:scale-105"
                >
                    Proceed to Electrophoresis
                </button>
            </div>
        );
    }

    return (
        <div className="p-4 h-full flex flex-col">
            <h3 className="text-xl font-bold text-red-300 mb-2">Restriction Digestion</h3>
            <p className="text-gray-400 text-sm mb-4">
                Select an enzyme, add it to the DNA sample, and incubate at 37°C.
            </p>

            <div className="grid grid-cols-2 gap-8 flex-grow">
                {/* Enzyme Freezer */}
                <div className="bg-gray-800 rounded-xl p-4 border-2 border-blue-300/30">
                    <h4 className="font-bold text-blue-200 mb-3 flex items-center gap-2">
                        ❄️ Enzyme Freezer
                    </h4>
                    <div className="space-y-3">
                        {enzymes.map((enzyme) => (
                            <div
                                key={enzyme.id}
                                draggable={!enzymeAdded}
                                onDragStart={(e) => handleDragStart(e, enzyme.id)}
                                className={`p-3 rounded-lg border flex justify-between items-center cursor-grab active:cursor-grabbing hover:scale-105 transition-all ${enzymeAdded && selectedEnzyme === enzyme.id ? 'opacity-50' : 'hover:shadow-lg'
                                    } ${enzyme.color} bg-opacity-20 border-${enzyme.color.split('-')[1]}-400`}
                            >
                                <div>
                                    <span className="font-bold text-white block">{enzyme.name}</span>
                                    <span className="text-xs font-mono text-gray-300">{enzyme.seq}</span>
                                </div>
                                <div className={`w-8 h-8 rounded-full ${enzyme.color} flex items-center justify-center`}>
                                    ✂️
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Workstation */}
                <div className="flex flex-col items-center justify-center space-y-6">
                    {/* Reaction Tube */}
                    <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                        className={`w-32 h-40 bg-gray-700 rounded-b-3xl rounded-t-lg border-4 relative overflow-hidden transition-all ${enzymeAdded ? 'border-green-400 shadow-[0_0_20px_rgba(74,222,128,0.3)]' : 'border-gray-500 border-dashed'
                            }`}
                    >
                        {/* Liquid */}
                        <div className="absolute inset-x-0 bottom-0 h-20 bg-blue-500/30 backdrop-blur-sm transition-all duration-500">
                            {/* DNA Strands */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-50">
                                🧬
                            </div>
                            {/* Added Enzyme */}
                            {enzymeAdded && (
                                <div className="absolute inset-x-0 bottom-0 h-full bg-green-500/20 animate-pulse" />
                            )}
                        </div>

                        {!enzymeAdded && (
                            <div className="absolute inset-0 flex items-center justify-center text-center p-2">
                                <span className="text-gray-400 text-xs">Drop Enzyme Here</span>
                            </div>
                        )}
                    </div>

                    {/* Heat Block / Controls */}
                    <div className="bg-gray-800 p-4 rounded-lg border border-gray-600 w-full">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-300 text-sm">Temperature</span>
                            <span className={`font-mono font-bold ${temperature >= 36 && temperature <= 38 ? 'text-green-400' : 'text-red-400'
                                }`}>{temperature}°C</span>
                        </div>
                        <input
                            type="range"
                            min="20"
                            max="50"
                            value={temperature}
                            onChange={(e) => setTemperature(Number(e.target.value))}
                            disabled={!enzymeAdded || isIncubating}
                            className="w-full accent-red-500 mb-4"
                        />

                        <button
                            onClick={() => setIsIncubating(true)}
                            disabled={!enzymeAdded || isIncubating || isDigested}
                            className={`w-full py-2 rounded font-bold transition-all ${isIncubating
                                    ? 'bg-yellow-600 text-white animate-pulse'
                                    : !enzymeAdded
                                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                        : 'bg-red-600 hover:bg-red-700 text-white'
                                }`}
                        >
                            {isIncubating ? `Digesting... ${digestionTime}%` : 'Start Incubation'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default {
    InteractiveDnaExtraction,
    InteractiveElectrophoresis,
    InteractiveSouthernBlotting,
    InteractiveProbeHybridization,
    InteractiveAutoradiography,
    InteractiveDnaDigestion,
};

