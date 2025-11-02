import React, { useEffect } from 'react';
import { InteractiveObject, Step } from '../types';
import { X } from 'lucide-react';

interface InteractionModalProps {
    interactiveObject: InteractiveObject;
    step: Step;
    onClose: () => void;
    onComplete: () => void;
}

const InteractionModal: React.FC<InteractionModalProps> = ({ interactiveObject, step, onClose, onComplete }) => {
    const MiniGameComponent = step.miniGame;

    // Add ESC key handler
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    // Handle backdrop click
    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[3000] p-4"
            onClick={handleBackdropClick}
        >
            <div className="bg-gray-800 text-white rounded-lg shadow-2xl border-2 border-blue-400 w-full max-w-4xl max-h-[90vh] transform transition-all animate-fade-in-up relative flex flex-col">
                {/* Fixed Header with Close Button */}
                <div className="p-4 border-b border-gray-600 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-2xl font-bold text-yellow-300">{interactiveObject.name}</h2>
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-full flex-shrink-0"
                        aria-label="Close modal"
                        title="Close (ESC)"
                    >
                        <X size={24} />
                    </button>
                </div>
                
                {/* Scrollable Content Area */}
                <div className="overflow-y-auto flex-grow p-6">
                    {step.description && <p className="mb-4 text-gray-300">{step.description}</p>}
                    <div className="bg-gray-900 p-4 rounded-md border border-gray-700">
                         {MiniGameComponent ? (
                            // Pass both the onComplete callback and any additional props from step.miniGameProps
                            <MiniGameComponent onComplete={onComplete} onClose={onClose} {...(step.miniGameProps || {})} />
                         ) : (
                            // Fallback for displays with no minigame
                            <div className="flex flex-col items-center justify-center h-full min-h-[150px]">
                               <button onClick={onClose} className="p-3 bg-blue-600 hover:bg-blue-700 rounded-md font-bold">Close</button>
                            </div>
                         )
                         }
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InteractionModal;
