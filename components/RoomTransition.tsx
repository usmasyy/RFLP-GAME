import React, { useEffect, useState } from 'react';
import { RoomId } from '../types';

interface RoomTransitionProps {
    room: RoomId;
    className?: string;
}

const ROOM_LEVELS: Record<RoomId, string> = {
    'INTRODUCTION': 'Level 1: The Incident',
    'METHODOLOGY': 'Level 2: The RFLP Lab',
    'APPLICATIONS': 'Level 3: Applications',
    'LIMITATIONS': 'Level 4: Limitations'
};

const RoomTransition: React.FC<RoomTransitionProps> = ({ room, className }) => {
    const [visible, setVisible] = useState(false);
    const [text, setText] = useState('');

    useEffect(() => {
        // Trigger animation when room changes
        setText(ROOM_LEVELS[room] || 'Unknown Level');
        setVisible(true);

        const timer = setTimeout(() => {
            setVisible(false);
        }, 3000); // Banner stays for 3 seconds

        return () => clearTimeout(timer);
    }, [room]);

    if (!visible) return null;

    return (
        <div className={`fixed top-20 inset-x-0 flex justify-center z-[2000] pointer-events-none ${className}`}>
            <div className="bg-gradient-to-r from-blue-900/90 via-purple-900/90 to-blue-900/90 text-white px-12 py-4 rounded-full border-y-2 border-yellow-400 shadow-[0_0_30px_rgba(59,130,246,0.5)] transform animate-level-banner backdrop-blur-md">
                <h2 className="text-3xl font-bold tracking-wider uppercase text-yellow-300 drop-shadow-lg glitch-text">
                    {text}
                </h2>
                <div className="h-1 w-full bg-gradient-to-r from-transparent via-blue-400 to-transparent mt-2 animate-pulse" />
            </div>

            <style>{`
                @keyframes levelBanner {
                    0% { transform: translateY(-50px) scale(0.8); opacity: 0; }
                    15% { transform: translateY(0) scale(1.1); opacity: 1; }
                    25% { transform: scale(1); }
                    85% { opacity: 1; transform: translateY(0); }
                    100% { opacity: 0; transform: translateY(-30px); }
                }
                .animate-level-banner {
                    animation: levelBanner 3s ease-in-out forwards;
                }
                .glitch-text {
                    text-shadow: 2px 2px 0px #ff00ff, -2px -2px 0px #00ffff;
                }
            `}</style>
        </div>
    );
};

export default RoomTransition;
