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

    // Audio refs - placeholders for the user to drop MP3 files into `/public/audio`
    const ambientRef = useRef<HTMLAudioElement | null>(null);
    const murderRef = useRef<HTMLAudioElement | null>(null);
    const screamRef = useRef<HTMLAudioElement | null>(null);
    const stingRef = useRef<HTMLAudioElement | null>(null);
    const sabotageRef = useRef<HTMLAudioElement | null>(null);
    const themeRef = useRef<HTMLAudioElement | null>(null);
    const timersRef = useRef<number[]>([]);
    const audioTimersRef = useRef<number[]>([]);

    // Initialize audio elements on mount. Files are placeholders; add your MP3s under public/audio.
    useEffect(() => {
        ambientRef.current = new Audio('/cricket-ambience-night.mp3   ');
        murderRef.current = new Audio('/among-us-sound-157106.mp3');
        screamRef.current = new Audio('/among2.mp3');
        stingRef.current = new Audio('/dramatic-sting.mp3');
        sabotageRef.current = new Audio('/among-us-alarme-sabotage-393155.mp3');
        themeRef.current = new Audio('/cricket-ambience-night.mp3');

        // Try to play ambient (may be blocked until user gesture) — non-blocking
        if (ambientRef.current) {
            ambientRef.current.volume = 0.25;
            ambientRef.current.loop = true;
            ambientRef.current.play().catch(() => {});
        }

        return () => {
            timersRef.current.forEach((t) => clearTimeout(t));
            timersRef.current.length = 0;
            try { ambientRef.current?.pause(); } catch {}
            try { murderRef.current?.pause(); murderRef.current && (murderRef.current.currentTime = 0); } catch {}
            try { screamRef.current?.pause(); screamRef.current && (screamRef.current.currentTime = 0); } catch {}
            try { stingRef.current?.pause(); stingRef.current && (stingRef.current.currentTime = 0); } catch {}
            try { sabotageRef.current?.pause(); sabotageRef.current && (sabotageRef.current.currentTime = 0); } catch {}
            try { themeRef.current?.pause(); themeRef.current && (themeRef.current.currentTime = 0); } catch {}
            ambientRef.current = null;
            murderRef.current = null;
            screamRef.current = null;
            stingRef.current = null;
            sabotageRef.current = null;
            themeRef.current = null;
        };
    }, []);

    // Play murder, scream, and dramatic sting when scene 0 starts — use a dedicated audio timer ref
    useEffect(() => {
        // clear audio timers only
        audioTimersRef.current.forEach((t) => clearTimeout(t));
        audioTimersRef.current.length = 0;

        if (currentScene === 0) {
            const t1 = window.setTimeout(() => {
                try {
                    if (murderRef.current) { 
                        // play this cue throughout the crime scene
                        murderRef.current.volume = 0.5; 
                        murderRef.current.loop = true;
                        murderRef.current.play().catch(() => {}); 
                    }
                } catch {}
            }, 800);

            const t2 = window.setTimeout(() => {
                try {
                    if (screamRef.current) { screamRef.current.volume = 0.35; screamRef.current.play().catch(() => {}); }
                } catch {}
            }, 1300);

            // Dramatic sting timed to the victim fall (will play once)
            const tSting = window.setTimeout(() => {
                try {
                    if (stingRef.current) { stingRef.current.volume = 0.6; stingRef.current.play().catch(() => {}); }
                } catch {}
            }, 4200);

            audioTimersRef.current.push(t1 as unknown as number, t2 as unknown as number, tSting as unknown as number);
        } else {
            try { if (murderRef.current) { murderRef.current.loop = false; murderRef.current.pause(); murderRef.current.currentTime = 0; } } catch {}
            try { if (screamRef.current) { screamRef.current.pause(); screamRef.current.currentTime = 0; } } catch {}
            try { if (stingRef.current) { stingRef.current.pause(); stingRef.current.currentTime = 0; } } catch {}
            try { if (sabotageRef.current) { sabotageRef.current.pause(); sabotageRef.current.currentTime = 0; } } catch {}
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
        const tFall = window.setTimeout(() => setCrimePhase(3), 4200);
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
                    
                    {/* Investigator (your character) appears */}
                    <div className="absolute bottom-1/4 left-1/4 animate-[slideIn_1s_ease-out_forwards]">
                        <div className="relative w-28 h-40">
                            {/* Head */}
                            <div className={`absolute w-16 h-16 ${character.skinColor} rounded-full top-0 left-1/2 -translate-x-1/2 border-2 border-gray-700`}>
                                {/* Hair */}
                                <div className={`absolute w-full h-1/2 ${character.hairColor} top-0 rounded-t-full`} />
                                {/* Glasses */}
                                {character.accessory === 'glasses' && (
                                    <>
                                        <div className="absolute top-1/2 left-1/4 w-4 h-4 border-2 border-black rounded-full" />
                                        <div className="absolute top-1/2 right-1/4 w-4 h-4 border-2 border-black rounded-full" />
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-2 h-0.5 bg-black" />
                                    </>
                                )}
                                {/* Eyes */}
                                {!character.accessory && (
                                    <>
                                        <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-gray-900 rounded-full" />
                                        <div className="absolute top-1/2 right-1/4 w-2 h-2 bg-gray-900 rounded-full" />
                                    </>
                                )}
                                {/* Smile */}
                                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-6 h-1 bg-gray-900 rounded-full" />
                            </div>
                            
                            {/* Body (Lab Coat) */}
                            <div className={`absolute w-24 h-28 ${character.labCoatColor} bottom-0 left-1/2 -translate-x-1/2 rounded-lg border-2 border-gray-700`}>
                                {/* Shirt underneath */}
                                <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-12 h-6 ${character.shirtColor} rounded-t-md`} />
                                {/* Lab coat buttons */}
                                <div className="absolute top-8 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 rounded-full" />
                                <div className="absolute top-12 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 rounded-full" />
                                <div className="absolute top-16 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 rounded-full" />
                                {/* Arms */}
                                <div className={`absolute -left-2 top-2 w-3 h-16 ${character.skinColor} rounded-full border border-gray-700`} />
                                <div className={`absolute -right-2 top-2 w-3 h-16 ${character.skinColor} rounded-full border border-gray-700`} />
                                {/* Pockets */}
                                <div className="absolute bottom-4 left-2 w-5 h-4 border-2 border-gray-700 rounded-sm" />
                                <div className="absolute bottom-4 right-2 w-5 h-4 border-2 border-gray-700 rounded-sm" />
                            </div>
                            
                            {/* Evidence collection bag */}
                            <div className="absolute -right-10 top-1/2 w-14 h-18 bg-blue-200/70 border-2 border-blue-500 animate-[collect_2s_ease-in-out_1.5s_forwards] backdrop-blur-sm rounded-md">
                                <div className="absolute top-1 left-1/2 -translate-x-1/2 w-10 h-1 bg-blue-600" />
                                <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[8px] text-blue-900 font-bold">EVIDENCE</span>
                                {/* Sample inside */}
                                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-red-600/70 rounded-full border border-red-700" />
                                <div className="absolute bottom-4 left-1/3 w-2 h-2 bg-red-500/50 rounded-full" />
                            </div>
                        </div>
                    </div>
                    
                    {/* Evidence on ground */}
                    <div className="absolute bottom-1/4 right-1/3 w-8 h-8 bg-red-600 rounded-full opacity-80 animate-[fadeOut_1s_ease-out_2s_forwards]" />
                    
                    {/* Text */}
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center animate-[fadeIn_1s_ease-in_0.5s_forwards] opacity-0">
                        <p className="text-white text-2xl font-bold">EVIDENCE COLLECTION</p>
                        <p className="text-gray-300 text-sm mt-2">Forensic team securing biological samples</p>
                    </div>
                    
                    {/* Collection checklist */}
                    <div className="absolute bottom-8 right-8 bg-black/70 p-4 rounded-lg border border-blue-400 animate-[fadeIn_1s_ease-in_2s_forwards] opacity-0">
                        <p className="text-green-400 text-sm">✓ Blood sample</p>
                        <p className="text-green-400 text-sm">✓ Hair follicle</p>
                        <p className="text-green-400 text-sm">✓ Tissue sample</p>
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
                            RFLP ANALYSIS
                        </h2>
                        <div className="h-1 w-64 bg-gradient-to-r from-transparent via-cyan-400 to-transparent mx-auto mb-6 animate-[expand_1s_ease-out_0.5s_forwards] scale-x-0" />
                        <p className="text-xl text-cyan-300 opacity-0 animate-[fadeIn_1s_ease-in_1s_forwards]">
                            Restriction Fragment Length Polymorphism
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
