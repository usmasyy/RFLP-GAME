import React, { useState, useRef, useEffect, useCallback } from 'react';

interface VirtualJoystickProps {
    onMove: (vector: { x: number, y: number }) => void;
    onInteract: () => void;
    size?: number;
    knobSize?: number;
}

const VirtualJoystick: React.FC<VirtualJoystickProps> = ({
    onMove,
    onInteract,
    size = 120,
    knobSize = 50
}) => {
    const [active, setActive] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const joystickRef = useRef<HTMLDivElement>(null);
    const centerRef = useRef<{ x: number, y: number } | null>(null);
    const touchIdRef = useRef<number | null>(null);

    // Reset position when interaction ends
    const handleEnd = useCallback(() => {
        setActive(false);
        setPosition({ x: 0, y: 0 });
        onMove({ x: 0, y: 0 });
        touchIdRef.current = null;
    }, [onMove]);

    const handleStart = (clientX: number, clientY: number, touchId: number | null) => {
        if (touchIdRef.current !== null) return; // Already active

        // Calculate center of joystick
        if (joystickRef.current) {
            const rect = joystickRef.current.getBoundingClientRect();
            centerRef.current = {
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2
            };

            touchIdRef.current = touchId;
            setActive(true);
            updatePosition(clientX, clientY);
        }
    };

    const updatePosition = (clientX: number, clientY: number) => {
        if (!centerRef.current) return;

        const maxRadius = size / 2;
        const dx = clientX - centerRef.current.x;
        const dy = clientY - centerRef.current.y;

        const distance = Math.sqrt(dx * dx + dy * dy);

        // Normalize movement vector
        let moveX = dx;
        let moveY = dy;

        // Clamp to radius
        if (distance > maxRadius) {
            const angle = Math.atan2(dy, dx);
            moveX = Math.cos(angle) * maxRadius;
            moveY = Math.sin(angle) * maxRadius;
        }

        setPosition({ x: moveX, y: moveY });

        // Calcluate normalized output vector (-1 to 1)
        // Add a small deadzone
        const deadzone = 10;
        if (distance < deadzone) {
            onMove({ x: 0, y: 0 });
        } else {
            // Scale based on distance from center for variable speed
            const speedFactor = Math.min(distance / maxRadius, 1);
            const normalizedX = (dx / distance) * speedFactor;
            const normalizedY = (dy / distance) * speedFactor;
            onMove({ x: normalizedX, y: normalizedY });
        }
    };

    // Event listeners for window to catch movement outside the element
    useEffect(() => {
        const onTouchMove = (e: TouchEvent) => {
            if (active && touchIdRef.current !== null) {
                // Find the touch that started this
                const touch = Array.from(e.changedTouches).find(t => t.identifier === touchIdRef.current);
                if (touch) {
                    updatePosition(touch.clientX, touch.clientY);
                }
            }
        };

        const onTouchEnd = (e: TouchEvent) => {
            if (active && touchIdRef.current !== null) {
                const touch = Array.from(e.changedTouches).find(t => t.identifier === touchIdRef.current);
                if (touch) {
                    handleEnd();
                }
            }
        };

        // Mouse fallbacks for testing on desktop
        const onMouseMove = (e: MouseEvent) => {
            if (active && touchIdRef.current === 999) { // 999 for mouse
                updatePosition(e.clientX, e.clientY);
            }
        };

        const onMouseUp = () => {
            if (active && touchIdRef.current === 999) {
                handleEnd();
            }
        };

        if (active) {
            window.addEventListener('touchmove', onTouchMove);
            window.addEventListener('touchend', onTouchEnd);
            window.addEventListener('touchcancel', onTouchEnd);
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
        }

        return () => {
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('touchend', onTouchEnd);
            window.removeEventListener('touchcancel', onTouchEnd);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }, [active, handleEnd]);

    const [isHolding, setIsHolding] = useState(false);
    const [holdProgress, setHoldProgress] = useState(0);
    const [showHoldHint, setShowHoldHint] = useState(false);
    const holdTimerRef = useRef<number | null>(null);
    const progressIntervalRef = useRef<number | null>(null);
    const hasTriggeredRef = useRef(false);

    const handleInteractStart = () => {
        setIsHolding(true);
        setHoldProgress(0);
        hasTriggeredRef.current = false;
        setShowHoldHint(false);

        const startTime = Date.now();
        const duration = 1000; // 1 second to hold

        progressIntervalRef.current = window.setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min((elapsed / duration) * 100, 100);
            setHoldProgress(progress);

            if (progress >= 100) {
                if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
                if (!hasTriggeredRef.current) {
                    onInteract();
                    hasTriggeredRef.current = true;
                    // Reset after success
                    setIsHolding(false);
                }
            }
        }, 16);
    };

    const handleInteractEnd = () => {
        setIsHolding(false);
        setHoldProgress(0);

        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
        }

        if (!hasTriggeredRef.current) {
            setShowHoldHint(true);
            setTimeout(() => setShowHoldHint(false), 2000);
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        };
    }, []);

    return (
        <div className="fixed bottom-8 left-8 z-[2000] flex items-end gap-8 pointer-events-auto select-none touch-none">
            {/* Joystick Area */}
            <div
                ref={joystickRef}
                className="relative bg-gray-900/50 rounded-full border-2 border-blue-400/30 backdrop-blur-sm"
                style={{ width: size, height: size }}
                onTouchStart={(e) => {
                    e.preventDefault(); // Prevent scrolling
                    handleStart(e.changedTouches[0].clientX, e.changedTouches[0].clientY, e.changedTouches[0].identifier);
                }}
                onMouseDown={(e) => {
                    handleStart(e.clientX, e.clientY, 999);
                }}
            >
                {/* Stick */}
                <div
                    className="absolute bg-gradient-to-br from-blue-400 to-blue-600 rounded-full shadow-lg transition-transform duration-75"
                    style={{
                        width: knobSize,
                        height: knobSize,
                        left: '50%',
                        top: '50%',
                        transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`
                    }}
                />
            </div>

            {/* Interact Button (Separate) */}
            <div className="relative">
                {/* Hold Hint Message */}
                {showHoldHint && (
                    <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-3 py-1 rounded whitespace-nowrap animate-bounce pointer-events-none">
                        Tap and hold to interact
                    </div>
                )}

                <button
                    className={`w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-700 rounded-full border-4 border-green-400/50 shadow-lg flex items-center justify-center transition-all touch-none select-none relative overflow-hidden ${isHolding ? 'scale-95' : 'active:scale-95'}`}
                    onPointerDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // Only left click or touch
                        if (e.pointerType === 'mouse' && e.button !== 0) return;
                        handleInteractStart();
                    }}
                    onPointerUp={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleInteractEnd();
                    }}
                    onPointerLeave={(e) => {
                        if (isHolding) handleInteractEnd();
                    }}
                    onContextMenu={(e) => e.preventDefault()}
                >
                    {/* Progress Ring Overlay */}
                    {isHolding && (
                        <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                            <circle
                                cx="50%" cy="50%" r="46%" // Just inside border
                                fill="none"
                                stroke="white"
                                strokeWidth="4"
                                strokeOpacity="0.5"
                                strokeDasharray="289" // 2 * pi * r approx 46% of 96px width... r approx 44px? 2*3.14*44 = 276. Let's approximate.
                                strokeDashoffset={289 - (289 * holdProgress) / 100}
                                strokeLinecap="round"
                            />
                        </svg>
                    )}

                    <div className="text-white font-bold text-sm text-center leading-tight relative z-10 pointer-events-none">
                        <span className="text-3xl block mb-1">🎯</span>
                        Interact
                    </div>
                </button>
            </div>
        </div>
    );
};

export default VirtualJoystick;
