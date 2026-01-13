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
            <button
                className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-700 rounded-full border-4 border-green-400/50 shadow-lg flex items-center justify-center active:scale-95 transition-transform"
                onTouchStart={(e) => {
                    e.preventDefault();
                    onInteract();
                }}
                onMouseDown={onInteract}
            >
                <div className="text-white font-bold text-sm text-center leading-tight">
                    <span className="text-2xl block mb-0">🎯</span>
                    Interact
                </div>
            </button>
        </div>
    );
};

export default VirtualJoystick;
