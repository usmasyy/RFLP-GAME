import React, { useState, useEffect, createContext, useContext } from 'react';
import { Settings, Volume2, VolumeX, Type, Eye, Zap, X, Smartphone, HelpCircle } from 'lucide-react';

// ============================================================================
// GAME SETTINGS TYPES AND CONTEXT
// ============================================================================

export interface GameSettings {
    musicVolume: number;
    sfxVolume: number;
    textSize: 'small' | 'medium' | 'large';
    colorblindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
    reduceMotion: boolean;
    showHints: boolean;
    highContrast: boolean;
}

const DEFAULT_SETTINGS: GameSettings = {
    musicVolume: 30,
    sfxVolume: 50,
    textSize: 'medium',
    colorblindMode: 'none',
    reduceMotion: false,
    showHints: true,
    highContrast: false,
};

interface SettingsContextType {
    settings: GameSettings;
    updateSettings: (settings: Partial<GameSettings>) => void;
    showSettingsModal: boolean;
    setShowSettingsModal: (show: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within SettingsProvider');
    }
    return context;
};

// ============================================================================
// SETTINGS PROVIDER
// ============================================================================

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<GameSettings>(() => {
        // Load from localStorage if available
        try {
            const saved = localStorage.getItem('rflp-settings');
            return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
        } catch {
            return DEFAULT_SETTINGS;
        }
    });
    const [showSettingsModal, setShowSettingsModal] = useState(false);

    const updateSettings = (newSettings: Partial<GameSettings>) => {
        setSettings(prev => {
            const updated = { ...prev, ...newSettings };
            localStorage.setItem('rflp-settings', JSON.stringify(updated));
            return updated;
        });
    };

    // Apply text size to document
    useEffect(() => {
        const root = document.documentElement;
        const sizes = { small: '14px', medium: '16px', large: '18px' };
        root.style.setProperty('--game-font-size', sizes[settings.textSize]);
    }, [settings.textSize]);

    // Apply colorblind filter
    useEffect(() => {
        const root = document.documentElement;
        const filters: Record<string, string> = {
            none: 'none',
            protanopia: 'url(#protanopia-filter)',
            deuteranopia: 'url(#deuteranopia-filter)',
            tritanopia: 'url(#tritanopia-filter)',
        };
        root.style.setProperty('--colorblind-filter', filters[settings.colorblindMode]);
    }, [settings.colorblindMode]);

    // Apply reduced motion
    useEffect(() => {
        const root = document.documentElement;
        if (settings.reduceMotion) {
            root.classList.add('reduce-motion');
        } else {
            root.classList.remove('reduce-motion');
        }
    }, [settings.reduceMotion]);

    return (
        <SettingsContext.Provider value={{ settings, updateSettings, showSettingsModal, setShowSettingsModal }}>
            {/* SVG Colorblind Filters */}
            <svg className="hidden">
                <defs>
                    <filter id="protanopia-filter">
                        <feColorMatrix type="matrix" values="
                            0.567, 0.433, 0,     0, 0
                            0.558, 0.442, 0,     0, 0
                            0,     0.242, 0.758, 0, 0
                            0,     0,     0,     1, 0
                        "/>
                    </filter>
                    <filter id="deuteranopia-filter">
                        <feColorMatrix type="matrix" values="
                            0.625, 0.375, 0,   0, 0
                            0.7,   0.3,   0,   0, 0
                            0,     0.3,   0.7, 0, 0
                            0,     0,     0,   1, 0
                        "/>
                    </filter>
                    <filter id="tritanopia-filter">
                        <feColorMatrix type="matrix" values="
                            0.95, 0.05,  0,     0, 0
                            0,    0.433, 0.567, 0, 0
                            0,    0.475, 0.525, 0, 0
                            0,    0,     0,     1, 0
                        "/>
                    </filter>
                </defs>
            </svg>
            {children}
        </SettingsContext.Provider>
    );
};

// ============================================================================
// SETTINGS MODAL COMPONENT
// ============================================================================

interface SettingsModalProps {
    onClose: () => void;
    audioRef?: React.RefObject<HTMLAudioElement>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, audioRef }) => {
    const { settings, updateSettings } = useSettings();

    const handleVolumeChange = (type: 'musicVolume' | 'sfxVolume', value: number) => {
        updateSettings({ [type]: value });
        if (type === 'musicVolume' && audioRef?.current) {
            audioRef.current.volume = value / 100;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[5000] backdrop-blur-sm">
            <div
                className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl border-2 border-blue-400 shadow-2xl shadow-blue-500/20 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
                style={{ fontSize: 'var(--game-font-size, 16px)' }}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <Settings className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Settings</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-gray-700 hover:bg-red-600 flex items-center justify-center transition-colors"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>
                </div>

                {/* Audio Section */}
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-blue-300 mb-3 flex items-center gap-2">
                        <Volume2 className="w-5 h-5" /> Audio
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between mb-1">
                                <label className="text-gray-300">Music Volume</label>
                                <span className="text-blue-400">{settings.musicVolume}%</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <VolumeX className="w-4 h-4 text-gray-500" />
                                <input
                                    type="range"
                                    min={0}
                                    max={100}
                                    value={settings.musicVolume}
                                    onChange={(e) => handleVolumeChange('musicVolume', Number(e.target.value))}
                                    className="flex-grow accent-blue-500 h-2 rounded-full"
                                />
                                <Volume2 className="w-4 h-4 text-blue-400" />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between mb-1">
                                <label className="text-gray-300">Sound Effects</label>
                                <span className="text-blue-400">{settings.sfxVolume}%</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <VolumeX className="w-4 h-4 text-gray-500" />
                                <input
                                    type="range"
                                    min={0}
                                    max={100}
                                    value={settings.sfxVolume}
                                    onChange={(e) => handleVolumeChange('sfxVolume', Number(e.target.value))}
                                    className="flex-grow accent-blue-500 h-2 rounded-full"
                                />
                                <Volume2 className="w-4 h-4 text-blue-400" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Display Section */}
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-purple-300 mb-3 flex items-center gap-2">
                        <Type className="w-5 h-5" /> Display
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="text-gray-300 block mb-2">Text Size</label>
                            <div className="grid grid-cols-3 gap-2">
                                {(['small', 'medium', 'large'] as const).map(size => (
                                    <button
                                        key={size}
                                        onClick={() => updateSettings({ textSize: size })}
                                        className={`py-2 px-4 rounded-lg font-medium transition-all capitalize ${settings.textSize === size
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                            }`}
                                        style={{
                                            fontSize: size === 'small' ? '12px' : size === 'medium' ? '14px' : '16px'
                                        }}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-gray-300 flex items-center gap-2 mb-2">
                                <Eye className="w-4 h-4" /> High Contrast
                            </label>
                            <button
                                onClick={() => updateSettings({ highContrast: !settings.highContrast })}
                                className={`w-14 h-7 rounded-full transition-all relative ${settings.highContrast ? 'bg-purple-600' : 'bg-gray-600'
                                    }`}
                            >
                                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${settings.highContrast ? 'left-8' : 'left-1'
                                    }`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Accessibility Section */}
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-green-300 mb-3 flex items-center gap-2">
                        <Eye className="w-5 h-5" /> Accessibility
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="text-gray-300 block mb-2">Colorblind Mode</label>
                            <select
                                value={settings.colorblindMode}
                                onChange={(e) => updateSettings({ colorblindMode: e.target.value as GameSettings['colorblindMode'] })}
                                className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none"
                            >
                                <option value="none">None</option>
                                <option value="protanopia">Protanopia (Red-blind)</option>
                                <option value="deuteranopia">Deuteranopia (Green-blind)</option>
                                <option value="tritanopia">Tritanopia (Blue-blind)</option>
                            </select>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="text-gray-300 flex items-center gap-2">
                                <Zap className="w-4 h-4" /> Reduce Motion
                            </label>
                            <button
                                onClick={() => updateSettings({ reduceMotion: !settings.reduceMotion })}
                                className={`w-14 h-7 rounded-full transition-all relative ${settings.reduceMotion ? 'bg-green-600' : 'bg-gray-600'
                                    }`}
                            >
                                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${settings.reduceMotion ? 'left-8' : 'left-1'
                                    }`} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="text-gray-300 flex items-center gap-2">
                                <HelpCircle className="w-4 h-4" /> Show Hints
                            </label>
                            <button
                                onClick={() => updateSettings({ showHints: !settings.showHints })}
                                className={`w-14 h-7 rounded-full transition-all relative ${settings.showHints ? 'bg-green-600' : 'bg-gray-600'
                                    }`}
                            >
                                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${settings.showHints ? 'left-8' : 'left-1'
                                    }`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Reset Button */}
                <button
                    onClick={() => updateSettings(DEFAULT_SETTINGS)}
                    className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg font-medium transition-colors"
                >
                    Reset to Defaults
                </button>
            </div>
        </div>
    );
};

// ============================================================================
// TOUCH CONTROLS COMPONENT
// ============================================================================

interface TouchControlsProps {
    onMove: (dx: number, dy: number) => void;
    onInteract: () => void;
    speed?: number;
}

export const TouchControls: React.FC<TouchControlsProps> = ({ onMove, onInteract, speed = 5 }) => {
    const [isVisible, setIsVisible] = useState(false);

    // Only show on touch devices
    useEffect(() => {
        const checkTouch = () => {
            setIsVisible('ontouchstart' in window || navigator.maxTouchPoints > 0);
        };
        checkTouch();
        window.addEventListener('resize', checkTouch);
        return () => window.removeEventListener('resize', checkTouch);
    }, []);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[2000] md:hidden">
            <div className="bg-gray-800/90 p-3 rounded-2xl border-2 border-blue-400/50 backdrop-blur-sm">
                <div className="grid grid-cols-3 gap-2">
                    <div />
                    <button
                        onTouchStart={() => onMove(0, -speed)}
                        className="w-14 h-14 bg-gradient-to-b from-blue-500 to-blue-700 rounded-xl flex items-center justify-center text-2xl active:scale-95 active:from-blue-600 active:to-blue-800 shadow-lg"
                    >
                        ⬆️
                    </button>
                    <div />

                    <button
                        onTouchStart={() => onMove(-speed, 0)}
                        className="w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-700 rounded-xl flex items-center justify-center text-2xl active:scale-95 shadow-lg"
                    >
                        ⬅️
                    </button>
                    <button
                        onTouchStart={onInteract}
                        className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-700 rounded-xl flex items-center justify-center text-xl font-bold active:scale-95 shadow-lg"
                    >
                        🎯
                    </button>
                    <button
                        onTouchStart={() => onMove(speed, 0)}
                        className="w-14 h-14 bg-gradient-to-l from-blue-500 to-blue-700 rounded-xl flex items-center justify-center text-2xl active:scale-95 shadow-lg"
                    >
                        ➡️
                    </button>

                    <div />
                    <button
                        onTouchStart={() => onMove(0, speed)}
                        className="w-14 h-14 bg-gradient-to-t from-blue-500 to-blue-700 rounded-xl flex items-center justify-center text-2xl active:scale-95 shadow-lg"
                    >
                        ⬇️
                    </button>
                    <div />
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// KEYBOARD HELP OVERLAY
// ============================================================================

interface KeyboardHelpProps {
    onClose: () => void;
}

export const KeyboardHelp: React.FC<KeyboardHelpProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[5000]">
            <div className="bg-gray-800 p-6 rounded-xl border-2 border-blue-400 max-w-sm mx-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-yellow-300">🎮 Controls</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="space-y-3 text-gray-300">
                    <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                            <kbd className="px-2 py-1 bg-gray-700 rounded text-sm">W</kbd>
                            <kbd className="px-2 py-1 bg-gray-700 rounded text-sm">A</kbd>
                            <kbd className="px-2 py-1 bg-gray-700 rounded text-sm">S</kbd>
                            <kbd className="px-2 py-1 bg-gray-700 rounded text-sm">D</kbd>
                        </div>
                        <span>or Arrow Keys - Move</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                            <kbd className="px-2 py-1 bg-gray-700 rounded text-sm">E</kbd>
                            <span className="text-gray-500">or</span>
                            <kbd className="px-3 py-1 bg-gray-700 rounded text-sm">Space</kbd>
                        </div>
                        <span>- Interact</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <kbd className="px-2 py-1 bg-gray-700 rounded text-sm">ESC</kbd>
                        <span>- Pause / Settings</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <kbd className="px-2 py-1 bg-gray-700 rounded text-sm">H</kbd>
                        <span>- Toggle this help</span>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-700">
                    <p className="text-gray-400 text-sm flex items-center gap-2">
                        <Smartphone className="w-4 h-4" />
                        On mobile? Use the on-screen controls.
                    </p>
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// RESPONSIVE LAYOUT HOOK
// ============================================================================

export interface ResponsiveConfig {
    width: number;
    height: number;
    scale: number;
    isMobile: boolean;
}

export const useResponsiveLayout = (baseWidth = 800, baseHeight = 600): ResponsiveConfig => {
    const [config, setConfig] = useState<ResponsiveConfig>({
        width: baseWidth,
        height: baseHeight,
        scale: 1,
        isMobile: false,
    });

    useEffect(() => {
        const updateSize = () => {
            const padding = 16; // Reduced padding
            const maxWidth = Math.min(window.innerWidth - padding, 2560); // Support 4k-ish, effectively full width
            const maxHeight = Math.min(window.innerHeight - 80, 1440); // Reduce bottom margin

            const scaleX = maxWidth / baseWidth;
            const scaleY = maxHeight / baseHeight;
            // Allow scaling up to 3x for large monitors, but ensure it fits
            const scale = Math.min(scaleX, scaleY, 3.0);

            setConfig({
                width: Math.round(baseWidth * scale),
                height: Math.round(baseHeight * scale),
                scale,
                isMobile: window.innerWidth < 768 || 'ontouchstart' in window,
            });
        };

        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, [baseWidth, baseHeight]);

    return config;
};

// ============================================================================
// SETTINGS BUTTON (for HUD)
// ============================================================================

interface SettingsButtonProps {
    onClick: () => void;
}

export const SettingsButton: React.FC<SettingsButtonProps> = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="w-10 h-10 bg-gray-800/80 hover:bg-gray-700 rounded-full flex items-center justify-center border-2 border-blue-400/50 transition-all hover:scale-110 hover:border-blue-400"
            title="Settings"
        >
            <Settings className="w-5 h-5 text-gray-300" />
        </button>
    );
};

// ============================================================================
// CSS UTILITIES (to be added to index.html or global CSS)
// ============================================================================

export const AccessibilityStyles = () => (
    <style>{`
        /* Reduced motion */
        .reduce-motion * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
        }
        
        /* High contrast mode */
        .high-contrast {
            filter: contrast(1.2);
        }
        
        /* Interactive object breathing animation */
        @keyframes breathe {
            0%, 100% { 
                transform: scale(1); 
                filter: brightness(1); 
            }
            50% { 
                transform: scale(1.03); 
                filter: brightness(1.15); 
            }
        }
        
        .interactive-breathe {
            animation: breathe 2s ease-in-out infinite;
        }
        
        /* Pulsing glow for nearby objects */
        @keyframes pulseGlow {
            0%, 100% { 
                box-shadow: 0 0 5px rgba(59, 130, 246, 0.5); 
            }
            50% { 
                box-shadow: 0 0 20px rgba(59, 130, 246, 0.8), 0 0 30px rgba(59, 130, 246, 0.4); 
            }
        }
        
        .nearby-glow {
            animation: pulseGlow 1s ease-in-out infinite;
        }
        
        /* Text sizes */
        :root {
            --game-font-size: 16px;
        }
        
        .game-text {
            font-size: var(--game-font-size);
        }
    `}</style>
);

export default {
    SettingsProvider,
    SettingsModal,
    TouchControls,
    KeyboardHelp,
    useSettings,
    useResponsiveLayout,
    SettingsButton,
    AccessibilityStyles,
};
