import React, { useState, useEffect, useRef } from 'react';

interface IntroAnimationProps {
    onComplete: () => void;
    character: {
        name: string;
        skinColor: string;
        hairColor: string;
        labCoatColor: string;
        shirtColor: string;
        accessory?: string;
    };
}

const IntroAnimation: React.FC<IntroAnimationProps> = ({ onComplete, character }) => {
    const [currentScene, setCurrentScene] = useState(0);
    const [fadeOut, setFadeOut] = useState(false);

    // Audio refs - use files placed in `/public/assets`
    const ambientRef = useRef<HTMLAudioElement | null>(null);
    const screamRef = useRef<HTMLAudioElement | null>(null);
    const ambulanceRef = useRef<HTMLAudioElement | null>(null);
    const stingRef = useRef<HTMLAudioElement | null>(null);
    const sabotageRef = useRef<HTMLAudioElement | null>(null);
    const themeRef = useRef<HTMLAudioElement | null>(null);
    const screamEndedHandlerRef = useRef<(() => void) | null>(null);
    const timersRef = useRef<number[]>([]);
    const audioTimersRef = useRef<number[]>([]);

    // Initialize audio elements on mount
    useEffect(() => {
        ambientRef.current = new Audio('/assets/cricket-ambience-night.mp3');
        screamRef.current = new Audio('/assets/scream-loud.mp3');
        ambulanceRef.current = new Audio('/assets/ambulance-sound.mp3');
        stingRef.current = new Audio('/assets/dramatic-sting-118943.mp3');
        sabotageRef.current = new Audio('/assets/among-us-alarme-sabotage-393155.mp3');
        themeRef.current = new Audio('/assets/cricket-ambience-night.mp3');

        // Add error handlers for debugging
        const audioElements = [
            { ref: ambientRef, name: 'ambient' },
            { ref: screamRef, name: 'scream' },
            { ref: ambulanceRef, name: 'ambulance' },
            { ref: stingRef, name: 'sting' },
            { ref: sabotageRef, name: 'sabotage' },
            { ref: themeRef, name: 'theme' }
        ];

        audioElements.forEach(({ ref, name }) => {
            if (ref.current) {
                ref.current.addEventListener('error', (e) => {
                    console.error(`Failed to load ${name} audio:`, e);
                });
                ref.current.addEventListener('canplaythrough', () => {
                    console.log(`${name} audio loaded successfully`);
                });
            }
        });

        // Try to play ambient (may be blocked until user gesture) — non-blocking
        if (ambientRef.current) {
            ambientRef.current.volume = 0.25;
            ambientRef.current.loop = true;
            ambientRef.current.play().catch((error) => {
                console.log('Ambient audio autoplay prevented:', error.message);
            });
        }

        return () => {
            timersRef.current.forEach((t) => clearTimeout(t));
            timersRef.current.length = 0;
            try { ambientRef.current?.pause(); } catch {}
            try {
                if (screamRef.current) {
                    if (screamEndedHandlerRef.current) {
                        try { screamRef.current.removeEventListener('ended', screamEndedHandlerRef.current); } catch {}
                        screamEndedHandlerRef.current = null;
                    }
                    screamRef.current.pause();
                    screamRef.current.currentTime = 0;
                }
            } catch {}
            try { ambulanceRef.current?.pause(); ambulanceRef.current && (ambulanceRef.current.currentTime = 0); } catch {}
            try { stingRef.current?.pause(); stingRef.current && (stingRef.current.currentTime = 0); } catch {}
            try { sabotageRef.current?.pause(); sabotageRef.current && (sabotageRef.current.currentTime = 0); } catch {}
            try { themeRef.current?.pause(); themeRef.current && (themeRef.current.currentTime = 0); } catch {}
            // Stop ambulance only on complete unmount
            try { if (ambulanceRef.current) { ambulanceRef.current.loop = false; ambulanceRef.current.pause(); ambulanceRef.current.currentTime = 0; } } catch {}
            ambientRef.current = null;
            screamRef.current = null;
            ambulanceRef.current = null;
            stingRef.current = null;
            sabotageRef.current = null;
            themeRef.current = null;
        };
    }, []);

    // Manage scene-specific audio. We trigger the scream + ambulance when the victim falls (crimePhase -> 3).
    useEffect(() => {
        // ensure any pending audio timers are cleared
        audioTimersRef.current.forEach((t) => clearTimeout(t));
        audioTimersRef.current.length = 0;

        // When leaving scene 0, stop scream only (keep ambulance playing)
        if (currentScene !== 0) {
            try {
                if (screamRef.current) {
                    if (screamEndedHandlerRef.current) {
                        try { screamRef.current.removeEventListener('ended', screamEndedHandlerRef.current); } catch {}
                        screamEndedHandlerRef.current = null;
                    }
                    screamRef.current.pause();
                    screamRef.current.currentTime = 0;
                }
            } catch {}
        }

        // Theme handling for later scenes
        if (currentScene === 3) { // Lab Scene
            try {
                if (themeRef.current) {
                    themeRef.current.volume = 0.4;
                    themeRef.current.loop = true;
                    themeRef.current.play().catch(() => {});
                }
            } catch {}
        } else {
            try { if (themeRef.current) { themeRef.current.pause(); themeRef.current.currentTime = 0; } } catch {}
        }

        return () => {
            audioTimersRef.current.forEach((t) => clearTimeout(t));
            audioTimersRef.current.length = 0;
        };
    }, [currentScene]);

    // Phase control for the 'crime' scene to avoid overlapping elements
    // Phases: 0 = walking, 1 = attacker emerges, 2 = stabbing/struggle, 3 = victim falls/blood, 4 = attacker flees
    const [crimePhase, setCrimePhase] = useState<number>(0);

    useEffect(() => {

        // Only run phase scheduling when we're on the 'crime' scene (index 0)
        if (currentScene !== 0) {
            // reset phase when leaving
            setCrimePhase(0);
            return;
        }

        // Clear any previous timers and start fresh (phase timers)
        timersRef.current.forEach((t) => clearTimeout(t));
        timersRef.current.length = 0;

        setCrimePhase(0);

        // longer timing so the dramatic fall/sting lingers visibly
        const tEmergence = window.setTimeout(() => setCrimePhase(1), 2000);
        const tStruggle = window.setTimeout(() => {
            setCrimePhase(2);
            try {
                if (sabotageRef.current) {
                    sabotageRef.current.volume = 0.6;
                    sabotageRef.current.play().catch(() => {});
                }
            } catch {}
        }, 3600);
        const tFall = window.setTimeout(() => {
            setCrimePhase(3);

            // Play scream exactly when victim falls (non-looping, brief)
            try {
                if (screamRef.current) {
                    // remove any previous ended handler
                    if (screamEndedHandlerRef.current && screamRef.current) {
                        try { screamRef.current.removeEventListener('ended', screamEndedHandlerRef.current); } catch {}
                        screamEndedHandlerRef.current = null;
                    }

                    screamRef.current.volume = 0.6;
                    screamRef.current.loop = false;
                    screamRef.current.currentTime = 0;
                    console.log('Playing scream, will schedule ambulance after 2s...');
                    screamRef.current.play()
                        .then(() => {
                            console.log('Scream started successfully');
                            const tAmb = window.setTimeout(() => {
                                console.log('2s elapsed, starting ambulance...');
                                if (ambulanceRef.current) {
                                    ambulanceRef.current.volume = 0.45;
                                    ambulanceRef.current.loop = true;
                                    ambulanceRef.current.currentTime = 0;
                                    ambulanceRef.current.play()
                                        .then(() => console.log('Ambulance started successfully'))
                                        .catch(err => console.error('Ambulance play failed:', err));
                                }
                            }, 4500);
                            audioTimersRef.current.push(tAmb as unknown as number);
                        })
                        .catch(err => {
                            console.error('Scream play failed:', err);
                            // If scream fails, still try ambulance after delay
                            const tAmb = window.setTimeout(() => {
                                if (ambulanceRef.current) {
                                    ambulanceRef.current.volume = 0.45;
                                    ambulanceRef.current.loop = true;
                                    ambulanceRef.current.currentTime = 0;
                                    ambulanceRef.current.play()
                                        .then(() => console.log('Ambulance started (after scream failure)'))
                                        .catch(err => console.error('Ambulance play failed:', err));
                                }
                            }, 2000);
                            audioTimersRef.current.push(tAmb as unknown as number);
                        });
                }
            } catch {}
        }, 4200);
        const tFlee = window.setTimeout(() => setCrimePhase(4), 5200);

        timersRef.current.push(tEmergence as unknown as number, tStruggle as unknown as number, tFall as unknown as number, tFlee as unknown as number);

        return () => {
            timersRef.current.forEach((t) => clearTimeout(t));
            timersRef.current.length = 0;
        };
    }, [currentScene]);

    const scenes = [
        {
            id: 'crime',
            // Increase duration so dramatic fall/sting and aftermath linger longer on screen
            duration: 9000,
            render: () => (
                <div className="relative w-full h-full bg-gradient-to-b from-indigo-950 via-gray-900 to-black overflow-hidden">
                    {/* Atmospheric fog/mist layers */}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-800/30 via-transparent to-transparent" />
                    <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-black/60 to-transparent" />
                    
                    {/* Rain effect */}
                    <div className="absolute inset-0 opacity-30">
                        <div className="absolute top-0 left-[10%] w-px h-8 bg-blue-200 animate-[rain_1s_linear_infinite]" />
                        <div className="absolute top-0 left-[25%] w-px h-12 bg-blue-200 animate-[rain_1.2s_linear_infinite_0.2s]" />
                        <div className="absolute top-0 left-[45%] w-px h-10 bg-blue-200 animate-[rain_0.9s_linear_infinite_0.5s]" />
                        <div className="absolute top-0 left-[60%] w-px h-14 bg-blue-200 animate-[rain_1.1s_linear_infinite_0.3s]" />
                        <div className="absolute top-0 left-[78%] w-px h-9 bg-blue-200 animate-[rain_1s_linear_infinite_0.7s]" />
                        <div className="absolute top-0 left-[88%] w-px h-11 bg-blue-200 animate-[rain_1.3s_linear_infinite_0.4s]" />
                    </div>
                    
                    {/* Flickering street light */}
                    <div className="absolute top-0 left-1/4">
                        <div className="w-3 h-20 bg-gray-700">
                            <div className="w-6 h-2 bg-gray-600 -translate-x-1.5" />
                        </div>
                        <div className="w-4 h-32 bg-gradient-to-b from-yellow-300 to-transparent opacity-40 animate-[flicker_0.3s_ease-in-out_infinite]" />
                    </div>
                    
                    {/* Moon with clouds */}
                    <div className="absolute top-12 right-16 w-16 h-16 bg-gray-200 rounded-full opacity-50 blur-sm" />
                    <div className="absolute top-10 right-12 w-20 h-12 bg-gray-800 opacity-60 rounded-full animate-[drift_8s_linear_infinite]" />
                    
                    {/* Detailed building silhouettes */}
                    <div className="absolute bottom-0 left-0 w-40 h-56 bg-black">
                        <div className="absolute top-8 left-4 w-3 h-4 bg-yellow-600/40" />
                        <div className="absolute top-8 right-4 w-3 h-4 bg-yellow-600/40" />
                        <div className="absolute top-20 left-4 w-3 h-4 bg-yellow-600/20" />
                    </div>
                    <div className="absolute bottom-0 left-32 w-48 h-72 bg-black">
                        <div className="absolute top-12 left-6 w-4 h-5 bg-yellow-700/30" />
                        <div className="absolute top-12 right-6 w-4 h-5 bg-yellow-700/30" />
                        <div className="absolute top-28 left-6 w-4 h-5 bg-yellow-700/40" />
                        <div className="absolute top-28 right-6 w-4 h-5 bg-yellow-700/20" />
                    </div>
                    <div className="absolute bottom-0 right-0 w-44 h-64 bg-black">
                        <div className="absolute top-16 left-8 w-3 h-4 bg-yellow-600/25" />
                        <div className="absolute top-32 right-8 w-3 h-4 bg-yellow-600/35" />
                    </div>
                    
                    {/* Alley walls */}
                    <div className="absolute bottom-0 left-1/4 w-2 h-full bg-gradient-to-t from-gray-800 to-gray-900 transform -skew-x-12" />
                    <div className="absolute bottom-0 right-1/4 w-2 h-full bg-gradient-to-t from-gray-800 to-gray-900 transform skew-x-12" />
                    
                    {/* Dumpster */}
                    <div className="absolute bottom-16 right-1/4 w-20 h-16 bg-gray-800 border-2 border-gray-700">
                        <div className="absolute top-0 w-full h-2 bg-gray-700" />
                        <div className="absolute top-1/2 left-2 w-1 h-6 bg-gray-600" />
                    </div>
                    
                    {/* Ground/Alley floor */}
                    <div className="absolute bottom-0 w-full h-20 bg-gradient-to-b from-gray-800 to-gray-900">
                        <div className="absolute bottom-4 left-1/3 w-12 h-2 bg-black/40 rounded-full blur-sm" />
                    </div>
                    
                    {/* Victim - walking (visible until fall) */}
                    {crimePhase < 3 && (
                        <div className="absolute bottom-20 left-[45%] animate-[victimWalk_2s_ease-in-out_forwards]">
                            <div className="relative w-16 h-32">
                                {/* Head */}
                                <div className="absolute w-12 h-12 bg-amber-200 rounded-full top-0 left-1/2 -translate-x-1/2 border-2 border-amber-300">
                                    {/* Hair */}
                                    <div className="absolute w-full h-1/2 bg-amber-900 top-0 rounded-t-full" />
                                    {/* Eyes */}
                                    <div className="absolute top-1/2 left-1/4 w-1.5 h-1.5 bg-gray-800 rounded-full" />
                                    <div className="absolute top-1/2 right-1/4 w-1.5 h-1.5 bg-gray-800 rounded-full" />
                                </div>
                                {/* Body - casual clothes */}
                                <div className="absolute w-14 h-18 bg-blue-600 top-12 left-1/2 -translate-x-1/2 rounded-md border-2 border-blue-700">
                                    {/* Arms */}
                                    <div className="absolute -left-2 top-1 w-2 h-12 bg-amber-200 rounded-full border border-amber-300" />
                                    <div className="absolute -right-2 top-1 w-2 h-12 bg-amber-200 rounded-full border border-amber-300" />
                                </div>
                                {/* Legs */}
                                <div className="absolute w-4 h-8 bg-gray-700 bottom-0 left-1/3 rounded-sm border border-gray-800" />
                                <div className="absolute w-4 h-8 bg-gray-700 bottom-0 right-1/3 rounded-sm border border-gray-800" />
                            </div>
                        </div>
                    )}
                    
                    {/* Attacker - emerges from shadows (shown during emergence and attack phases) */}
                    {crimePhase >= 1 && crimePhase < 4 && (
                        <div className="absolute bottom-20 right-[42%] opacity-0 animate-[attackerEmerge_1.5s_ease-out_forwards]">
                            <div className="relative w-20 h-36">
                                {/* Head with hood */}
                                <div className="absolute w-12 h-12 bg-gray-900 rounded-full top-0 left-1/2 -translate-x-1/2 border-2 border-black">
                                    {/* Hood shadow */}
                                    <div className="absolute -top-3 w-16 h-10 bg-black rounded-t-full left-1/2 -translate-x-1/2 border-2 border-gray-900" />
                                    {/* Glowing eyes */}
                                    <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                    <div className="absolute top-1/2 right-1/4 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                </div>
                                {/* Body - dark hoodie */}
                                <div className="absolute w-16 h-20 bg-gray-900 top-11 left-1/2 -translate-x-1/2 rounded-md border-2 border-black">
                                    {/* Attacking arm with knife */}
                                    <div className="absolute -right-3 top-0 w-3 h-16 bg-gray-900 rounded-sm transform rotate-[-30deg] origin-top animate-[stab_0.4s_ease-in_forwards] border border-black">
                                        {/* Knife with glint */}
                                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-1 h-6 bg-gray-400 border border-gray-500">
                                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6px] border-b-gray-400" />
                                            {/* Knife glint */}
                                            <div className="absolute top-0 left-0 w-2 h-1 bg-white opacity-0 animate-[glint_0.2s_ease-in_forwards]" />
                                        </div>
                                    </div>
                                    <div className="absolute -left-3 top-2 w-3 h-14 bg-gray-900 rounded-sm border border-black" />
                                </div>
                                {/* Legs */}
                                <div className="absolute w-5 h-10 bg-black bottom-0 left-1/4 rounded-sm border border-gray-900" />
                                <div className="absolute w-5 h-10 bg-black bottom-0 right-1/4 rounded-sm border border-gray-900" />
                            </div>
                        </div>
                    )}
                    
                    {/* Struggle effect (brief, during stabbing/struggle phase) */}
                    {crimePhase >= 2 && crimePhase < 3 && (
                        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 opacity-0 animate-[struggle_0.5s_ease-in-out_forwards]">
                            <div className="w-24 h-24 border-4 border-red-500/30 rounded-full animate-pulse" />
                        </div>
                    )}
                    
                    {/* Blood splatter effect (shows on fall) */}
                    {crimePhase >= 3 && (
                        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 opacity-0 animate-[bloodSplatter_0.6s_ease-out_forwards]">
                            <div className="w-2 h-2 bg-red-700 rounded-full" />
                            <div className="absolute -top-2 left-3 w-1 h-4 bg-red-600/80 rounded-full transform rotate-45" />
                            <div className="absolute top-1 -left-3 w-3 h-1 bg-red-600/70 rounded-full" />
                            <div className="absolute -top-1 -right-2 w-2 h-3 bg-red-700/60 rounded-full transform rotate-[-30deg]" />
                            <div className="absolute top-2 left-1 w-4 h-1 bg-red-600/50" />
                        </div>
                    )}
                    
                    {/* Victim falls (visible at fall phase) */}
                    {crimePhase >= 3 && (
                        <div className="absolute bottom-20 left-[45%] opacity-0 animate-[victimFall_1s_ease-in_forwards]">
                            <div className="relative w-28 h-16 transform rotate-90">
                                {/* Head */}
                                <div className="absolute w-12 h-12 bg-amber-200 rounded-full left-0 border-2 border-amber-300">
                                    <div className="absolute w-full h-1/2 bg-amber-900 top-0 rounded-t-full" />
                                </div>
                                {/* Body laying down */}
                                <div className="absolute w-14 h-14 bg-blue-600 left-10 top-1/2 -translate-y-1/2 rounded-md border-2 border-blue-700">
                                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-10 bg-amber-200 rounded-full border border-amber-300" />
                                </div>
                                {/* Legs */}
                                <div className="absolute w-3 h-8 bg-gray-700 left-20 top-1/3 rounded-sm border border-gray-800" />
                                <div className="absolute w-3 h-8 bg-gray-700 left-20 bottom-1/3 rounded-sm border border-gray-800" />
                            </div>
                        </div>
                    )}
                    
                    {/* Attacker runs away (shows once fleeing phase starts) */}
                    {crimePhase >= 4 && (
                        <div className="absolute bottom-20 left-1/2 opacity-0 animate-[attackerFlee_2s_ease-in_forwards]">
                            <div className="relative w-20 h-36">
                                {/* Head with hood */}
                                <div className="absolute w-12 h-12 bg-gray-900 rounded-full top-0 left-1/2 -translate-x-1/2 border-2 border-black">
                                    <div className="absolute -top-3 w-16 h-10 bg-black rounded-t-full left-1/2 -translate-x-1/2 border-2 border-gray-900" />
                                    <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-red-500 rounded-full" />
                                    <div className="absolute top-1/2 right-1/4 w-2 h-2 bg-red-500 rounded-full" />
                                </div>
                                {/* Body running */}
                                <div className="absolute w-16 h-20 bg-gray-900 top-11 left-1/2 -translate-x-1/2 rounded-md border-2 border-black">
                                    {/* Arms pumping */}
                                    <div className="absolute -right-3 top-2 w-3 h-14 bg-gray-900 rounded-sm transform rotate-[-20deg] border border-black" />
                                    <div className="absolute -left-3 top-2 w-3 h-14 bg-gray-900 rounded-sm transform rotate-[20deg] border border-black" />
                                </div>
                                {/* Legs running */}
                                <div className="absolute w-5 h-10 bg-black bottom-0 left-1/4 rounded-sm border border-gray-900 transform rotate-[-10deg]" />
                                <div className="absolute w-5 h-10 bg-black bottom-0 right-1/4 rounded-sm border border-gray-900 transform rotate-[10deg]" />
                            </div>
                        </div>
                    )}
                    
                    {/* Thunder/Lightning flash */}
                    <div className="absolute inset-0 bg-white opacity-0 animate-[lightning_0.3s_ease-in-out_3.4s]" />
                    <div className="absolute inset-0 bg-red-600 opacity-0 animate-[flash_0.5s_ease-in-out_3.5s]" />
                    
                    {/* Dramatic shadow cast */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-black/40 rounded-full blur-2xl opacity-0 animate-[fadeIn_1s_ease-in_4s_forwards]" />
                    
                    {/* Text overlays */}
                    <div className="absolute top-12 left-1/2 -translate-x-1/2 text-center opacity-0 animate-[fadeIn_1s_ease-in_0.5s_forwards]">
                        <p className="text-gray-400 text-sm tracking-wider">
                            11:47 PM • OCTOBER 15, 2024
                        </p>
                    </div>
                    
                    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-center">
                        <p className="text-red-500 text-3xl font-bold animate-[fadeIn_1s_ease-in_4.5s_forwards] opacity-0 drop-shadow-lg">
                            HOMICIDE
                        </p>
                        <p className="text-gray-300 text-sm mt-2 animate-[fadeIn_1s_ease-in_5s_forwards] opacity-0">
                            Downtown Alley - Crime Scene Alpha-7
                        </p>
                        <p className="text-red-400 text-xs mt-1 animate-[fadeIn_1s_ease-in_5.5s_forwards] opacity-0">
                            ⚠ Biological Evidence Present
                        </p>
                    </div>
                </div>
            )
        },
        {
            id: 'evidence',
            duration: 4000,
            render: () => (
                <div className="relative w-full h-full bg-gray-900">
                    {/* Crime scene tape */}
                    <div className="absolute top-1/4 left-0 w-full h-12 bg-yellow-400 opacity-80 -rotate-6 flex items-center justify-center">
                        <span className="text-black font-bold text-xs">⚠️ CRIME SCENE - DO NOT CROSS ⚠️</span>
                    </div>
                    
                    {/* Ground/Floor */}
                    <div className="absolute bottom-0 w-full h-2/3 bg-gradient-to-b from-gray-800 to-gray-700" />
                    
                    {/* Body outline */}
                    <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2">
                        <div className="w-48 h-32 border-4 border-white opacity-60 rounded-lg relative">
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 border-4 border-white rounded-full opacity-60" />
                        </div>
                    </div>
                    
                    {/* Blood splatter/DNA evidence with pulsing effect */}
                    <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 translate-y-8">
                        <div className="relative">
                            <div className="w-16 h-16 bg-red-700 rounded-full animate-pulse opacity-90">
                                <div className="absolute inset-0 bg-red-600 rounded-full animate-ping" />
                            </div>
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 rounded-full opacity-70" />
                            <div className="absolute -bottom-3 -left-3 w-8 h-8 bg-red-600 rounded-full opacity-60" />
                        </div>
                    </div>
                    
                    {/* Evidence markers */}
                    <div className="absolute bottom-1/3 left-1/3 w-8 h-12 bg-yellow-300 clip-triangle animate-[fadeIn_0.5s_ease-in_1s_forwards] opacity-0">
                        <span className="text-black font-bold text-xl">1</span>
                    </div>
                    
                    {/* DNA label appears */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 bg-black/80 px-6 py-3 rounded-lg border-2 border-red-500 animate-[fadeIn_1s_ease-in_1.5s_forwards] opacity-0">
                        <p className="text-red-500 text-xl font-bold">🧬 DNA EVIDENCE</p>
                        <p className="text-gray-300 text-sm mt-1">Biological material found</p>
                    </div>

                    {/* Ambulance passing by */}
                    <div className="absolute top-1/4 left-0 w-full h-24 flex items-center">
                        {/* Road */}
                        <div className="absolute inset-0 bg-gray-700/50" />
                        
                        {/* Ambulance SVG imported */}
                        <div className="absolute animate-[ambulancePass_5s_ease-in-out_0.5s_forwards]" style={{ width: '120px', height: '80px', scaleX: -1 }}>
                            <svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" width="100%" height="100%">
                                {/* Main ambulance body */}
                                <rect x="20" y="40" width="160" height="50" fill="#E8F4F8" stroke="#000" strokeWidth="2" rx="5" />
                                
                                {/* Red stripe on top */}
                                <rect x="20" y="35" width="160" height="8" fill="#DC2626" stroke="#000" strokeWidth="1" />
                                
                                {/* Roof/cabin */}
                                <polygon points="30,40 50,20 170,20 190,40" fill="#E8F4F8" stroke="#000" strokeWidth="2" />
                                
                                {/* Windshield */}
                                <polygon points="35,35 48,22 52,22 60,35" fill="#87CEEB" stroke="#000" strokeWidth="1" opacity="0.6" />
                                <polygon points="165,35 177,22 181,22 191,35" fill="#87CEEB" stroke="#000" strokeWidth="1" opacity="0.6" />
                                
                                {/* Ambulance cross symbol */}
                                <g transform="translate(100, 60)">
                                    <rect x="-15" y="-3" width="30" height="6" fill="#DC2626" />
                                    <rect x="-3" y="-15" width="6" height="30" fill="#DC2626" />
                                </g>
                                
                                {/* Door lines */}
                                <line x1="110" y1="40" x2="110" y2="90" stroke="#000" strokeWidth="1" />
                                
                                {/* Wheels */}
                                <circle cx="45" cy="95" r="12" fill="#1F2937" stroke="#000" strokeWidth="2" />
                                <circle cx="45" cy="95" r="8" fill="#4B5563" />
                                <circle cx="160" cy="95" r="12" fill="#1F2937" stroke="#000" strokeWidth="2" />
                                <circle cx="160" cy="95" r="8" fill="#4B5563" />
                                
                                {/* Hubcaps */}
                                <circle cx="45" cy="95" r="4" fill="#888" />
                                <circle cx="160" cy="95" r="4" fill="#888" />
                                
                                {/* Siren on top */}
                                <circle cx="110" cy="22" r="5" fill="#0EA5E9" stroke="#000" strokeWidth="1" />
                                <circle cx="110" cy="22" r="3" fill="#60A5FA" />
                                
                                {/* Antenna */}
                                <line x1="185" y1="30" x2="195" y2="15" stroke="#666" strokeWidth="1" />
                            </svg>
                        </div>
                        
                        {/* Ambulance light pulse effect */}
                        <div className="absolute left-0 w-full h-full animate-[ambulancePass_5s_ease-in-out_0.5s_forwards]">
                            <div className="absolute top-0 left-0 w-8 h-full bg-gradient-to-r from-red-500 to-transparent opacity-30 blur-md" />
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'collection',
            duration: 4500,
            render: () => (
                <div className="relative w-full h-full bg-gradient-to-b from-gray-700 to-gray-800">
                    {/* Police lights effect */}
                    <div className="absolute top-0 left-0 w-1/2 h-2 bg-blue-500 animate-pulse" />
                    <div className="absolute top-0 right-0 w-1/2 h-2 bg-red-500 animate-pulse" />
                    
                    {/* Floor */}
                    <div className="absolute bottom-0 w-full h-1/2 bg-gray-600" />
                    
                    {/* Spotlight effect on evidence area */}
                    <div className="absolute bottom-32 right-1/3 w-64 h-64 bg-gradient-radial from-yellow-400/10 via-transparent to-transparent rounded-full blur-3xl" />
                    
                    {/* Evidence on ground - more prominent */}
                    <div className="absolute bottom-32 right-1/3 w-10 h-10 bg-red-600 rounded-full opacity-90 shadow-lg shadow-red-600 animate-[pulse_1.5s_ease-in-out_infinite]" />
                    <div className="absolute bottom-24 right-2/5 w-6 h-6 bg-red-500 rounded-full opacity-70" />

                    {/* Forensic Doctor - animated SVG */}
                    <div className="absolute bottom-0 left-1/4 animate-[slideIn_1s_ease-out_forwards] w-56 h-96 transform scale-125" style={{ transformOrigin: 'bottom center' }}>
                        <svg viewBox="0 0 400 600" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" style={{ filter: 'drop-shadow(4px 4px 8px rgba(0,0,0,0.5))' }}>
                            {/* Ground shadow */}
                            <ellipse cx="200" cy="580" rx="80" ry="15" fill="#000" opacity="0.3"/>
                            
                            {/* Main body group */}
                            <g style={{ animation: 'body-sway-intense 3s ease-in-out infinite' }}>
                                
                                {/* Legs and feet */}
                                <g style={{ animation: 'legs-shift 4s ease-in-out infinite' }}>
                                  <path d="M 180 420 L 165 520 L 170 580" fill="#E8F4F8" stroke="#B8D4DC" strokeWidth="2"/>
                                  <path d="M 220 420 L 235 520 L 230 580" fill="#E8F4F8" stroke="#B8D4DC" strokeWidth="2"/>
                                  <ellipse cx="170" cy="580" rx="22" ry="8" fill="#4A90A4"/>
                                  <ellipse cx="230" cy="580" rx="22" ry="8" fill="#4A90A4"/>
                                </g>
                                
                                {/* Torso */}
                                <path d="M 160 240 L 150 320 L 145 420 L 180 420 L 220 420 L 255 420 L 250 320 L 240 240 Z" fill="#F0F8FA" stroke="#C0D8E0" strokeWidth="2"/>
                                <path d="M 160 280 Q 200 285 240 280" fill="none" stroke="#D0E4EC" strokeWidth="1.5" opacity="0.6"/>
                                <path d="M 155 340 Q 200 345 245 340" fill="none" stroke="#D0E4EC" strokeWidth="1.5" opacity="0.6"/>
                                
                                {/* ID badge */}
                                <rect x="175" y="300" width="35" height="45" fill="#FFF" stroke="#4A90A4" strokeWidth="1.5" rx="2"/>
                                <text x="192" y="318" fontFamily="Arial" fontSize="8" fill="#4A90A4" textAnchor="middle">ID</text>
                                <rect x="180" y="322" width="25" height="3" fill="#4A90A4" opacity="0.4"/>
                                <rect x="180" y="327" width="25" height="3" fill="#4A90A4" opacity="0.4"/>
                                <rect x="180" y="332" width="20" height="3" fill="#4A90A4" opacity="0.4"/>
                                
                                {/* Arms */}
                                <g style={{ animation: 'left-arm-pickup 3s ease-in-out infinite', transformOrigin: '160px 250px' }}>
                                  <path d="M 160 250 L 130 290 L 120 350" fill="#E8F4F8" stroke="#B8D4DC" strokeWidth="2"/>
                                </g>
                                <g style={{ animation: 'right-arm-analyze 2.5s ease-in-out infinite', transformOrigin: '240px 250px' }}>
                                  <path d="M 240 250 L 270 290 L 280 350" fill="#E8F4F8" stroke="#B8D4DC" strokeWidth="2"/>
                                </g>
                                
                                {/* Hands */}
                                {/* Left hand */}
                                <g style={{ animation: 'hand-pickup-motion 3s ease-in-out infinite', transformOrigin: '120px 360px' }}>
                                  <ellipse cx="120" cy="360" rx="12" ry="16" fill="#6BA5D9" transform="rotate(-20 120 360)"/>
                                  <path d="M 115 355 Q 112 348 110 345" fill="none" stroke="#5A95C9" strokeWidth="2"/>
                                  <path d="M 120 353 Q 118 346 117 343" fill="none" stroke="#5A95C9" strokeWidth="2"/>
                                  <path d="M 125 355 Q 124 348 124 345" fill="none" stroke="#5A95C9" strokeWidth="2"/>
                                </g>
                                
                                {/* Evidence bag */}
                                                                <g style={{ animation: 'evidence-bag-collect 3s ease-in-out infinite' }}>
                                                                    <rect x="95" y="365" width="40" height="50" fill="#FFF" fillOpacity="0.6" stroke="#C00" strokeWidth="2" rx="2"/>
                                                                    <path d="M 95 370 L 135 370" stroke="#C00" strokeWidth="1.5"/>
                                                                    <text x="115" y="395" fontFamily="Arial" fontSize="7" fill="#C00" textAnchor="middle" fontWeight="bold">EVIDENCE</text>
                                                                    <circle cx="115" cy="410" r="6" fill="#DC2626" opacity="0.8"/>
                                                                </g>
                                
                                {/* Right hand */}
                                <g style={{ animation: 'hand-analyze-motion 2.5s ease-in-out infinite 0.3s', transformOrigin: '280px 360px' }}>
                                  <ellipse cx="280" cy="360" rx="12" ry="16" fill="#6BA5D9" transform="rotate(20 280 360)"/>
                                  <path d="M 275 355 Q 273 348 272 345" fill="none" stroke="#5A95C9" strokeWidth="2"/>
                                  <path d="M 280 353 Q 279 346 279 343" fill="none" stroke="#5A95C9" strokeWidth="2"/>
                                  <path d="M 285 355 Q 285 348 286 345" fill="none" stroke="#5A95C9" strokeWidth="2"/>
                                </g>
                                
                                {/* Magnifying glass */}
                                                                <g style={{ animation: 'magnifying-glass-inspect 2.5s ease-in-out infinite', transformOrigin: '295px 370px' }}>
                                                                    <circle cx="295" cy="370" r="15" fill="none" stroke="#666" strokeWidth="2.5"/>
                                                                    <circle cx="295" cy="370" r="12" fill="#E0F0FF" opacity="0.3"/>
                                                                    <circle cx="295" cy="370" r="8" fill="#FFD700" opacity="0.3" />
                                                                    <path d="M 306 380 L 318 392" stroke="#666" strokeWidth="3" strokeLinecap="round"/>
                                                                </g>
                                
                                {/* Head */}
                                <g style={{ animation: 'head-focused 2.5s ease-in-out infinite', transformOrigin: '200px 200px' }}>
                                  <path d="M 150 180 Q 145 200 145 220 L 145 245 L 160 250 L 240 250 L 255 245 L 255 220 Q 255 200 250 180 Z" fill="#F0F8FA" stroke="#C0D8E0" strokeWidth="2"/>
                                  <ellipse cx="200" cy="200" rx="42" ry="48" fill="#FFE4C4"/>
                                  
                                  {/* Eyes */}
                                  <ellipse cx="185" cy="195" rx="5" ry="6" fill="#FFF"/>
                                  <ellipse cx="215" cy="195" rx="5" ry="6" fill="#FFF"/>
                                  <circle cx="185" cy="196" r="3" fill="#5D4E37"/>
                                  <circle cx="215" cy="196" r="3" fill="#5D4E37"/>
                                  <circle cx="186" cy="195" r="1.5" fill="#FFF"/>
                                  <circle cx="216" cy="195" r="1.5" fill="#FFF"/>
                                  
                                  {/* Eyebrows */}
                                  <path d="M 177 188 Q 185 186 192 188" fill="none" stroke="#5D4E37" strokeWidth="2" strokeLinecap="round"/>
                                  <path d="M 208 188 Q 215 186 223 188" fill="none" stroke="#5D4E37" strokeWidth="2" strokeLinecap="round"/>
                                  
                                  {/* Nose */}
                                  <path d="M 200 200 L 198 210" fill="none" stroke="#E8C4A4" strokeWidth="1.5"/>
                                  <ellipse cx="196" cy="212" rx="3" ry="2" fill="none" stroke="#E8C4A4" strokeWidth="1"/>
                                  <ellipse cx="204" cy="212" rx="3" ry="2" fill="none" stroke="#E8C4A4" strokeWidth="1"/>
                                  
                                  {/* Face mask */}
                                  <path d="M 170 210 Q 170 225 175 232 L 225 232 Q 230 225 230 210" fill="#6BA5D9" stroke="#5A95C9" strokeWidth="2"/>
                                  <path d="M 175 217 L 225 217" stroke="#5A95C9" strokeWidth="1" opacity="0.7"/>
                                  <path d="M 175 222 L 225 222" stroke="#5A95C9" strokeWidth="1" opacity="0.7"/>
                                  <path d="M 175 227 L 225 227" stroke="#5A95C9" strokeWidth="1" opacity="0.7"/>
                                  <path d="M 230 215 Q 245 210 250 205" fill="none" stroke="#5A95C9" strokeWidth="2"/>
                                  <path d="M 170 215 Q 155 210 150 205" fill="none" stroke="#5A95C9" strokeWidth="2"/>
                                </g>
                                
                                {/* Camera */}
                                                                <g style={{ animation: 'camera-documenting 2.5s ease-in-out infinite', transformOrigin: '200px 265px' }}>
                                                                    <rect x="185" y="260" width="30" height="22" fill="#333" rx="2"/>
                                                                    <circle cx="200" cy="271" r="7" fill="#555"/>
                                                                    <circle cx="200" cy="271" r="5" fill="#222"/>
                                                                    <rect x="213" y="263" width="3" height="3" fill="#FF6B6B" opacity="0.8"/>
                                  <path d="M 175 265 Q 170 250 170 245" fill="none" stroke="#333" strokeWidth="2"/>
                                  <path d="M 225 265 Q 230 250 230 245" fill="none" stroke="#333" strokeWidth="2"/>
                                </g>
                                
                                {/* Equipment belt */}
                                <rect x="155" y="380" width="90" height="8" fill="#4A90A4" rx="2" stroke="#2A5A7A" strokeWidth="1"/>
                                <rect x="165" y="388" width="15" height="20" fill="#3A7A94" rx="1" stroke="#1A4A6A" strokeWidth="1"/>
                                <rect x="192" y="388" width="15" height="20" fill="#3A7A94" rx="1" stroke="#1A4A6A" strokeWidth="1"/>
                                <rect x="220" y="388" width="15" height="20" fill="#3A7A94" rx="1" stroke="#1A4A6A" strokeWidth="1"/>
                            </g>
                        </svg>

                                                {/* Animation styles for the SVG */}
                                                <style>{`
                                                    @keyframes body-sway-intense {
                                                        0%, 100% { transform: translateX(0) rotate(0deg); }
                                                        25% { transform: translateX(3px) rotate(1deg); }
                                                        50% { transform: translateX(0) rotate(0deg); }
                                                        75% { transform: translateX(-3px) rotate(-1deg); }
                                                    }
                                                    @keyframes head-focused {
                                                        0%, 100% { transform: rotateX(0deg) rotateY(0deg); }
                                                        50% { transform: rotateX(-2deg) rotateY(-3deg); }
                                                    }
                                                    @keyframes left-arm-pickup {
                                                        0%, 100% { transform: rotate(0deg) translateY(0); }
                                                        35% { transform: rotate(-25deg) translateY(-15px); }
                                                        70% { transform: rotate(-20deg) translateY(-10px); }
                                                    }
                                                    @keyframes right-arm-analyze {
                                                        0%, 100% { transform: rotate(0deg) translateX(0); }
                                                        30% { transform: rotate(35deg) translateX(15px); }
                                                        60% { transform: rotate(30deg) translateX(12px); }
                                                    }
                                                    @keyframes hand-pickup-motion {
                                                        0%, 100% { transform: scaleY(1) rotate(0deg); }
                                                        35% { transform: scaleY(0.9) rotate(-5deg); }
                                                        50% { transform: scaleY(1.15) rotate(-8deg); }
                                                        70% { transform: scaleY(1.1) rotate(-5deg); }
                                                    }
                                                    @keyframes hand-analyze-motion {
                                                        0%, 100% { transform: scaleY(1) rotate(0deg); }
                                                        30% { transform: scaleY(1.05) rotate(8deg); }
                                                        60% { transform: scaleY(1.1) rotate(12deg); }
                                                    }
                                                    @keyframes evidence-bag-collect {
                                                        0%, 100% { transform: translateY(0) scale(1); opacity: 0.6; }
                                                        35% { transform: translateY(-8px) scale(1.05); opacity: 0.8; }
                                                        50% { transform: translateY(-12px) scale(1.1); opacity: 0.9; }
                                                    }
                                                    @keyframes magnifying-glass-inspect {
                                                        0%, 100% { transform: rotate(0deg) scale(1); }
                                                        30% { transform: rotate(-15deg) scale(1.1); }
                                                        60% { transform: rotate(15deg) scale(1.1); }
                                                    }
                                                    @keyframes legs-shift {
                                                        0%, 100% { transform: translateY(0); }
                                                        25% { transform: translateY(2px); }
                                                        50% { transform: translateY(0); }
                                                        75% { transform: translateY(-2px); }
                                                    }
                                                    @keyframes camera-documenting {
                                                        0%, 100% { transform: rotate(-8deg) scale(1); }
                                                        50% { transform: rotate(0deg) scale(1.05); }
                                                    }
                                                `}</style>
                    </div>
                    
                    {/* (Prominent evidence markers handled above) */}
                    
                    {/* Text */}
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center animate-[fadeIn_1s_ease-in_0.5s_forwards] opacity-0">
                        <p className="text-white text-3xl font-bold drop-shadow-lg">EVIDENCE COLLECTION</p>
                        <p className="text-blue-200 text-sm mt-2 font-semibold">Forensic team securing biological samples</p>
                    </div>
                    
                    {/* Collection status - live updates */}
                    <div className="absolute bottom-12 right-8 bg-black/80 p-4 rounded-lg border-2 border-blue-400 shadow-lg shadow-blue-400/50 animate-[fadeIn_1s_ease-in_1s_forwards] opacity-0">
                        <p className="text-green-400 text-sm font-bold mb-2">◆ COLLECTING</p>
                        <p className="text-green-400 text-sm">✓ Blood sample</p>
                        <p className="text-green-400 text-sm">✓ Hair follicle</p>
                        <p className="text-green-400 text-xs">◆ Tissue sample</p>
                        <div className="mt-2 h-1 bg-green-900 rounded-full overflow-hidden">
                            <div className="h-full w-2/3 bg-green-400 animate-[pulse_1.5s_ease-in-out_infinite]"></div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'lab-transition',
            duration: 4000,
            render: () => (
                <div className="relative w-full h-full bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900">
                    {/* Laboratory setting */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        {/* Lab equipment silhouettes */}
                        <div className="absolute bottom-0 left-1/4 w-16 h-32 bg-gray-800/50 rounded-t-lg" />
                        <div className="absolute bottom-0 right-1/4 w-20 h-40 bg-gray-800/50 rounded-t-lg" />
                        
                        {/* DNA helix animation */}
                        <div className="relative animate-[spin_4s_linear_infinite]">
                            <div className="w-32 h-32">
                                {/* DNA strands */}
                                <div className="absolute top-0 left-1/2 w-1 h-full bg-gradient-to-b from-cyan-400 to-blue-600" />
                                <div className="absolute top-0 right-1/2 w-1 h-full bg-gradient-to-b from-pink-400 to-purple-600" />
                                {/* Base pairs */}
                                {[0, 1, 2, 3, 4].map((i) => (
                                    <div
                                        key={i}
                                        className="absolute left-1/2 -translate-x-1/2 w-16 h-1 bg-white/50"
                                        style={{ top: `${i * 25}%` }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    {/* Title animation */}
                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 text-center w-full">
                        <h2 className="text-5xl font-bold text-white mb-4 animate-[fadeInUp_1s_ease-out_forwards]">
                            GAME Objective
                        </h2>
                        <div className="h-1 w-64 bg-gradient-to-r from-transparent via-cyan-400 to-transparent mx-auto mb-6 animate-[expand_1s_ease-out_0.5s_forwards] scale-x-0" />
                        <p className="text-xl text-cyan-300 opacity-0 animate-[fadeIn_1s_ease-in_1s_forwards]">
                           RFLP Restriction Fragment Length Polymorphism
                        </p>
                        <p className="text-lg text-gray-300 mt-4 opacity-0 animate-[fadeIn_1s_ease-in_1.5s_forwards]">
                            Analyzing DNA evidence to identify the perpetrator
                        </p>
                    </div>
                    
                    {/* Loading indicators */}
                    <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 flex space-x-3">
                        <div className="w-4 h-4 bg-cyan-400 rounded-full animate-bounce" />
                        <div className="w-4 h-4 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        <div className="w-4 h-4 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                    </div>
                    
                    {/* Lab process steps */}
                    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex space-x-8 opacity-0 animate-[fadeIn_1s_ease-in_2s_forwards]">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-cyan-500/30 rounded-full flex items-center justify-center mb-2 mx-auto border-2 border-cyan-400">
                                <span className="text-xl">🔬</span>
                            </div>
                            <p className="text-xs text-cyan-300">Extract</p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-blue-500/30 rounded-full flex items-center justify-center mb-2 mx-auto border-2 border-blue-400">
                                <span className="text-xl">✂️</span>
                            </div>
                            <p className="text-xs text-blue-300">Digest</p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-purple-500/30 rounded-full flex items-center justify-center mb-2 mx-auto border-2 border-purple-400">
                                <span className="text-xl">📊</span>
                            </div>
                            <p className="text-xs text-purple-300">Analyze</p>
                        </div>
                    </div>
                </div>
            )
        }
    ];

    useEffect(() => {
        if (currentScene >= scenes.length) {
            setTimeout(() => {
                onComplete();
            }, 500);
            return;
        }

        const timer = setTimeout(() => {
            setFadeOut(true);
            setTimeout(() => {
                setCurrentScene(prev => prev + 1);
                setFadeOut(false);
            }, 300);
        }, scenes[currentScene].duration);

        return () => clearTimeout(timer);
    }, [currentScene, scenes.length, onComplete]);

    if (currentScene >= scenes.length) return null;

    return (
        <div className="fixed inset-0 z-[5000] bg-black">
            <div className={`w-full h-full transition-opacity duration-300 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
                {scenes[currentScene].render()}
            </div>
            
            {/* Skip button */}
            <button
                onClick={() => onComplete()}
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white px-4 py-2 rounded-lg text-sm transition-colors border border-white/30"
            >
                Skip Intro →
            </button>
        </div>
    );
};

export default IntroAnimation;
