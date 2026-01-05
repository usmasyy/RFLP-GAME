import React, { useMemo } from 'react';
import { PLAYER_SIZE } from '../constants';

interface ScientistCharacterProps {
    x: number;
    y: number;
    direction?: 'idle' | 'walking' | 'running';
    movementDirection?: 'up' | 'down' | 'left' | 'right' | 'idle';
    kickDirection?: 'up' | 'down' | 'left' | 'right';
    isKicking?: boolean;
    animationFrame?: number;
    // Customization props
    isFemale?: boolean;
    customSkinColor?: string;
    customHairColor?: string;
    customShirtColor?: string;
}

const ScientistCharacter: React.FC<ScientistCharacterProps> = ({
    x,
    y,
    direction = 'idle',
    movementDirection = 'idle',
    kickDirection = 'down',
    isKicking = false,
    animationFrame = 0,
    isFemale = false,
    customSkinColor,
    customHairColor,
    customShirtColor,
}) => {
    // -------------------------------------------------------------------------
    // Animation Logic
    // -------------------------------------------------------------------------

    // Normalize progress 0..1 per cycle
    const cycleSpeed = direction === 'running' ? 0.3 : 0.15;
    const rawProgress = animationFrame * cycleSpeed;
    const progress = rawProgress % 1;

    // Sine waves for limb movement
    // Arm/Leg swing: -1 to 1 range
    const swingBase = Math.sin(rawProgress * Math.PI * 2);
    const swingCos = Math.cos(rawProgress * Math.PI * 2);

    // Amplitudes
    const legAmp = direction === 'running' ? 8 : direction === 'walking' ? 4 : 0;
    const armAmp = direction === 'running' ? 9 : direction === 'walking' ? 5 : 0;
    const bobAmp = direction === 'running' ? 2 : direction === 'walking' ? 1.5 : 0.5;

    // Head bob calculation (absolute sine for bounce)
    const headBobY = Math.abs(Math.sin(rawProgress * Math.PI * 2)) * bobAmp;

    // Determine actual facing direction for rendering
    // Priority: Kick direction > Movement direction > Default 'down' (Front)
    // If ideling, we keep the last movement direction logic or default to front if completely fresh.
    // However, the props passed usually have 'idle' movementDirection when stopped.
    // We need state retention for "last faced direction" in parent, 
    // BUT since we don't have that easily here without modifying parent, we will:
    // Infer facing from 'movementDirection' (if active) OR 'kickDirection' (if kicking).
    // If idle and not kicking, we default to 'down' (Front) for now, or use a heuristic.
    // NOTE: The parent `GameWorld` already calculates `playerMovementDir` based on velocity. 
    // When idle, it sets it to 'idle'. 
    // To solve the "face last direction" issue, GameWorld passes `playerMovementDir` which resets to idle.
    // ideally GameWorld should pass `facingDirection`. 
    // Checks GameWorld source... `movementDirection` is passed.
    // We will assume `kickDirection` acts as the "LAST FACING DIRECTION" when idle, 
    // because `kickDirection` in `GameWorld` (actually `player.kickDirection`) is updated on movement logic typically?
    // Let's check GameWorld usage.
    // GameWorld: `kickDirection={player.kickDirection}`. 
    // `kickDirection` is updated in `handleInteraction` to face the object.

    // Let's rely on `kickDirection` as the primary "facing" source if movement is idle, 
    // because standard Top-Down RPG logic usually updates a "facing" variable even when stopped.
    // If movementDirection is NOT idle, it definitely dictates facing.

    let facing: 'up' | 'down' | 'left' | 'right' = 'down';
    if (movementDirection && movementDirection !== 'idle') {
        facing = movementDirection as 'up' | 'down' | 'left' | 'right';
    } else if (kickDirection) {
        facing = kickDirection as 'up' | 'down' | 'left' | 'right';
    }

    // -------------------------------------------------------------------------
    // Drawing Constants
    // -------------------------------------------------------------------------

    const skinColor = customSkinColor || "#E0AC69";
    const skinShadow = customSkinColor ? adjustColor(customSkinColor, -20) : "#C08C49";
    const hairColor = customHairColor || "#3D2B1F";
    const coatColor = "#F5F5F5";
    const coatShadow = "#D0D0D0";
    const pantColor = "#2E3B4E"; // Dark blue-ish pants for contrast
    const shoeColor = "#4A3B2A";
    const shirtColor = customShirtColor || "#4A90E2"; // Blue shirt under coat

    // Helper to adjust color brightness
    function adjustColor(color: string, amount: number): string {
        const hex = color.replace('#', '');
        const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
        const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
        const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    // -------------------------------------------------------------------------
    // Render Functions
    // -------------------------------------------------------------------------

    const renderLegs = () => {
        // Legs pivot from hips roughly at y=22
        // We simulate "Mario-like" running by swinging legs from hip point
        // Left Leg: positive swing, Right Leg: negative swing (opposite)

        const leftLegRot = swingBase * legAmp * (facing === 'left' ? -1 : 1);
        const rightLegRot = swayOpposite(leftLegRot);

        // Pivot points for legs (approximated for 32x32 grid inside 48x48 box)
        // Center x=16, Hips y=22

        if (facing === 'down') {
            // Front view: Legs don't swing much sideways, mostly bob or slight shuffle
            return (
                <g>
                    <rect x="11.5" y="22" width="4" height="6" fill={pantColor} />
                    <rect x="16.5" y="22" width="4" height="6" fill={pantColor} />
                    {/* Shoes */}
                    <path d="M11,28 h5 v2 a2,2 0 0,1 -2,2 h-1 a2,2 0 0,1 -2,-2 Z" fill={shoeColor} />
                    <path d="M16,28 h5 v2 a2,2 0 0,1 -2,2 h-1 a2,2 0 0,1 -2,-2 Z" fill={shoeColor} />
                </g>
            );
        }

        if (facing === 'up') {
            // Back view similar to front
            return (
                <g>
                    <rect x="11.5" y="22" width="4" height="6" fill={pantColor} />
                    <rect x="16.5" y="22" width="4" height="6" fill={pantColor} />
                    {/* Shoes (Heels) */}
                    <rect x="11.5" y="28" width="4" height="3" fill={shoeColor} />
                    <rect x="16.5" y="28" width="4" height="3" fill={shoeColor} />
                </g>
            );
        }

        if (facing === 'right' || facing === 'left') {
            // Side view: Scissor kick!
            // When facing Right:
            // Right Leg simulates "Near" leg, Left Leg simulates "Far" leg? 
            // In 2D side view, usually one leg occludes the other or they are slightly offset.

            // Far leg (Left when facing right)
            return (
                <g>
                    {/* Far Leg */}
                    <g transform={`rotate(${-leftLegRot} 16 22)`}>
                        <rect x="14" y="22" width="4" height="6" fill={pantColor} filter="brightness(0.8)" />
                        <path d="M14,28 h5 v2 a1,1 0 0,1 -1,1 h-4 Z" fill={shoeColor} filter="brightness(0.8)" />
                    </g>
                    {/* Near Leg */}
                    <g transform={`rotate(${leftLegRot} 16 22)`}>
                        <rect x="14" y="22" width="4" height="6" fill={pantColor} />
                        <path d="M14,28 h5 v2 a1,1 0 0,1 -1,1 h-4 Z" fill={shoeColor} />
                    </g>
                </g>
            );
        }
    };

    const renderArms = () => {
        // Arms Pivot roughly shoulder height y=14
        const rot = swingBase * armAmp; // Arm swing matches leg stride usually opposite

        if (facing === 'down') {
            return (
                <g>
                    {/* Left Arm */}
                    <g transform={`rotate(${rot} 10 14)`}>
                        <rect x="8" y="14" width="3.5" height="9" rx="1.5" fill={coatColor} stroke={coatShadow} strokeWidth="0.5" />
                        <circle cx="9.75" cy="23.5" r="2" fill={skinColor} />
                    </g>
                    {/* Right Arm */}
                    <g transform={`rotate(${-rot} 22 14)`}>
                        <rect x="20.5" y="14" width="3.5" height="9" rx="1.5" fill={coatColor} stroke={coatShadow} strokeWidth="0.5" />
                        <circle cx="22.25" cy="23.5" r="2" fill={skinColor} />
                    </g>
                </g>
            );
        }

        if (facing === 'up') {
            return (
                <g>
                    {/* Left Arm */}
                    <g transform={`rotate(${-rot} 10 14)`}>
                        <rect x="8" y="14" width="3.5" height="9" rx="1.5" fill={coatColor} stroke={coatShadow} strokeWidth="0.5" />
                        <circle cx="9.75" cy="23.5" r="2" fill={skinColor} />
                    </g>
                    {/* Right Arm */}
                    <g transform={`rotate(${rot} 22 14)`}>
                        <rect x="20.5" y="14" width="3.5" height="9" rx="1.5" fill={coatColor} stroke={coatShadow} strokeWidth="0.5" />
                        <circle cx="22.25" cy="23.5" r="2" fill={skinColor} />
                    </g>
                </g>
            );
        }

        if (facing === 'right' || facing === 'left') {
            // Side View Arms
            // Far Arm
            return (
                <g>
                    <g transform={`rotate(${-rot} 16 14)`}>
                        <rect x="14.5" y="14" width="3.5" height="8" rx="1.5" fill={coatColor} stroke={coatShadow} strokeWidth="0.5" filter="brightness(0.9)" />
                        <circle cx="16.25" cy="22.5" r="2" fill={skinColor} filter="brightness(0.9)" />
                    </g>
                </g>
            );
        }
    };

    // Front Arm for side view needs to be rendered on top of body (Late Render)
    const renderFrontArmSide = () => {
        const rot = swingBase * armAmp;
        return (
            <g transform={`rotate(${rot} 16 14)`}>
                <rect x="14.5" y="14" width="3.5" height="8" rx="1.5" fill={coatColor} stroke={coatShadow} strokeWidth="0.5" />
                <circle cx="16.25" cy="22.5" r="2" fill={skinColor} />
            </g>
        );
    };

    const renderBody = () => {
        // Body Box
        const bodyBounce = direction !== 'idle' ? headBobY * 0.5 : 0;
        const yPos = 13 + bodyBounce;

        if (facing === 'down') {
            return (
                <g transform={`translate(0, ${bodyBounce})`}>
                    {/* Torso */}
                    <rect x="11" y="13" width="10" height="10" rx="1" fill={coatColor} />
                    {/* Open Coat / Shirt */}
                    <path d="M14,13 L15,23 H17 L18,13 Z" fill={shirtColor} />
                    {/* Coat Lapels */}
                    <path d="M14,13 L15,18 L11,18 Z" fill={coatShadow} opacity="0.3" />
                    <path d="M18,13 L17,18 L21,18 Z" fill={coatShadow} opacity="0.3" />
                    {/* Buttons */}
                    <circle cx="13" cy="16" r="0.5" fill="#888" />
                    <circle cx="19" cy="16" r="0.5" fill="#888" />
                </g>
            );
        }

        if (facing === 'up') {
            return (
                <g transform={`translate(0, ${bodyBounce})`}>
                    <rect x="11" y="13" width="10" height="10" rx="1" fill={coatColor} />
                    {/* Coat Seam */}
                    <line x1="16" y1="13" x2="16" y2="23" stroke={coatShadow} strokeWidth="1" />
                </g>
            );
        }

        if (facing === 'right' || facing === 'left') {
            return (
                <g transform={`translate(0, ${bodyBounce})`}>
                    <rect x="13" y="13" width="6" height="10" rx="1" fill={coatColor} />
                    {/* Side detail */}
                    <rect x="14" y="15" width="4" height="6" fill={coatShadow} opacity="0.1" rx="0.5" />
                </g>
            );
        }
    };

    // Head component needs to vary significantly by direction
    const renderHead = () => {
        const yPos = 5 + headBobY;

        if (facing === 'down') {
            // Front Face
            return (
                <g transform={`translate(0, ${headBobY})`}>
                    {/* Head Shape */}
                    <rect x="10" y="5" width="12" height="10" rx="3" fill={skinColor} />

                    {isFemale ? (
                        <>
                            {/* Female Hair - Longer with side bangs */}
                            <path d="M8,8 Q8,3 16,3 Q24,3 24,8 V10 H23 V9 Q23,5 16,5 Q9,5 9,9 V10 H8 Z" fill={hairColor} />
                            {/* Side hair flowing down */}
                            <path d="M8,8 Q7,12 8,15 L10,15 L10,9 Z" fill={hairColor} />
                            <path d="M24,8 Q25,12 24,15 L22,15 L22,9 Z" fill={hairColor} />
                            {/* Bangs */}
                            <path d="M10,7 Q12,9 15,7 L15,6 Q12,5 10,6 Z" fill={hairColor} />
                            {/* Eyes with eyelashes */}
                            <ellipse cx="13" cy="9.5" rx="1.2" ry="1" fill="#000" />
                            <ellipse cx="19" cy="9.5" rx="1.2" ry="1" fill="#000" />
                            <path d="M11.5,8.5 L13,9 L14.5,8.5" stroke="#000" strokeWidth="0.5" fill="none" />
                            <path d="M17.5,8.5 L19,9 L20.5,8.5" stroke="#000" strokeWidth="0.5" fill="none" />
                            {/* Blush */}
                            <ellipse cx="11" cy="11" rx="1.5" ry="0.8" fill="#FFCCCC" opacity="0.5" />
                            <ellipse cx="21" cy="11" rx="1.5" ry="0.8" fill="#FFCCCC" opacity="0.5" />
                        </>
                    ) : (
                        <>
                            {/* Male Hair Top */}
                            <path d="M9,8 Q9,4 16,4 Q23,4 23,8 V9 H9 Z" fill={hairColor} />
                            {/* Glasses */}
                            <g transform="translate(0, 0.5)">
                                <rect x="11" y="8" width="4" height="3" rx="1" fill="rgba(255,255,255,0.3)" stroke="#333" strokeWidth="0.8" />
                                <rect x="17" y="8" width="4" height="3" rx="1" fill="rgba(255,255,255,0.3)" stroke="#333" strokeWidth="0.8" />
                                <line x1="15" y1="9.5" x2="17" y2="9.5" stroke="#333" strokeWidth="0.8" />
                            </g>
                            {/* Eyes */}
                            <circle cx="13" cy="9.5" r="1" fill="#000" />
                            <circle cx="19" cy="9.5" r="1" fill="#000" />
                        </>
                    )}

                    {/* Mouth */}
                    <path d="M14.5,12 Q16,13 17.5,12" fill="none" stroke="#A67B5B" strokeWidth="1" strokeLinecap="round" />
                </g>
            );
        }

        if (facing === 'up') {
            // Back Head
            return (
                <g transform={`translate(0, ${headBobY})`}>
                    {/* Head Shape */}
                    <rect x="10" y="5" width="12" height="10" rx="3" fill={skinColor} />
                    {/* Full Hair Back */}
                    <path d="M9,11 Q9,4 16,4 Q23,4 23,11 V13 H9 Z" fill={hairColor} />
                </g>
            );
        }

        if (facing === 'right' || facing === 'left') {
            // Side Head
            return (
                <g transform={`translate(0, ${headBobY})`}>
                    {/* Head Shape */}
                    <rect x="11" y="5" width="10" height="10" rx="3" fill={skinColor} />
                    {/* Hair Side */}
                    <path d="M10,10 Q10,4 16,4 Q21,4 21,7 V9 L19,9 L19,6 Q16,5 12,6 V11 H10 Z" fill={hairColor} />
                    <path d="M10,6 L15,6 L15,11 L10,11 Z" fill={hairColor} /> {/* Back of head hair */}

                    {/* Glasses Side */}
                    <rect x="17" y="8" width="4" height="3" rx="0.5" fill="rgba(255,255,255,0.3)" stroke="#333" strokeWidth="0.8" />
                    <line x1="17" y1="9" x2="14" y2="9" stroke="#333" strokeWidth="0.8" />

                    {/* Eye Side */}
                    <circle cx="19" cy="9.5" r="1" fill="#000" />

                    {/* Nose */}
                    <path d="M21,10 L22.5,11 L21,12 Z" fill={skinColor} />
                </g>
            );
        }
    };

    // Helper for opposite swing
    const swayOpposite = (val: number) => -val;

    // Viewport transform
    // We are fitting a 32x32 character design into a PLAYER_SIZExPLAYER_SIZE box, centered.
    // Scale is PLAYER_SIZE / 32

    // Scale flip for left facing
    const transformScaleX = facing === 'left' ? -1 : 1;
    const transformOrigin = facing === 'left' ? '16px 16px' : 'center'; // Flip around center of 32x32 grid

    return (
        <svg
            width={PLAYER_SIZE}
            height={PLAYER_SIZE}
            viewBox="0 0 32 32"
            style={{
                position: 'absolute',
                left: `${x - PLAYER_SIZE / 2}px`, // Adjust centering offset to 0 if x is center
                top: `${y - PLAYER_SIZE / 2}px`,
                imageRendering: 'pixelated', // Keep crisp edges
                overflow: 'visible',
            }}
        >
            <g style={{ transform: `scaleX(${transformScaleX})`, transformOrigin: '16px 16px' }}>
                {/* Shadow */}
                <ellipse cx="16" cy="29" rx="6" ry="2" fill="rgba(0,0,0,0.3)" />

                {/* Layer Order: Back Arm (Side) -> Back Leg (Side) -> Body -> Front Leg (Side) -> Head -> Front Arm (Side) */}

                {(facing === 'right' || facing === 'left') ? (
                    <>
                        {/* No specific Back Arm for side view separate from logic above, reusing renderArms but order matters */}
                        {/* Actually renderArms returns both arms for Front/Back, but for Side we need split */}

                        {/* Legs */}
                        {renderLegs()}

                        {/* Arms (Far/Back arm logic handled inside renderArms for side view) */}
                        {renderArms()}

                        {/* Body */}
                        {renderBody()}

                        {/* Head */}
                        {renderHead()}

                        {/* Front Arm (Side Only - late render) */}
                        {renderFrontArmSide()}
                    </>
                ) : (
                    <>
                        {/* Front/Back Views */}
                        {/* Legs */}
                        {renderLegs()}

                        {/* Body */}
                        {renderBody()}

                        {/* Arms (Both rendered together) */}
                        {renderArms()}

                        {/* Head */}
                        {renderHead()}
                    </>
                )}

                {/* Kick Overlay */}
                {isKicking && (
                    <g>
                        {/* Simple visual cue for kick/interaction */}
                        <circle cx="28" cy="22" r="3" fill="none" stroke="#FFF" strokeWidth="2" opacity="0.8">
                            <animate attributeName="r" from="1" to="6" dur="0.4s" begin="0s" repeatCount="1" />
                            <animate attributeName="opacity" from="0.8" to="0" dur="0.4s" begin="0s" repeatCount="1" />
                        </circle>
                    </g>
                )}
            </g>
        </svg>
    );
};

export default ScientistCharacter;
