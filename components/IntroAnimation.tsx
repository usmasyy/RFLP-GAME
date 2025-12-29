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
            try { ambientRef.current?.pause(); } catch { }
            try {
                if (screamRef.current) {
                    if (screamEndedHandlerRef.current) {
                        try { screamRef.current.removeEventListener('ended', screamEndedHandlerRef.current); } catch { }
                        screamEndedHandlerRef.current = null;
                    }
                    screamRef.current.pause();
                    screamRef.current.currentTime = 0;
                }
            } catch { }
            try { ambulanceRef.current?.pause(); ambulanceRef.current && (ambulanceRef.current.currentTime = 0); } catch { }
            try { stingRef.current?.pause(); stingRef.current && (stingRef.current.currentTime = 0); } catch { }
            try { sabotageRef.current?.pause(); sabotageRef.current && (sabotageRef.current.currentTime = 0); } catch { }
            try { themeRef.current?.pause(); themeRef.current && (themeRef.current.currentTime = 0); } catch { }
            // Stop ambulance only on complete unmount
            try { if (ambulanceRef.current) { ambulanceRef.current.loop = false; ambulanceRef.current.pause(); ambulanceRef.current.currentTime = 0; } } catch { }
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
                        try { screamRef.current.removeEventListener('ended', screamEndedHandlerRef.current); } catch { }
                        screamEndedHandlerRef.current = null;
                    }
                    screamRef.current.pause();
                    screamRef.current.currentTime = 0;
                }
            } catch { }
        }

        // Theme handling for later scenes
        if (currentScene === 3) { // Lab Scene
            try {
                if (themeRef.current) {
                    themeRef.current.volume = 0.4;
                    themeRef.current.loop = true;
                    themeRef.current.play().catch(() => { });
                }
            } catch { }
        } else {
            try { if (themeRef.current) { themeRef.current.pause(); themeRef.current.currentTime = 0; } } catch { }
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
                    sabotageRef.current.play().catch(() => { });
                }
            } catch { }
        }, 3600);
        const tFall = window.setTimeout(() => {
            setCrimePhase(3);

            // Play scream exactly when victim falls (non-looping, brief)
            try {
                if (screamRef.current) {
                    // remove any previous ended handler
                    if (screamEndedHandlerRef.current && screamRef.current) {
                        try { screamRef.current.removeEventListener('ended', screamEndedHandlerRef.current); } catch { }
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
            } catch { }
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
            duration: 6000,
            render: () => (
                <div className="relative w-full h-full bg-gradient-to-b from-slate-900 via-gray-800 to-gray-900 overflow-hidden">
                    {/* Animated police lights - more dramatic sweeping effect */}
                    <div className="absolute top-0 left-0 w-full h-3 overflow-hidden">
                        <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600 animate-[policeSweepLeft_1.5s_ease-in-out_infinite]" />
                        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-r from-red-600 via-red-400 to-red-600 animate-[policeSweepRight_1.5s_ease-in-out_infinite_0.75s]" />
                    </div>

                    {/* Atmospheric fog layers */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    <div className="absolute bottom-0 w-full h-48 bg-gradient-to-t from-blue-900/30 to-transparent animate-[fogDrift_8s_ease-in-out_infinite]" />

                    {/* Crime scene floor with texture */}
                    <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-br from-gray-700 via-gray-600 to-gray-700">
                        {/* Floor grid lines */}
                        <div className="absolute inset-0 opacity-10">
                            {[...Array(10)].map((_, i) => (
                                <div key={i} className="absolute h-px bg-white" style={{ top: `${i * 10}%`, width: '100%' }} />
                            ))}
                        </div>
                    </div>

                    {/* Dynamic spotlights on evidence */}
                    <div className="absolute bottom-40 left-1/2 -translate-x-1/2 w-80 h-80 bg-gradient-radial from-yellow-400/20 via-yellow-300/5 to-transparent rounded-full blur-2xl animate-[spotlight_3s_ease-in-out_infinite]" />
                    <div className="absolute bottom-32 right-1/4 w-48 h-48 bg-gradient-radial from-cyan-400/15 via-transparent to-transparent rounded-full blur-xl animate-[spotlight_4s_ease-in-out_infinite_1s]" />

                    {/* Body outline with pulsing glow */}
                    <div className="absolute bottom-28 left-1/2 -translate-x-1/2 w-56 h-36 opacity-0 animate-[fadeIn_1s_ease-in_0.5s_forwards]">
                        <div className="absolute inset-0 border-4 border-white/60 rounded-lg">
                            <div className="absolute inset-0 border-4 border-white/30 rounded-lg animate-[pulse_2s_ease-in-out_infinite]" />
                        </div>
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 border-4 border-white/60 rounded-full">
                            <div className="absolute inset-0 border-4 border-white/30 rounded-full animate-[pulse_2s_ease-in-out_infinite_0.5s]" />
                        </div>
                    </div>

                    {/* Evidence markers with glow */}
                    <div className="absolute bottom-40 left-1/3 opacity-0 animate-[fadeIn_0.5s_ease-in_1s_forwards]">
                        <div className="relative">
                            <div className="absolute -inset-2 bg-yellow-400/50 rounded-full blur-md animate-[pulse_1.5s_ease-in-out_infinite]" />
                            <div className="relative w-10 h-14 bg-yellow-400 flex items-center justify-center text-black font-bold text-xl" style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }}>1</div>
                        </div>
                    </div>
                    <div className="absolute bottom-36 right-1/3 opacity-0 animate-[fadeIn_0.5s_ease-in_1.2s_forwards]">
                        <div className="relative">
                            <div className="absolute -inset-2 bg-yellow-400/50 rounded-full blur-md animate-[pulse_1.5s_ease-in-out_infinite_0.3s]" />
                            <div className="relative w-10 h-14 bg-yellow-400 flex items-center justify-center text-black font-bold text-xl" style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }}>2</div>
                        </div>
                    </div>

                    {/* Blood evidence with dramatic glow */}
                    <div className="absolute bottom-32 left-1/2 -translate-x-1/4">
                        <div className="relative">
                            <div className="absolute -inset-4 bg-red-600/60 rounded-full blur-xl animate-[pulse_2s_ease-in-out_infinite]" />
                            <div className="w-12 h-12 bg-gradient-radial from-red-600 via-red-700 to-red-800 rounded-full shadow-lg shadow-red-600/50" />
                            <div className="absolute top-2 left-2 w-4 h-4 bg-red-400/50 rounded-full" />
                        </div>
                    </div>
                    <div className="absolute bottom-28 right-2/5 w-8 h-8 bg-gradient-radial from-red-500 via-red-600 to-red-700 rounded-full opacity-80 shadow-lg shadow-red-500/30" />

                    {/* ====== FORENSIC DOCTOR CHARACTER - LEFT SIDE ====== */}
                    <div className="absolute bottom-0 left-[8%] h-[75%] opacity-0 animate-[characterEnterLeft_1.5s_ease-out_0.3s_forwards]" style={{ perspective: '1000px' }}>
                        {/* Character glow aura */}
                        <div className="absolute -inset-8 bg-gradient-radial from-cyan-500/30 via-cyan-400/10 to-transparent rounded-full blur-2xl animate-[auraGlow_3s_ease-in-out_infinite]" />

                        {/* Ground shadow */}
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-32 h-8 bg-black/50 rounded-full blur-lg animate-[shadowPulse_3s_ease-in-out_infinite]" />

                        {/* Floating animation wrapper */}
                        <div className="relative h-full animate-[characterFloat_4s_ease-in-out_infinite]" style={{ transformStyle: 'preserve-3d' }}>
                            {/* Scanning light effect from character */}
                            <div className="absolute top-1/3 right-0 w-40 h-2 bg-gradient-to-r from-cyan-400 via-cyan-300 to-transparent opacity-60 blur-sm animate-[scanBeam_2s_ease-in-out_infinite]" style={{ transformOrigin: 'left center' }} />

                            <img
                                src="/assets/characters/forensic doctor.png"
                                alt="Forensic Doctor"
                                className="h-full w-auto object-contain drop-shadow-2xl animate-[characterSubtle_5s_ease-in-out_infinite]"
                                style={{
                                    filter: 'drop-shadow(0 0 15px rgba(34, 211, 238, 0.4)) drop-shadow(0 8px 16px rgba(0,0,0,0.6))',
                                }}
                            />

                            {/* Particle effects around character */}
                            <div className="absolute top-1/4 -right-4 w-2 h-2 bg-cyan-400 rounded-full animate-[particleFloat_3s_ease-in-out_infinite]" />
                            <div className="absolute top-1/3 -left-2 w-1.5 h-1.5 bg-cyan-300 rounded-full animate-[particleFloat_4s_ease-in-out_infinite_0.5s]" />
                            <div className="absolute top-1/2 right-2 w-1 h-1 bg-white rounded-full animate-[particleFloat_2.5s_ease-in-out_infinite_1s]" />
                        </div>

                        {/* Character label */}
                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-900/90 to-cyan-800/90 px-4 py-1.5 rounded-full border border-cyan-400/50 shadow-lg shadow-cyan-500/30 animate-[fadeIn_1s_ease-in_1s_forwards] opacity-0">
                            <p className="text-cyan-200 text-xs font-bold tracking-wider whitespace-nowrap">DR. FORENSICS</p>
                        </div>
                    </div>

                    {/* ====== POLICE DETECTIVE CHARACTER - RIGHT SIDE ====== */}
                    <div className="absolute bottom-0 right-[8%] h-[75%] opacity-0 animate-[characterEnterRight_1.5s_ease-out_0.6s_forwards]" style={{ perspective: '1000px' }}>
                        {/* Character glow aura */}
                        <div className="absolute -inset-8 bg-gradient-radial from-amber-500/30 via-yellow-400/10 to-transparent rounded-full blur-2xl animate-[auraGlow_3s_ease-in-out_infinite_0.5s]" />

                        {/* Ground shadow */}
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-32 h-8 bg-black/50 rounded-full blur-lg animate-[shadowPulse_3s_ease-in-out_infinite_0.5s]" />

                        {/* Floating animation wrapper */}
                        <div className="relative h-full animate-[characterFloat_4s_ease-in-out_infinite_1s]" style={{ transformStyle: 'preserve-3d' }}>
                            {/* Flashlight beam effect */}
                            <div className="absolute top-1/3 left-0 w-48 h-24 opacity-0 animate-[flashlightBeam_4s_ease-in-out_infinite_2s]" style={{
                                background: 'conic-gradient(from 180deg at 0% 50%, transparent 0deg, rgba(255,255,200,0.3) 15deg, rgba(255,255,200,0.1) 30deg, transparent 45deg)',
                                transformOrigin: 'left center',
                                filter: 'blur(4px)'
                            }} />

                            <img
                                src="/assets/characters/police detective.png"
                                alt="Police Detective"
                                className="h-full w-auto object-contain drop-shadow-2xl animate-[characterSubtle_5s_ease-in-out_infinite_0.5s]"
                                style={{
                                    filter: 'drop-shadow(0 0 15px rgba(245, 158, 11, 0.4)) drop-shadow(0 8px 16px rgba(0,0,0,0.6))',
                                }}
                            />

                            {/* Badge glint effect */}
                            <div className="absolute top-1/3 left-1/4 w-3 h-3 bg-yellow-300 rounded-full opacity-0 animate-[badgeGlint_3s_ease-in-out_infinite_1s]" style={{ filter: 'blur(2px)' }} />

                            {/* Particle effects */}
                            <div className="absolute top-1/4 -left-4 w-2 h-2 bg-amber-400 rounded-full animate-[particleFloat_3.5s_ease-in-out_infinite_0.3s]" />
                            <div className="absolute top-2/5 -right-2 w-1.5 h-1.5 bg-yellow-300 rounded-full animate-[particleFloat_3s_ease-in-out_infinite_0.8s]" />
                        </div>

                        {/* Character label */}
                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-900/90 to-yellow-800/90 px-4 py-1.5 rounded-full border border-amber-400/50 shadow-lg shadow-amber-500/30 animate-[fadeIn_1s_ease-in_1.3s_forwards] opacity-0">
                            <p className="text-amber-200 text-xs font-bold tracking-wider whitespace-nowrap">DET. INSPECTOR</p>
                        </div>
                    </div>

                    {/* Crime scene tape in foreground */}
                    <div className="absolute bottom-16 left-0 w-full overflow-hidden opacity-0 animate-[fadeIn_0.5s_ease-in_1.5s_forwards]">
                        <div className="w-[200%] h-8 bg-yellow-400 -rotate-2 -ml-12 flex items-center animate-[tapeScroll_20s_linear_infinite]">
                            <div className="flex whitespace-nowrap">
                                {[...Array(20)].map((_, i) => (
                                    <span key={i} className="text-black font-bold text-sm mx-4">⚠️ CRIME SCENE - DO NOT CROSS ⚠️</span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Title with cinematic reveal */}
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center">
                        <div className="overflow-hidden">
                            <p className="text-white text-4xl font-bold drop-shadow-lg opacity-0 animate-[titleReveal_1s_ease-out_0.5s_forwards]" style={{ textShadow: '0 0 40px rgba(255,255,255,0.3)' }}>
                                EVIDENCE COLLECTION
                            </p>
                        </div>
                        <div className="h-1 w-0 bg-gradient-to-r from-transparent via-cyan-400 to-transparent mx-auto mt-3 animate-[lineExpand_1s_ease-out_1s_forwards]" />
                        <p className="text-blue-200 text-sm mt-3 font-semibold opacity-0 animate-[fadeIn_1s_ease-in_1.5s_forwards]">
                            Forensic team securing biological samples
                        </p>
                    </div>

                    {/* Collection status panel - enhanced */}
                    <div className="absolute bottom-24 right-6 bg-black/90 p-5 rounded-xl border-2 border-cyan-500/70 shadow-2xl shadow-cyan-500/20 opacity-0 animate-[panelSlideIn_0.8s_ease-out_2s_forwards] backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                            <p className="text-green-400 text-sm font-bold tracking-wider">EVIDENCE LOG</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-green-400 text-sm flex items-center gap-2"><span className="text-green-500">✓</span> Blood sample collected</p>
                            <p className="text-green-400 text-sm flex items-center gap-2"><span className="text-green-500">✓</span> Hair follicle secured</p>
                            <p className="text-cyan-300 text-sm flex items-center gap-2"><span className="animate-pulse">◆</span> Tissue sample processing...</p>
                        </div>
                        <div className="mt-4 h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                            <div className="h-full w-2/3 bg-gradient-to-r from-green-500 via-cyan-400 to-green-500 animate-[progressGlow_2s_ease-in-out_infinite]" />
                        </div>
                        <p className="text-gray-400 text-xs mt-2 text-right">67% Complete</p>
                    </div>

                    {/* Custom keyframes for this scene */}
                    <style>{`
                        @keyframes characterEnterLeft {
                            0% { opacity: 0; transform: translateX(-100px) scale(0.8); }
                            70% { opacity: 1; transform: translateX(20px) scale(1.02); }
                            100% { opacity: 1; transform: translateX(0) scale(1); }
                        }
                        @keyframes characterEnterRight {
                            0% { opacity: 0; transform: translateX(100px) scale(0.8); }
                            70% { opacity: 1; transform: translateX(-20px) scale(1.02); }
                            100% { opacity: 1; transform: translateX(0) scale(1); }
                        }
                        @keyframes characterFloat {
                            0%, 100% { transform: translateY(0) rotateY(0deg); }
                            25% { transform: translateY(-8px) rotateY(2deg); }
                            50% { transform: translateY(-4px) rotateY(0deg); }
                            75% { transform: translateY(-10px) rotateY(-2deg); }
                        }
                        @keyframes characterSubtle {
                            0%, 100% { transform: scale(1) rotate(0deg); }
                            50% { transform: scale(1.02) rotate(0.5deg); }
                        }
                        @keyframes auraGlow {
                            0%, 100% { opacity: 0.3; transform: scale(1); }
                            50% { opacity: 0.6; transform: scale(1.1); }
                        }
                        @keyframes shadowPulse {
                            0%, 100% { transform: translateX(-50%) scaleX(1); opacity: 0.5; }
                            50% { transform: translateX(-50%) scaleX(1.2); opacity: 0.3; }
                        }
                        @keyframes particleFloat {
                            0%, 100% { transform: translateY(0) translateX(0); opacity: 0.6; }
                            25% { transform: translateY(-15px) translateX(5px); opacity: 1; }
                            50% { transform: translateY(-20px) translateX(-3px); opacity: 0.8; }
                            75% { transform: translateY(-10px) translateX(8px); opacity: 1; }
                        }
                        @keyframes scanBeam {
                            0%, 100% { transform: scaleX(0) rotate(-5deg); opacity: 0; }
                            50% { transform: scaleX(1) rotate(5deg); opacity: 0.6; }
                        }
                        @keyframes flashlightBeam {
                            0%, 100% { opacity: 0; transform: scaleX(0.5) rotate(-10deg); }
                            30%, 70% { opacity: 0.5; transform: scaleX(1) rotate(0deg); }
                        }
                        @keyframes badgeGlint {
                            0%, 70%, 100% { opacity: 0; transform: scale(0.5); }
                            75%, 80% { opacity: 1; transform: scale(1.5); }
                        }
                        @keyframes policeSweepLeft {
                            0%, 100% { transform: translateX(-100%); }
                            50% { transform: translateX(200%); }
                        }
                        @keyframes policeSweepRight {
                            0%, 100% { transform: translateX(100%); }
                            50% { transform: translateX(-200%); }
                        }
                        @keyframes fogDrift {
                            0%, 100% { transform: translateX(0); opacity: 0.3; }
                            50% { transform: translateX(-20px); opacity: 0.5; }
                        }
                        @keyframes spotlight {
                            0%, 100% { opacity: 0.2; transform: scale(1); }
                            50% { opacity: 0.4; transform: scale(1.1); }
                        }
                        @keyframes titleReveal {
                            0% { opacity: 0; transform: translateY(30px); }
                            100% { opacity: 1; transform: translateY(0); }
                        }
                        @keyframes lineExpand {
                            0% { width: 0; }
                            100% { width: 300px; }
                        }
                        @keyframes panelSlideIn {
                            0% { opacity: 0; transform: translateX(50px); }
                            100% { opacity: 1; transform: translateX(0); }
                        }
                        @keyframes progressGlow {
                            0%, 100% { filter: brightness(1); }
                            50% { filter: brightness(1.3); }
                        }
                        @keyframes tapeScroll {
                            0% { transform: translateX(0) rotate(-2deg); }
                            100% { transform: translateX(-50%) rotate(-2deg); }
                        }
                    `}</style>
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
