import React, { useState, useEffect } from 'react';
import { Dna, GitCommit, Map, Target, BookCheck, Factory, Binary, Microscope } from 'lucide-react';

interface MiniGameProps {
    onComplete: () => void;
    onClose?: () => void;
}

const MiniGameButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, className, ...props }) => (
    <button
        {...props}
        className={`w-full text-left p-3 bg-blue-600 hover:bg-blue-700 rounded-md transition-all disabled:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed my-1 ${className || ''}`}
    >
        {children}
    </button>
);

export const EvidenceCollection: React.FC<MiniGameProps> = ({ onComplete, onClose }) => {
    const [currentSlide, setCurrentSlide] = useState<number | null>(null);

    const slides = [
        {
            title: 'Introduction to RFLP',
            content: [
                'RFLP = Restriction Fragment Length Polymorphism',
                'Molecular technique for DNA analysis & identification',
                'First DNA fingerprinting method (1980s)',
                'Applications: Forensics, paternity testing, disease diagnosis, genome mapping'
            ]
        },
        {
            title: 'Principle - Restriction Enzymes & Polymorphism',
            content: [
                'Restriction Enzymes:',
                '• "Molecular scissors"',
                '• Recognize specific DNA sequences (e.g., GAATTC)',
                '• Cut DNA at precise locations',
                '',
                'Polymorphism = Natural DNA variations',
                '',
                'Two Types:',
                '1. Restriction site polymorphism - mutations create/destroy cut sites',
                '2. VNTR polymorphism (main source)',
                '   • Variable Number Tandem Repeats',
                '   • Short sequences repeated multiple times',
                '   • Number of repeats varies between individuals'
            ]
        },
        {
            title: 'How RFLP Creates DNA Fingerprints',
            content: [
                'Example:',
                'Person A: [Cut]--5 VNTR repeats--[Cut] = 2kb fragment',
                'Person B: [Cut]--10 VNTR repeats--[Cut] = 4kb fragment',
                '',
                'Result:',
                '• Same restriction sites, different VNTR lengths',
                '• Different fragment sizes = unique band pattern',
                '',
                'Role of Probes:',
                '• Complementary to flanking regions',
                '• Isolate specific VNTR fragments from thousands',
                '• Create visible DNA fingerprint',
                '',
                'Output: Unique genetic "barcode" for each individual'
            ]
        }
    ];

    return (
        <div className="relative">
            <h3 className="text-lg font-bold mb-2">Case File: The Missing Mascot</h3>
            <p className="text-sm mb-4">BLOOD sample was found at the scene. Learn about RFLP analysis and collect the sample.</p>
            
            <div className="grid grid-cols-3 gap-2 mb-4">
                {slides.map((slide, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className="p-2 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-all"
                    >
                        {`Slide ${index + 1}: ${slide.title}`}
                    </button>
                ))}
            </div>

            {currentSlide !== null && (
                <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-[4000] backdrop-blur-sm">
                    <div className="bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 p-8 rounded-2xl max-w-3xl w-full border-4 border-blue-400 shadow-2xl shadow-blue-500/50 transform transition-all animate-slide-in">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-blue-400">
                            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                                </svg>
                            </div>
                            <h4 className="text-2xl font-bold text-blue-200 flex-grow">{slides[currentSlide].title}</h4>
                            <span className="text-blue-300 font-semibold bg-blue-800 bg-opacity-50 px-3 py-1 rounded-full text-sm">
                                Slide {currentSlide + 1}/3
                            </span>
                        </div>
                        <div className="space-y-3 text-gray-100 bg-gray-800 bg-opacity-40 p-6 rounded-xl border border-blue-500 border-opacity-30 max-h-[60vh] overflow-y-auto">
                            {slides[currentSlide].content.map((line, i) => (
                                <p key={i} className={`whitespace-pre-wrap leading-relaxed ${line.startsWith('•') || line.startsWith('1.') || line.startsWith('2.') ? 'ml-4 text-blue-100' : line === '' ? 'h-2' : 'text-gray-200 font-medium'}`}>
                                    {line}
                                </p>
                            ))}
                        </div>
                        <div className="flex justify-between items-center mt-6">
                            <div className="flex gap-2">
                                {slides.map((_, idx) => (
                                    <div 
                                        key={idx} 
                                        className={`h-2 rounded-full transition-all ${idx === currentSlide ? 'w-8 bg-blue-400' : 'w-2 bg-gray-600'}`}
                                    />
                                ))}
                            </div>
                            <button
                                onClick={() => setCurrentSlide(null)}
                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <button 
                onClick={onComplete} 
                className="w-full p-3 bg-green-600 hover:bg-green-700 rounded-md transition-all font-bold"
            >
                Collect Blood Sample
            </button>
        </div>
    );
};

export const DnaExtraction: React.FC<MiniGameProps> = ({ onComplete, onClose }) => {
    const steps = ["Add Lysis Buffer", "Incubate", "Add Proteinase", "Centrifuge", "Collect DNA"];
    const [currentStep, setCurrentStep] = useState(0);

    const handleStep = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(s => s + 1);
        } else {
            onComplete();
        }
    };

    return (
        <div>
            <h3 className="text-lg font-bold mb-2">Extraction Protocol</h3>
            {steps.map((step, index) => (
                <MiniGameButton key={step} onClick={handleStep} disabled={index !== currentStep}>
                    {index < currentStep ? `✓ ${step}` : step}
                </MiniGameButton>
            ))}
        </div>
    );
};

export const DnaDigestion: React.FC<MiniGameProps> = ({ onComplete, onClose }) => {
    const steps = ["Select EcoRI Enzyme", "Combine DNA and Enzyme", "Incubate mixture", "Stop reaction"];
    const [currentStep, setCurrentStep] = useState(0);

    const handleStep = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(s => s + 1);
        } else {
            onComplete();
        }
    };

    return (
        <div>
            <h3 className="text-lg font-bold mb-2">Digestion Protocol</h3>
            <p className="text-sm mb-4">Mix your purified DNA with the EcoRI enzyme to cut it into fragments.</p>
            {steps.map((step, index) => (
                <MiniGameButton key={step} onClick={handleStep} disabled={index !== currentStep}>
                    {index < currentStep ? `✓ ${step}` : step}
                </MiniGameButton>
            ))}
        </div>
    );
};

export const Electrophoresis: React.FC<MiniGameProps> = ({ onComplete, onClose }) => {
    const [running, setRunning] = useState(false);
    
    useEffect(() => {
        if (running) {
            const timer = setTimeout(onComplete, 3000);
            return () => clearTimeout(timer);
        }
    }, [running, onComplete]);

    return (
        <div>
            <h3 className="text-lg font-bold mb-2">Run Gel Electrophoresis</h3>
            {!running ? (
                 <div>
                    <p className="text-sm mb-4">This will separate the DNA fragments by size.</p>
                    <MiniGameButton onClick={() => setRunning(true)}>Prepare Gel & Start Power Supply</MiniGameButton>
                </div>
            ) : (
                <div className="text-center p-4">
                    <p className="animate-pulse text-yellow-300">Running... DNA fragments are migrating.</p>
                    <div className="mt-4 h-6 bg-gray-700 rounded-md overflow-hidden relative border-2 border-blue-400">
                        <div className="h-full bg-pink-500 w-1/4 absolute left-0 animate-gel-band-1"></div>
                        <div className="h-full bg-cyan-400 w-1/4 absolute left-0 animate-gel-band-2"></div>
                         <div className="h-full bg-pink-500 w-1/4 absolute left-0 animate-gel-band-3"></div>
                    </div>
                </div>
            )}
        </div>
    );
};


export const SouthernBlotting: React.FC<MiniGameProps> = ({ onComplete, onClose }) => {
    const steps = ["Transfer DNA to Membrane", "UV Crosslink DNA to Membrane", "Wash Membrane"];
    const [currentStep, setCurrentStep] = useState(0);

    const handleStep = () => {
        if (currentStep < steps.length - 1) setCurrentStep(s => s + 1);
        else onComplete();
    };

    return (
        <div>
            <h3 className="text-lg font-bold mb-2">Southern Blotting Protocol</h3>
            {steps.map((step, index) => (
                <MiniGameButton key={step} onClick={handleStep} disabled={index !== currentStep}>
                    {index < currentStep ? `✓ ${step}` : step}
                </MiniGameButton>
            ))}
        </div>
    );
};

export const ProbeHybridization: React.FC<MiniGameProps> = ({ onComplete, onClose }) => {
    const steps = ["Prepare Radioactive Probe", "Add Probe to Membrane", "Incubate in Hybridization Oven", "Wash Excess Probe"];
    const [currentStep, setCurrentStep] = useState(0);
    
    const handleStep = () => {
        if (currentStep < steps.length - 1) setCurrentStep(s => s + 1);
        else onComplete();
    };

    return (
        <div>
            <h3 className="text-lg font-bold mb-2">Probe Hybridization Protocol</h3>
             <p className="text-sm mb-4">Caution: Handling radioactive materials.</p>
            {steps.map((step, index) => (
                <MiniGameButton key={step} onClick={handleStep} disabled={index !== currentStep}>
                    {index < currentStep ? `✓ ${step}` : step}
                </MiniGameButton>
            ))}
        </div>
    );
};


export const AutoradiographyAnalysis: React.FC<MiniGameProps> = ({ onComplete, onClose }) => {
    const [suspect, setSuspect] = useState<number | null>(null);
    const [step, setStep] = useState(0);

    if (step === 0) {
        return (
             <div>
                <h3 className="text-lg font-bold mb-2">Expose to X-Ray Film</h3>
                <p className="text-sm mb-4">Place the membrane against an X-ray film in a dark cassette to detect the radioactive probe.</p>
                <MiniGameButton onClick={() => setStep(1)}>Expose Film</MiniGameButton>
            </div>
        );
    }

    return (
        <div>
            <h3 className="text-lg font-bold mb-2">Analyze DNA Fingerprints</h3>
            <div className="flex justify-around items-center bg-black p-4 rounded-md my-4 h-32 border-2 border-pink-500">
                <div className="text-center"><p>Crime Scene</p><div className="relative h-20 w-4 bg-gray-700"><div className="absolute bg-yellow-300 h-1 w-full" style={{top: '30%'}}></div><div className="absolute bg-yellow-300 h-1 w-full" style={{top: '70%'}}></div></div></div>
                <div className="text-center"><p>Suspect 1</p><div className="relative h-20 w-4 bg-gray-700"><div className="absolute bg-white h-1 w-full" style={{top: '40%'}}></div></div></div>
                <div className="text-center"><p>Suspect 2</p><div className="relative h-20 w-4 bg-gray-700"><div className="absolute bg-white h-1 w-full" style={{top: '30%'}}></div><div className="absolute bg-white h-1 w-full" style={{top: '70%'}}></div></div></div>
                <div className="text-center"><p>Suspect 3</p><div className="relative h-20 w-4 bg-gray-700"><div className="absolute bg-white h-1 w-full" style={{top: '20%'}}></div><div className="absolute bg-white h-1 w-full" style={{top: '50%'}}></div></div></div>
            </div>
            <p className="text-sm mb-4">Compare the patterns. Which suspect matches the crime scene DNA?</p>
            <div className="flex space-x-2">
                <button onClick={() => setSuspect(1)} className={`w-full p-2 rounded ${suspect === 1 ? 'bg-red-500' : 'bg-gray-600'}`}>Suspect 1</button>
                <button onClick={() => setSuspect(2)} className={`w-full p-2 rounded ${suspect === 2 ? 'bg-green-500' : 'bg-gray-600'}`}>Suspect 2</button>
                <button onClick={() => setSuspect(3)} className={`w-full p-2 rounded ${suspect === 3 ? 'bg-red-500' : 'bg-gray-600'}`}>Suspect 3</button>
            </div>
            {suspect === 2 && <MiniGameButton onClick={onComplete} className="mt-4 bg-green-700 hover:bg-green-800">Confirm Match & Complete Analysis</MiniGameButton>}
        </div>
    );
};

const GEL_PATTERNS = {
    Forensics: {
        labels: ["Crime Scene", "Suspect 1", "Suspect 2"],
        bands: [ [30, 70], [40, 80], [30, 70] ],
        correctIndex: 2,
    },
    Paternity: {
        labels: ["Child", "Mother", "Father 1", "Father 2"],
        bands: [ [25, 45, 70], [45, 70], [20, 55], [25, 60] ],
        correctIndex: -1, // Paternity is more complex, let's simplify for the game
        explanation: "The child's bands must match one from the mother and one from the father. Here, band at 25% must come from a father. Father 2 has a matching band."
    },
    Disease: {
        labels: ["Healthy", "Patient 1", "Patient 2"],
        bands: [ [50], [20, 30], [50] ],
        correctIndex: 1,
    }
}

export const ApplicationMinigame: React.FC<MiniGameProps & {type: 'Forensics' | 'Paternity' | 'Disease'}> = ({ onComplete, onClose, type }) => {
    const { labels, bands, correctIndex } = GEL_PATTERNS[type];
    const [selected, setSelected] = useState<number|null>(null);
    const isPaternity = type === "Paternity";

    const handleSelect = (index: number) => {
        if(isPaternity) {
             setSelected(3); // Hardcode correct father for simplicity
        } else {
            setSelected(index);
        }
    }

    return (
        <div>
             <div className="flex justify-around items-center bg-black p-4 rounded-md my-4 h-32 border-2 border-blue-400">
                {labels.map((label, i) => (
                    <div className="text-center" key={label}>
                        <p className="text-xs">{label}</p>
                         <div className="relative h-20 w-4 bg-gray-700 mx-auto">
                            {bands[i].map(bandPos => (
                                <div key={bandPos} className="absolute bg-white h-1 w-full" style={{top: `${bandPos}%`}}></div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            {isPaternity ? (
                 <p className="text-sm mb-4">{GEL_PATTERNS.Paternity.explanation}</p>
            ): (
                <p className="text-sm mb-4">Select the sample that matches the case.</p>
            )}
           
            <div className="flex space-x-2">
                 {labels.map((label, i) => {
                     // Don't make buttons for evidence/child/mother etc.
                     if ((isPaternity && i < 2) || (!isPaternity && i === 0)) return null;

                     return <button key={i} onClick={() => handleSelect(i)} className={`w-full p-2 rounded ${selected === i ? 'bg-blue-500' : 'bg-gray-600'}`}>{label}</button>
                 })}
            </div>
             {((isPaternity && selected === 3) || (!isPaternity && selected === correctIndex)) && (
                <MiniGameButton onClick={onComplete} className="mt-4 bg-green-700 hover:bg-green-800">Confirm Correct Match</MiniGameButton>
            )}
        </div>
    )
}

export const InfoDisplay: React.FC<MiniGameProps & { description?: string }> = ({ onComplete, onClose, description }) => {
    const handleClose = () => {
        if (onClose) {
            onClose();
        } else {
            onComplete();
        }
    };

    return (
        <div className="flex flex-col h-full w-full">
            <div className="flex-grow bg-gray-800 p-6 rounded-lg">
                <p className="text-lg text-white whitespace-pre-wrap leading-relaxed">{description}</p>
            </div>
            <div className="mt-4 flex justify-end">
                <button 
                    onClick={handleClose} 
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-semibold"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

// Display a large protocol steps image inside the interaction modal.
export const StepsImageDisplay: React.FC<MiniGameProps & {src?: string}> = ({ onComplete, onClose, src }) => {
    const [imageError, setImageError] = React.useState(false);
    
    React.useEffect(() => {
        console.log('StepsImageDisplay rendered with src:', src);
    }, [src]);

    const handleImageError = () => {
        console.error('Failed to load image:', src);
        setImageError(true);
    };

    const handleImageLoad = () => {
        console.log('Image loaded successfully:', src);
    };

    const handleClose = () => {
        if (onClose) {
            onClose();
        } else {
            onComplete();
        }
    };

    return (
        <div className="flex flex-col items-center justify-center">
            <div className="max-h-[60vh] overflow-auto w-full flex items-center justify-center p-2 bg-gray-900 rounded">
                {src && !imageError ? (
                    <img 
                        src={src} 
                        alt="RFLP Protocol Steps Diagram"
                        className="max-w-full max-h-[60vh] object-contain" 
                        onError={handleImageError}
                        onLoad={handleImageLoad}
                    />
                ) : (
                    <div className="w-full h-64 bg-gray-700 flex items-center justify-center text-gray-300 p-4 text-center">
                        {imageError ? 
                            `Error loading image from ${src}. Please check the file exists and is accessible.` : 
                            'No image provided'}
                    </div>
                )}
            </div>
            <div className="w-full mt-4 flex justify-end space-x-2">
                <button onClick={handleClose} className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded">Done</button>
            </div>
        </div>
    );
};

        // Display advantages with icons and better formatting
        export const AdvantagesDisplay: React.FC<MiniGameProps> = ({ onComplete, onClose }) => {
            const advantages = [
                { icon: '🎯', title: 'Semi-Dominant Markers', text: 'Produces semi-dominant markers, allowing determination of homozygosity or heterozygosity.' },
                { icon: '🔬', title: 'Stable & Reproducible', text: 'Gives constant, reliable results over time and across different locations.' },
                { icon: '📚', title: 'No Prior Sequence Info', text: 'No prior information on DNA sequence is required to perform the analysis.' },
                { icon: '⚡', title: 'Relatively Simple', text: 'Conceptually straightforward technique with well-established protocols.' }
            ];

            const handleClose = () => {
                if (onClose) {
                    onClose();
                } else {
                    onComplete();
                }
            };

            return (
                <div className="flex flex-col h-full w-full">
                    <h3 className="text-2xl font-bold text-green-300 mb-4 text-center">Advantages of RFLP</h3>
                    <div className="flex-grow overflow-auto bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-lg border border-gray-700 shadow-lg space-y-4">
                        {advantages.map((adv, idx) => (
                            <div 
                                key={idx} 
                                className="bg-gray-700 bg-opacity-50 p-4 rounded-lg border border-green-500 border-opacity-30 hover:border-opacity-60 transition-all"
                            >
                                <div className="flex items-start gap-3">
                                    <span className="text-3xl">{adv.icon}</span>
                                    <div>
                                        <h4 className="font-bold text-green-300 mb-1">{adv.title}</h4>
                                        <p className="text-gray-300 text-sm leading-relaxed">{adv.text}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 flex justify-end">
                        <button 
                            onClick={handleClose} 
                            className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded text-white font-semibold transition-all shadow-md hover:shadow-lg"
                        >
                            Close
                        </button>
                    </div>
                </div>
            );
        };

        // Display limitations with icons and better formatting
        export const LimitationsDisplay: React.FC<MiniGameProps> = ({ onComplete, onClose }) => {
            const limitations = [
                { icon: '🧪', text: 'Requires large amounts of high-quality DNA sample' },
                { icon: '⏱️', text: 'Slow and time-consuming process (5-7 days)' },
                { icon: '👨‍🔬', text: 'Labor-intensive and technically complex' },
                { icon: '🔍', text: 'Detects polymorphisms only at restriction sites' },
                { icon: '📉', text: 'Low sensitivity; cannot detect very small mutations' },
                { icon: '🎯', text: 'Limited number of loci analyzed per experiment' },
                { icon: '☢️', text: 'Requires radioactive or labeled probes for detection' },
                { icon: '🧬', text: 'May have low polymorphism levels in some species' }
            ];

            const handleClose = () => {
                if (onClose) {
                    onClose();
                } else {
                    onComplete();
                }
            };

            return (
                <div className="flex flex-col h-full w-full">
                    <h3 className="text-2xl font-bold text-red-300 mb-4 text-center">Limitations of RFLP</h3>
                    <div className="flex-grow overflow-auto bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-lg border border-gray-700 shadow-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {limitations.map((lim, idx) => (
                                <div 
                                    key={idx} 
                                    className="bg-gray-700 bg-opacity-50 p-3 rounded-lg border border-red-500 border-opacity-30 hover:border-opacity-60 transition-all"
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="text-2xl flex-shrink-0">{lim.icon}</span>
                                        <p className="text-gray-300 text-sm leading-relaxed">{lim.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                        <button 
                            onClick={handleClose} 
                            className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded text-white font-semibold transition-all shadow-md hover:shadow-lg"
                        >
                            Close
                        </button>
                    </div>
                </div>
            );
        };

        // Display comparison table for RFLP vs PCR
        export const ComparisonTable: React.FC<MiniGameProps> = ({ onComplete, onClose }) => {
            const handleClose = () => {
                if (onClose) {
                    onClose();
                } else {
                    onComplete();
                }
            };

            const comparisonData = [
                { characteristic: 'Full Form', rflp: 'Restriction Fragment Length Polymorphism', pcr: 'Polymerase Chain Reaction' },
                { characteristic: 'Principle', rflp: 'Cuts DNA with enzymes, detects fragment differences', pcr: 'Amplifies specific DNA segment rapidly' },
                { characteristic: 'DNA Amount Required', rflp: 'Large amounts (microgram level)', pcr: 'Very small amounts (nanogram level)' },
                { characteristic: 'Time Required', rflp: 'Several days (5-7 days)', pcr: 'A few hours (2-4 hours)' },
                { characteristic: 'Sensitivity', rflp: 'Less sensitive', pcr: 'Highly sensitive' },
                { characteristic: 'Process Steps', rflp: 'Digestion → Gel → Blotting → Hybridization', pcr: 'Thermal cycling with primers' },
                { characteristic: 'Primary Application', rflp: 'Genetic mapping, forensics, diagnosis', pcr: 'Cloning, diagnostics, mutation detection' },
                { characteristic: 'Cost & Complexity', rflp: 'More expensive and technically complex', pcr: 'Cost-effective and simpler' },
                { characteristic: 'Automation', rflp: 'Difficult to automate', pcr: 'Easily automated' },
                { characteristic: 'Detection Method', rflp: 'Radioactive/fluorescent probes', pcr: 'Electrophoresis or real-time detection' }
            ];

            return (
                <div className="flex flex-col h-full w-full max-h-[70vh]">
                    <h3 className="text-2xl font-bold text-blue-300 mb-4 text-center">RFLP vs PCR Comparison</h3>
                    <div className="flex-grow overflow-auto bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-gray-700 shadow-lg">
                        <table className="w-full text-sm">
                            <thead className="sticky top-0 bg-gray-900 z-10">
                                <tr className="border-b-2 border-blue-500">
                                    <th className="p-3 text-left font-semibold text-blue-300 w-1/4">Characteristic</th>
                                    <th className="p-3 text-left font-semibold text-green-300 w-3/8">RFLP</th>
                                    <th className="p-3 text-left font-semibold text-purple-300 w-3/8">PCR</th>
                                </tr>
                            </thead>
                            <tbody>
                                {comparisonData.map((row, idx) => (
                                    <tr 
                                        key={idx} 
                                        className={`border-b border-gray-700 hover:bg-gray-700 transition-colors ${idx % 2 === 0 ? 'bg-gray-800' : 'bg-gray-850'}`}
                                    >
                                        <td className="p-3 font-medium text-gray-200">{row.characteristic}</td>
                                        <td className="p-3 text-gray-300">{row.rflp}</td>
                                        <td className="p-3 text-gray-300">{row.pcr}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-4 flex justify-end">
                        <button 
                            onClick={handleClose} 
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-semibold transition-all shadow-md hover:shadow-lg"
                        >
                            Close
                        </button>
                    </div>
                </div>
            );
        };

        // Display references with better formatting
        export const ReferencesDisplay: React.FC<MiniGameProps> = ({ onComplete, onClose }) => {
            const handleClose = () => {
                if (onClose) {
                    onClose();
                } else {
                    onComplete();
                }
            };
            const references = [
                {
                    authors: 'Southern, E.M.',
                    year: '1975',
                    title: 'Detection of specific sequences among DNA fragments separated by gel electrophoresis',
                    journal: 'Journal of Molecular Biology',
                    type: 'Foundational Paper'
                },
                {
                    authors: 'Botstein, D., White, R.L., Skolnick, M., & Davis, R.W.',
                    year: '1980',
                    title: 'Construction of a genetic linkage map in man using restriction fragment length polymorphisms',
                    journal: 'American Journal of Human Genetics',
                    type: 'Key Application'
                }
            ];

            return (
                <div className="flex flex-col h-full w-full">
                    <h3 className="text-2xl font-bold text-blue-300 mb-4 text-center">Key References</h3>
                    <div className="flex-grow overflow-auto bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-lg border border-gray-700 shadow-lg space-y-4">
                        {references.map((ref, idx) => (
                            <div 
                                key={idx} 
                                className="bg-gray-700 bg-opacity-50 p-4 rounded-lg border border-blue-500 border-opacity-30"
                            >
                                <div className="flex items-start gap-2 mb-2">
                                    <span className="text-blue-300 font-bold text-lg">{idx + 1}.</span>
                                    <div className="flex-grow">
                                        <div className="inline-block px-2 py-1 bg-blue-600 bg-opacity-30 rounded text-xs text-blue-300 mb-2">
                                            {ref.type}
                                        </div>
                                        <p className="text-gray-200 font-medium mb-1">{ref.authors} ({ref.year})</p>
                                        <p className="text-gray-300 italic mb-1">{ref.title}</p>
                                        <p className="text-gray-400 text-sm">{ref.journal}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div className="mt-6 p-4 bg-gray-700 bg-opacity-30 rounded-lg border border-gray-600">
                            <h4 className="font-bold text-gray-200 mb-2">📚 Additional Resources</h4>
                            <ul className="text-gray-300 text-sm space-y-1 list-disc list-inside">
                                <li>National Center for Biotechnology Information (NCBI) - RFLP Database</li>
                                <li>Molecular Biology of the Cell (Alberts et al.) - Chapter on DNA Analysis</li>
                                <li>Forensic DNA Typing (Butler, J.M.) - RFLP Applications in Forensics</li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                        <button 
                            onClick={handleClose} 
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-semibold transition-all shadow-md hover:shadow-lg"
                        >
                            Close
                        </button>
                    </div>
                </div>
            );
        };

        // Completion certificate display
        export const CompletionDisplay: React.FC<MiniGameProps> = ({ onComplete, onClose }) => {
            const handleClose = () => {
                if (onClose) {
                    onClose();
                } else {
                    onComplete();
                }
            };
            return (
                <div className="flex flex-col h-full w-full">
                    <div className="flex-grow bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 p-8 rounded-lg border-4 border-yellow-400 shadow-2xl flex flex-col items-center justify-center text-center">
                        <div className="text-6xl mb-4">🎓</div>
                        <h2 className="text-4xl font-bold text-yellow-300 mb-4">Congratulations!</h2>
                        <div className="bg-white bg-opacity-10 p-6 rounded-lg backdrop-blur-sm border border-white border-opacity-20 max-w-lg">
                            <p className="text-xl text-gray-100 mb-4">You have successfully completed your</p>
                            <h3 className="text-3xl font-bold text-blue-300 mb-4">RFLP Training</h3>
                            <p className="text-gray-200 leading-relaxed mb-4">
                                You've mastered the principles, methodology, applications, and limitations of Restriction Fragment Length Polymorphism analysis.
                            </p>
                            <div className="border-t border-gray-400 pt-4 mt-4">
                                <p className="text-yellow-300 font-semibold">You are now ready to graduate from the lab!</p>
                            </div>
                        </div>
                        <div className="mt-6 text-sm text-gray-300">
                            Certificate of Completion • RFLP Virtual Laboratory
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                        <button 
                            onClick={handleClose} 
                            className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 rounded text-white font-bold transition-all shadow-md hover:shadow-lg"
                        >
                            Close
                        </button>
                    </div>
                </div>
            );
        };


// Display for Genome Mapping with custom styling
export const GenomeMappingDisplay: React.FC<MiniGameProps> = ({ onComplete, onClose }) => {
    const mappingSteps = [
        { icon: Dna, text: 'RFLP detects variations in DNA fragment lengths after restriction enzyme digestion.' },
        { icon: GitCommit, text: 'These variations serve as genetic markers throughout the genome.' },
        { icon: Map, text: 'By studying inheritance patterns, recombination frequencies are calculated to determine the relative positions of genes on chromosomes.' },
        { icon: Target, text: 'Multiple RFLP markers are used to create detailed linkage maps showing gene order.' },
        { icon: BookCheck, text: 'RFLP mapping is crucial for identifying disease genes and genetic trait loci.' },
        { icon: Factory, text: 'It has been used extensively in plants, animals, and humans for gene localization studies.' },
        { icon: Binary, text: 'Though now supplemented by newer methods, RFLP provided foundational genetic maps for modern genomics.' }
    ];

    const handleClose = () => {
        if (onClose) {
            onClose();
        } else {
            onComplete();
        }
    };

    return (
        <div className="flex flex-col h-full w-full">
            <h3 className="text-2xl font-bold text-blue-300 mb-6 text-center">Genome Mapping with RFLP</h3>
            <div className="flex-grow overflow-auto space-y-4 pr-2">
                {mappingSteps.map((step, idx) => (
                    <div 
                        key={idx} 
                        className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-blue-500 hover:bg-gray-700/50 transition-all duration-300 transform hover:scale-[1.02]"
                    >
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-900/50 rounded-full flex items-center justify-center border border-blue-700">
                                <step.icon className="text-blue-300" size={20} />
                            </div>
                            <p className="text-gray-300 text-base leading-relaxed pt-1">{step.text}</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-6 flex justify-end">
                <button 
                    onClick={handleClose} 
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-semibold transition-all shadow-md hover:shadow-lg"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

// Keep old ones for constants file to not break types, though they are unused.
export const EnzymeSelection = () => <div />;
export const GelPrep = () => <div />;
export const GelLoading = () => <div />;
export const UvImaging = () => <div />;
export const Analysis = () => <div />;
