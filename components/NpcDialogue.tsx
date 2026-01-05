import React, { useState, useEffect, useCallback } from 'react';
import { Npc } from '../types';
import ScientistCharacter from './ScientistCharacter';

interface NpcDialogueProps {
    npc: Npc;
    onClose: () => void;
}

const NpcDialogue: React.FC<NpcDialogueProps> = ({ npc, onClose }) => {
    const [currentLine, setCurrentLine] = useState(0);
    const [displayedText, setDisplayedText] = useState('');
    const [isTyping, setIsTyping] = useState(true);
    const [animationFrame, setAnimationFrame] = useState(0);

    const dialogue = npc.dialogue || [];
    const fullText = dialogue[currentLine] || '';

    // Animation frame for character
    useEffect(() => {
        const timer = setInterval(() => {
            setAnimationFrame(prev => (prev + 1) % 60);
        }, 100);
        return () => clearInterval(timer);
    }, []);

    // Typewriter effect
    useEffect(() => {
        setDisplayedText('');
        setIsTyping(true);
        let charIndex = 0;

        const typeTimer = setInterval(() => {
            if (charIndex < fullText.length) {
                setDisplayedText(fullText.slice(0, charIndex + 1));
                charIndex++;
            } else {
                setIsTyping(false);
                clearInterval(typeTimer);
            }
        }, 30);

        return () => clearInterval(typeTimer);
    }, [currentLine, fullText]);

    const handleNext = useCallback(() => {
        if (isTyping) {
            // Skip to end of current line
            setDisplayedText(fullText);
            setIsTyping(false);
        } else if (currentLine < dialogue.length - 1) {
            // Go to next line
            setCurrentLine(prev => prev + 1);
        } else {
            // End of dialogue
            onClose();
        }
    }, [isTyping, fullText, currentLine, dialogue.length, onClose]);

    // Handle keyboard input
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'e') {
                e.preventDefault();
                handleNext();
            } else if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleNext, onClose]);

    const isLastLine = currentLine === dialogue.length - 1 && !isTyping;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center pb-8 pointer-events-none">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 pointer-events-auto"
                onClick={onClose}
            />

            {/* Dialogue Box */}
            <div className="relative z-10 w-full max-w-2xl mx-4 pointer-events-auto animate-slide-up">
                {/* NPC Name & Role Badge */}
                <div className="absolute -top-12 left-4 flex items-center gap-3">
                    {/* Character Portrait */}
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full border-4 border-yellow-500 shadow-lg overflow-hidden flex items-center justify-center">
                        <ScientistCharacter
                            x={32}
                            y={32}
                            direction="idle"
                            movementDirection="down"
                            animationFrame={animationFrame}
                        />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-lg font-bold text-white drop-shadow-lg">
                            {npc.character.name}
                        </span>
                        <span className="text-xs text-yellow-300 font-medium bg-black/50 px-2 py-0.5 rounded">
                            {npc.role}
                        </span>
                    </div>
                </div>

                {/* Main Dialogue Box */}
                <div className="bg-gradient-to-b from-gray-800 to-gray-900 border-4 border-yellow-500 rounded-xl shadow-2xl p-6 pt-8">
                    {/* Dialogue Text */}
                    <div className="min-h-[80px] text-white text-lg leading-relaxed font-medium mb-4">
                        {displayedText}
                        {isTyping && (
                            <span className="inline-block w-2 h-5 bg-yellow-400 ml-1 animate-pulse" />
                        )}
                    </div>

                    {/* Progress & Controls */}
                    <div className="flex items-center justify-between">
                        {/* Progress Dots */}
                        <div className="flex gap-2">
                            {dialogue.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`w-2 h-2 rounded-full transition-all ${idx < currentLine
                                            ? 'bg-green-400'
                                            : idx === currentLine
                                                ? 'bg-yellow-400 animate-pulse'
                                                : 'bg-gray-600'
                                        }`}
                                />
                            ))}
                        </div>

                        {/* Next/Close Button */}
                        <button
                            onClick={handleNext}
                            className={`px-6 py-2 rounded-lg font-bold text-sm transition-all transform hover:scale-105 ${isLastLine
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                                    : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600'
                                } text-white shadow-lg`}
                        >
                            {isTyping ? 'Skip' : isLastLine ? 'Close [E]' : 'Next [E]'}
                        </button>
                    </div>
                </div>

                {/* Decorative Corner */}
                <div className="absolute -bottom-2 -right-2 w-8 h-8 border-r-4 border-b-4 border-yellow-500/50 rounded-br-xl" />
                <div className="absolute -bottom-2 -left-2 w-8 h-8 border-l-4 border-b-4 border-yellow-500/50 rounded-bl-xl" />
            </div>

            <style>{`
                @keyframes slide-up {
                    from { 
                        opacity: 0; 
                        transform: translateY(50px); 
                    }
                    to { 
                        opacity: 1; 
                        transform: translateY(0); 
                    }
                }
                .animate-slide-up {
                    animation: slide-up 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default NpcDialogue;
