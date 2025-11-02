import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { GameState, Player, Character, Station, Step, InventoryItem, Position, Npc, RoomId, InteractiveObject, Door } from './types';
import { STATIONS, LAB_WALLS, PLAYER_SIZE, PLAYER_SPEED, NPC_SPEED, INTERACTION_RADIUS, STEPS, INVENTORY_ICONS, INITIAL_NPCS, PREDEFINED_CHARACTERS, ROOM_DATA, ROOM_CONFIG, DOOR_POSITIONS } from './constants';
import GameWorld from './components/GameWorld';
import Hud from './components/Hud';
import InteractionModal from './components/InteractionModal';
import CharacterCustomization from './components/CharacterCustomization';
import GameComplete from './components/GameComplete';
import IntroAnimation from './components/IntroAnimation';

const App: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>(GameState.CHARACTER_CREATION);
    const [player, setPlayer] = useState<Player>({
        position: { x: 400, y: 540 },
        character: PREDEFINED_CHARACTERS[0],
    });
    const [npcs, setNpcs] = useState<Npc[]>(INITIAL_NPCS);
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [interactingWith, setInteractingWith] = useState<InteractiveObject | null>(null);
    const [notification, setNotification] = useState<string | null>(null);
    const notificationTimer = useRef<number | null>(null);
    const [currentRoom, setCurrentRoom] = useState<RoomId>('INTRODUCTION');
    const [unlockedRooms, setUnlockedRooms] = useState<RoomId[]>(['INTRODUCTION']);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio('/background-music.mp3'); // Placeholder path
            audioRef.current.loop = true;
        }

        const shouldPlay = gameState === GameState.PLAYING || gameState === GameState.INTERACTING;

        if (shouldPlay) {
            audioRef.current.play().catch(error => console.error("Audio play failed:", error));
        } else {
            audioRef.current.pause();
        }
    }, [gameState]);

    const roomData = useMemo(() => ROOM_DATA[currentRoom], [currentRoom]);
    const currentStep = useMemo((): Step | null => {
        // For displays, always use their own step
        if (interactingWith?.type === 'display') {
            return interactingWith.step;
        }
        // For stations in methodology room, make sure we're using the correct step for each station
        if (currentRoom === 'METHODOLOGY' && interactingWith?.type === 'station') {
            // Find the step that matches this station's ID
            const matchingStep = STEPS.find(step => step.stationId === interactingWith.id);
            if (!matchingStep) return null;
            
            // Only allow interaction if this is the current step in the sequence
            if (STEPS.indexOf(matchingStep) === currentStepIndex) {
                return matchingStep;
            }
            return null;
        }
        // For other cases (non-methodology room stations)
        if (interactingWith?.type === 'station') {
            return interactingWith.step;
        }
        return null;
    }, [currentStepIndex, currentRoom, interactingWith]);

    const showNotification = useCallback((message: string, duration = 3000) => {
        if (notificationTimer.current) {
            clearTimeout(notificationTimer.current);
        }
        setNotification(message);
        notificationTimer.current = window.setTimeout(() => {
            setNotification(null);
            notificationTimer.current = null;
        }, duration);
    }, []);

    const handleStartGame = (character: Character) => {
        setPlayer(prev => ({ ...prev, character }));
        setGameState(GameState.INTRO_ANIMATION);
    };
    
    const handleIntroComplete = () => {
        setGameState(GameState.PLAYING);
    };

    const isColliding = useCallback((pos: Position) => {
        const playerRect = {
            left: pos.x,
            top: pos.y,
            right: pos.x + PLAYER_SIZE,
            bottom: pos.y + PLAYER_SIZE
        };

        const obstacles = [...(roomData.walls || []), ...(roomData.stations || []), ...(roomData.displays || []), ...(roomData.decor || [])];

        for (const obstacle of obstacles) {
            const obstacleRect = {
                left: obstacle.position.x,
                top: obstacle.position.y,
                right: obstacle.position.x + obstacle.size.w,
                bottom: obstacle.position.y + obstacle.size.h
            };
            if (
                playerRect.right > obstacleRect.left &&
                playerRect.left < obstacleRect.right &&
                playerRect.bottom > obstacleRect.top &&
                playerRect.top < obstacleRect.bottom
            ) {
                return true;
            }
        }
        return false;
    }, [roomData]);

    const movePlayer = useCallback((dx: number, dy: number) => {
        if (gameState !== GameState.PLAYING) return;
        setPlayer(prev => {
            const newPos = { x: prev.position.x + dx, y: prev.position.y + dy };
            if (!isColliding(newPos)) {
                return { ...prev, position: newPos };
            }
            return prev;
        });
    }, [gameState, isColliding]);

    useEffect(() => {
        const gameLoop = setInterval(() => {
            if (gameState !== GameState.PLAYING || currentRoom !== 'METHODOLOGY') return;

            setNpcs(currentNpcs => currentNpcs.map(npc => {
                let newNpc = { ...npc, position: { ...npc.position }, targetPosition: { ...npc.targetPosition } };
                const roomStations = ROOM_DATA['METHODOLOGY'].stations || [];
                if (roomStations.length === 0) return newNpc;

                if (newNpc.state === 'working') {
                    newNpc.workTimer -= 1;
                    if (newNpc.workTimer <= 0) {
                        newNpc.state = 'walking';
                        const newTargetStation = roomStations[Math.floor(Math.random() * roomStations.length)];
                        newNpc.targetPosition = {
                            x: newTargetStation.position.x + newTargetStation.size.w / 2 - PLAYER_SIZE / 2,
                            y: newTargetStation.position.y + newTargetStation.size.h + 5,
                        };
                    }
                } else if (newNpc.state === 'walking') {
                    const dx = newNpc.targetPosition.x - newNpc.position.x;
                    const dy = newNpc.targetPosition.y - newNpc.position.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < NPC_SPEED) {
                        newNpc.position = newNpc.targetPosition;
                        newNpc.state = 'working';
                        newNpc.workTimer = Math.random() * 200 + 150; // Pause for a bit longer
                    } else {
                        newNpc.position.x += (dx / distance) * NPC_SPEED;
                        newNpc.position.y += (dy / distance) * NPC_SPEED;
                    }
                }

                return newNpc;
            }));
        }, 50);

        return () => clearInterval(gameLoop);
    }, [gameState, currentRoom]);

    const nearbyInteractiveObject = useMemo((): InteractiveObject | null => {
        const playerInteractionZone = {
            left: player.position.x - INTERACTION_RADIUS,
            top: player.position.y - INTERACTION_RADIUS,
            right: player.position.x + PLAYER_SIZE + INTERACTION_RADIUS,
            bottom: player.position.y + PLAYER_SIZE + INTERACTION_RADIUS,
        };

        const interactives: InteractiveObject[] = [...(roomData.stations || []), ...(roomData.doors || []), ...(roomData.displays || [])];

        for (const obj of interactives) {
            const objRect = {
                left: obj.position.x,
                top: obj.position.y,
                right: obj.position.x + obj.size.w,
                bottom: obj.position.y + obj.size.h,
            };

            if (
                playerInteractionZone.right > objRect.left &&
                playerInteractionZone.left < objRect.right &&
                playerInteractionZone.bottom > objRect.top &&
                playerInteractionZone.top < objRect.bottom
            ) {
                return obj;
            }
        }
        return null;
    }, [player.position, roomData]);

    const handleInteraction = useCallback(() => {
        if (gameState !== GameState.PLAYING || !nearbyInteractiveObject) return;
        
        if (nearbyInteractiveObject.type === 'door') {
            if (unlockedRooms.includes(nearbyInteractiveObject.to)) {
                const targetDoorPosition = DOOR_POSITIONS[nearbyInteractiveObject.to][nearbyInteractiveObject.targetDoorId];
                if (targetDoorPosition) {
                    setPlayer(p => ({ ...p, position: { x: targetDoorPosition.x, y: targetDoorPosition.y } }));
                    setCurrentRoom(nearbyInteractiveObject.to);
                } else {
                    console.error(`Could not find target door position for door ${nearbyInteractiveObject.targetDoorId} in room ${nearbyInteractiveObject.to}`);
                    showNotification("A door seems to be stuck. Please try again later.");
                }
            } else {
                showNotification("Complete current objectives to unlock this room.");
            }
            return;
        }

        if (nearbyInteractiveObject.type === 'station' || nearbyInteractiveObject.type === 'display') {
             const step = nearbyInteractiveObject.step;
             if (!step) return;

             // Special logic for methodology room stations
             if(currentRoom === 'METHODOLOGY' && nearbyInteractiveObject.type === 'station') {
                const stationIndex = STEPS.findIndex(s => s.stationId === nearbyInteractiveObject.id);
                if (stationIndex === -1) return;

                // If trying to interact with a station out of sequence
                if (stationIndex !== currentStepIndex) {
                    if (stationIndex < currentStepIndex) {
                        showNotification("You've already completed this step.");
                    } else {
                        const correctStation = roomData.stations?.find(s => s.id === STEPS[currentStepIndex].stationId);
                        showNotification(`You need to go to the ${correctStation ? correctStation.name : 'correct station'} first.`);
                    }
                    return;
                }
             }

            const hasRequiredItems = step.requiredItems.every(reqItem => inventory.includes(reqItem));
            if (hasRequiredItems) {
                setInteractingWith(nearbyInteractiveObject);
                setGameState(GameState.INTERACTING);
            } else {
                const missingItems = step.requiredItems.filter(item => !inventory.includes(item));
                showNotification(`Missing required items: ${missingItems.join(', ')}`);
            }
        }
    }, [gameState, nearbyInteractiveObject, currentStep, inventory, showNotification, unlockedRooms, currentRoom, roomData]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (gameState !== GameState.PLAYING) return;
            switch (e.key) {
                case 'w': case 'ArrowUp': movePlayer(0, -PLAYER_SPEED); break;
                case 's': case 'ArrowDown': movePlayer(0, PLAYER_SPEED); break;
                case 'a': case 'ArrowLeft': movePlayer(-PLAYER_SPEED, 0); break;
                case 'd': case 'ArrowRight': movePlayer(PLAYER_SPEED, 0); break;
                case 'e': case ' ': e.preventDefault(); handleInteraction(); break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [movePlayer, handleInteraction, gameState]);

    const handleTaskComplete = () => {
        if (!currentStep) return;
        setInventory(prev => {
            const newInventory = [...prev];
            currentStep.resultingItems.forEach(item => {
                if (!newInventory.includes(item)) newInventory.push(item);
            });
            return newInventory;
        });

        setInteractingWith(null);

        if (currentRoom === 'METHODOLOGY') {
            if (currentStepIndex < STEPS.length - 1) {
                setCurrentStepIndex(prev => prev + 1);
            } else {
                setUnlockedRooms(prev => [...new Set([...prev, 'APPLICATIONS'])]);
                showNotification("Methodology complete! 'Applications' room unlocked.", 5000);
            }
        } else if (currentRoom === 'INTRODUCTION') {
             setUnlockedRooms(prev => [...new Set([...prev, 'METHODOLOGY'])]);
             showNotification("Sample collected! 'Methodology' room unlocked.", 5000);
        } else if (currentRoom === 'APPLICATIONS') {
             // Logic to check if all applications are viewed
             // For now, just unlock next room after one interaction
             setUnlockedRooms(prev => [...new Set([...prev, 'LIMITATIONS'])]);
             showNotification("'Limitations & References' room unlocked.", 5000);
        } else if (currentRoom === 'LIMITATIONS' && interactingWith?.id === 'completion') {
            setGameState(GameState.GAME_COMPLETE);
        }

        setGameState(GameState.PLAYING);
    };
    
    const getObjective = () => {
        if (currentRoom === 'INTRODUCTION') return "Collect a patient sample from the collection station.";
        if (currentRoom === 'METHODOLOGY') {
            if (currentStepIndex < STEPS.length) {
                return STEPS[currentStepIndex].objective;
            } 
            return "Methodology complete! Proceed to the next room.";
        }
        if (currentRoom === 'APPLICATIONS') return "Explore the real-world applications of RFLP.";
        if (currentRoom === 'LIMITATIONS') return "Learn about the pros and cons of RFLP and finish your training.";
        return "Explore the lab.";
    }

    const handleRestart = () => {
        if (notificationTimer.current) clearTimeout(notificationTimer.current);
        setNotification(null);
        setGameState(GameState.CHARACTER_CREATION);
        setPlayer(p => ({...p, character: PREDEFINED_CHARACTERS[0], position: { x: 400, y: 540 }}));
        setNpcs(INITIAL_NPCS);
        setInventory([]);
        setCurrentStepIndex(0);
        setInteractingWith(null);
        setCurrentRoom('INTRODUCTION');
        setUnlockedRooms(['INTRODUCTION']);
    }

    return (
        <div className="w-screen h-screen flex justify-center items-center font-mono select-none overflow-hidden bg-gray-900" onClick={() => {if(audioRef.current && audioRef.current.paused) audioRef.current.play().catch(e => console.error(e))}}>
            {gameState === GameState.CHARACTER_CREATION && <CharacterCustomization onStart={handleStartGame} />}
            
            {gameState === GameState.INTRO_ANIMATION && <IntroAnimation onComplete={handleIntroComplete} character={player.character} />}

            {(gameState === GameState.PLAYING || gameState === GameState.INTERACTING) && (
                 <div className="relative" style={{width: ROOM_CONFIG.width, height: ROOM_CONFIG.height}}>
                  <div className="absolute inset-0 bg-gray-700 border-4 border-blue-400 shadow-lg shadow-blue-500/50 rounded-lg overflow-hidden" style={{boxShadow: 'inset 0 0 100px rgba(0,0,0,0.3)'}}>
                    <GameWorld 
                        player={player} 
                        roomData={roomData}
                        npcs={currentRoom === 'METHODOLOGY' ? npcs : []}
                        nearbyInteractiveId={nearbyInteractiveObject?.id} 
                        onOpenDisplay={(display) => {
                            // Open display modal when clicked
                            setInteractingWith(display as InteractiveObject);
                            setGameState(GameState.INTERACTING);
                        }}
                    />
                    <Hud 
                        objective={getObjective()}
                        inventory={inventory} 
                        inventoryIcons={INVENTORY_ICONS}
                        currentRoom={currentRoom}
                        unlockedRooms={unlockedRooms}
                    />
                     {notification && (
                        <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-red-800 bg-opacity-90 text-white px-4 py-2 rounded-lg text-base border-2 border-red-400 shadow-lg animate-fade-in-up z-[2000] pointer-events-none">
                            {notification}
                        </div>
                    )}
                  </div>
                   {interactingWith && currentStep && (
                        <InteractionModal
                            interactiveObject={interactingWith}
                            step={currentStep}
                            onClose={() => {
                                setInteractingWith(null);
                                setGameState(GameState.PLAYING);
                            }}
                            onComplete={handleTaskComplete}
                        />
                    )}
                </div>
            )}
            
            {gameState === GameState.GAME_COMPLETE && <GameComplete onRestart={handleRestart}/>}
        </div>
    );
};

export default App;
