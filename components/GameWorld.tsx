import React from 'react';
// Fix: Added 'Display' to the import list to resolve type error.
import { Player, Station, Wall, Npc, RoomData, InteractiveObject, Display, Door, Decor } from '../types';
import { PLAYER_SIZE } from '../constants';


// --- Pixel Art Station Components ---

const SampleCollectionStation = () => (
    <div className="w-full h-full bg-[#a1662f] border-2 border-[#603813] rounded-sm relative p-1 box-border flex justify-center items-center shadow-inner">
        <div className="w-1/4 h-3/4 bg-red-200 border border-red-400 rounded-t-full rounded-b-md mx-1 shadow-md"></div>
        <div className="w-1/4 h-3/4 bg-blue-200 border border-blue-400 rounded-t-full rounded-b-md mx-1 shadow-md"></div>
    </div>
);

const DnaExtractionUnit = () => (
    <div className="w-full h-full bg-gray-300 border-2 border-gray-500 rounded-md p-1 box-border flex flex-col items-center justify-around shadow-lg">
        <div className="w-3/4 h-1/4 bg-gray-800 rounded-t-md border-b-2 border-gray-500 flex items-center justify-center shadow-inner"><div className="w-1/2 h-1/2 bg-cyan-300 rounded-full opacity-50 animate-pulse"></div></div>
        <div className="w-full flex justify-around"><div className="w-3 h-3 bg-red-500 rounded-full border border-black"></div><div className="w-3 h-3 bg-green-500 rounded-full border border-black"></div></div>
    </div>
);

const DnaDigestionStation = () => (
    <div className="w-full h-full bg-gray-400 border-2 border-gray-600 rounded-sm p-1 box-border flex items-center justify-around shadow-lg">
        <div className="w-3 h-5 bg-red-500 rounded-sm border border-black shadow-sm"></div>
        <div className="w-3 h-5 bg-blue-500 rounded-sm border border-black shadow-sm"></div>
        <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center shadow-inner"><div className="w-4 h-4 bg-gray-500 rounded-full"></div></div>
    </div>
);

const ElectrophoresisTank = () => (
    <div className="w-full h-full bg-gray-800 border-2 border-black rounded-sm p-1 box-border relative shadow-lg">
        <div className="w-[90%] h-[80%] bg-blue-300/30 m-auto border border-blue-200 relative shadow-inner"><div className="absolute top-0 left-0 w-2 h-full bg-gray-600"></div><div className="absolute top-0 right-0 w-2 h-full bg-gray-600"></div><div className="w-2 h-2 rounded-full bg-red-500 absolute top-1/2 -translate-y-1/2 -right-3"></div><div className="w-2 h-2 rounded-full bg-black absolute top-1/2 -translate-y-1/2 -left-3"></div></div>
    </div>
);

const SouthernBlottingStation = () => (
    <div className="w-full h-full bg-gray-200 border-2 border-gray-400 rounded-sm p-1 box-border flex flex-col items-center justify-center shadow-lg">
        <div className="w-3/4 h-1 bg-gray-500"></div>
        <div className="w-3/4 h-2 bg-yellow-200 my-0.5 border border-gray-300"></div>
        <div className="w-3/4 h-2 bg-blue-300 my-0.5 border border-gray-400"></div>
        <div className="w-3/4 h-2 bg-yellow-200 my-0.5 border border-gray-300"></div>
        <div className="w-3/4 h-1 bg-gray-500"></div>
    </div>
);

const ProbeHybridizationOven = () => (
     <div className="w-full h-full bg-gray-700 border-2 border-gray-900 rounded-md p-1 box-border flex flex-col justify-between items-center shadow-lg">
        <div className="w-3/4 h-1/2 bg-black/50 rounded-sm border-2 border-gray-500 flex items-center justify-center shadow-inner"><div className="w-4 h-2 bg-orange-500 animate-pulse"></div></div>
        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
    </div>
);

const AutoradiographyStation = () => (
    <div className="w-full h-full bg-black border-2 border-gray-700 rounded-sm p-1 box-border flex flex-col items-center justify-center shadow-lg">
        <div className="w-3/4 h-3/5 bg-gray-800 border border-gray-600 shadow-inner"></div>
        <div className="w-1/2 h-1/5 bg-red-900 mt-1 flex items-center justify-center text-white text-[8px] font-bold">DEVELOPING</div>
    </div>
);

const PosterDisplay = ({ name }: { name: string }) => (
    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-200 border-2 border-blue-300 rounded-lg p-2 shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
        <div className="flex items-center justify-center mb-2">
            <svg className="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            <p className="text-center font-bold text-sm text-gray-800">{name}</p>
        </div>
        <div className="space-y-2 px-1">
            <div className="w-full h-1 bg-blue-400 rounded-full animate-pulse"></div>
            <div className="w-3/4 h-1 bg-indigo-400 rounded-full ml-auto animate-pulse delay-100"></div>
            <div className="w-full h-1 bg-blue-400 rounded-full animate-pulse delay-200"></div>
        </div>
    </div>
);

const ApplicationDisplay = ({name}: {name: string}) => (
    <div className="w-full h-full bg-gray-900 border-2 border-blue-400 rounded-lg p-1 text-white shadow-lg">
        <p className="text-center font-bold text-xs border-b border-blue-400">{name}</p>
        <div className="flex justify-around items-center h-full">
            <div className="w-2 h-10 bg-green-500 rounded-full"></div>
            <div className="w-2 h-10 bg-yellow-500 rounded-full"></div>
            <div className="w-2 h-10 bg-pink-500 rounded-full"></div>
        </div>
    </div>
);

const InfoBoard = ({name}: {name: string}) => (
     <div className="w-full h-full bg-green-800 border-2 border-green-400 rounded-lg p-1 text-white shadow-md">
         <p className="text-center font-bold text-xs">{name}</p>
    </div>
);

// Advantages Button - Modern gradient card with icon
const AdvantagesButton = () => (
    <div className="w-full h-full bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 border-4 border-green-300 rounded-2xl p-3 shadow-2xl hover:shadow-green-500/50 transform hover:scale-105 transition-all duration-300 relative overflow-hidden group">
        {/* Animated background glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
        
        {/* Icon */}
        <div className="absolute top-2 right-2 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
            </svg>
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full">
            <div className="text-4xl mb-2 animate-bounce-slow">✓</div>
            <p className="text-center font-bold text-sm text-white drop-shadow-lg">Advantages</p>
            <p className="text-center text-xs text-green-100 mt-1">Key Benefits</p>
        </div>
        
        {/* Corner decoration */}
        <div className="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-white/30 rounded-bl-2xl"></div>
    </div>
);

// Limitations Button - Modern gradient card with warning icon
const LimitationsButton = () => (
    <div className="w-full h-full bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 border-4 border-orange-300 rounded-2xl p-3 shadow-2xl hover:shadow-orange-500/50 transform hover:scale-105 transition-all duration-300 relative overflow-hidden group">
        {/* Animated background glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
        
        {/* Icon */}
        <div className="absolute top-2 right-2 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm animate-pulse">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full">
            <div className="text-4xl mb-2">⚠️</div>
            <p className="text-center font-bold text-sm text-white drop-shadow-lg">Limitations</p>
            <p className="text-center text-xs text-orange-100 mt-1">Constraints</p>
        </div>
        
        {/* Corner decoration */}
        <div className="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-white/30 rounded-bl-2xl"></div>
    </div>
);

// RFLP vs PCR Button - Modern comparison card
const ComparisonButton = () => (
    <div className="w-full h-full bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600 border-4 border-cyan-300 rounded-2xl p-3 shadow-2xl hover:shadow-cyan-500/50 transform hover:scale-105 transition-all duration-300 relative overflow-hidden group">
        {/* Animated background glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
        
        {/* Icon */}
        <div className="absolute top-2 right-2 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full">
            <div className="text-3xl mb-2 font-bold text-white">VS</div>
            <p className="text-center font-bold text-sm text-white drop-shadow-lg">RFLP vs PCR</p>
            <p className="text-center text-xs text-cyan-100 mt-1">Comparison</p>
        </div>
        
        {/* Corner decoration */}
        <div className="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-white/30 rounded-bl-2xl"></div>
    </div>
);

// References Button - Modern academic card
const ReferencesButton = () => (
    <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-600 border-4 border-indigo-300 rounded-2xl p-3 shadow-2xl hover:shadow-indigo-500/50 transform hover:scale-105 transition-all duration-300 relative overflow-hidden group">
        {/* Animated background glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
        
        {/* Icon */}
        <div className="absolute top-2 right-2 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
            </svg>
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full">
            <div className="text-4xl mb-2">📚</div>
            <p className="text-center font-bold text-sm text-white drop-shadow-lg">References</p>
            <p className="text-center text-xs text-indigo-100 mt-1">Citations</p>
        </div>
        
        {/* Corner decoration */}
        <div className="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-white/30 rounded-bl-2xl"></div>
    </div>
);

// Complete Training Button - Celebratory completion card
const CompletionButton = () => (
    <div className="w-full h-full bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 border-4 border-yellow-300 rounded-2xl p-2 shadow-2xl hover:shadow-yellow-500/50 transform hover:scale-110 transition-all duration-300 relative overflow-hidden group animate-pulse">
        {/* Animated background glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
        
        {/* Sparkle effects */}
        <div className="absolute top-1 left-1 w-2 h-2 bg-white rounded-full animate-ping"></div>
        <div className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
        
        {/* Icon */}
        <div className="absolute top-1 right-1 w-6 h-6 bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full">
            <div className="text-3xl mb-1 animate-bounce-slow">🏆</div>
            <p className="text-center font-bold text-xs text-white drop-shadow-lg">Complete Training</p>
        </div>
        
        {/* Bottom glow */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent"></div>
    </div>
);

// --- New Decor Components ---
const Desk = () => <div className="w-full h-full bg-[#a1662f] border-2 border-t-4 border-[#603813] rounded-sm shadow-md"></div>;
const Plant = () => (
    <div className="w-full h-full flex flex-col items-center">
        <div className="w-2/3 h-2/3 bg-green-600 rounded-full">
            <div className="w-1/2 h-1/2 bg-green-500 rounded-full relative -top-2 -left-2"></div>
        </div>
        <div className="w-1/2 h-1/3 bg-orange-800 border-x-2 border-orange-900"></div>
    </div>
);
const Computer = () => (
    <div className="w-full h-full flex flex-col items-center">
        <div className="w-full h-3/4 bg-gray-800 border-2 border-gray-900 rounded-t-md p-0.5"><div className="w-full h-full bg-blue-800 animate-pulse"></div></div>
        <div className="w-1/4 h-1/4 bg-gray-600"></div>
    </div>
);
const LabBench = () => <div className="w-full h-full bg-gray-300 border-2 border-gray-400 shadow-md"></div>;
const Shelf = () => (
    <div className="w-full h-full bg-[#a1662f] border-y-2 border-b-4 border-[#603813] flex items-center justify-around px-1">
        <div className="w-2 h-4 bg-blue-300 rounded-sm border border-blue-500"></div>
        <div className="w-2 h-3 bg-red-300 rounded-sm border border-red-500"></div>
        <div className="w-3 h-2 bg-green-300 rounded-sm border border-green-500"></div>
    </div>
);


// --- New Universal Components ---

const DecorComponent: React.FC<{decor: Decor}> = ({decor}) => {
    switch(decor.type) {
        case 'desk': return <Desk />;
        case 'plant': return <Plant />;
        case 'computer': return <Computer />;
        case 'lab-bench': return <LabBench />;
        case 'shelf': return <Shelf />;
        default: return <div className="w-full h-full bg-gray-500" />;
    }
};

const StationComponent: React.FC<{ station: Station }> = ({ station }) => {
    let content;
    switch (station.id) {
        case 'sample-collection': content = <SampleCollectionStation />; break;
        case 'extraction': content = <DnaExtractionUnit />; break;
        case 'digestion': content = <DnaDigestionStation />; break;
        case 'electrophoresis': content = <ElectrophoresisTank />; break;
        case 'blotting': content = <SouthernBlottingStation />; break;
        case 'hybridization': content = <ProbeHybridizationOven />; break;
        case 'detection': content = <AutoradiographyStation />; break;
        default: content = <div className={`w-full h-full ${station.color}`} />;
    }

    return (
        <div className="group w-full h-full relative">
            {content}
            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-max bg-black/60 text-white text-[10px] rounded-sm py-0.5 px-2 pointer-events-none whitespace-nowrap">
                {station.name}
            </div>
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-max bg-black text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                {station.name}
            </div>
        </div>
    );
};

const DisplayComponent: React.FC<{display: Display}> = ({display}) => {
    let content;
    switch (display.id) {
        case 'poster-what-is-rflp':
        case 'poster-enzymes':
             content = <PosterDisplay name={display.name} />; break;
        case 'app-forensics':
        case 'app-paternity':
        case 'app-diseases':
        case 'app-mapping':
            content = <ApplicationDisplay name={display.name} />; break;
        case 'adv-board':
            content = <AdvantagesButton />; break;
        case 'lim-board':
            content = <LimitationsButton />; break;
        case 'pcr-compare':
            content = <ComparisonButton />; break;
        case 'references':
            content = <ReferencesButton />; break;
        case 'completion':
            content = <CompletionButton />; break;
        default:
             content = <InfoBoard name={display.name} />;
    }
     return (
        <div className="group w-full h-full relative">
            {content}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-max bg-black text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                {display.name}
            </div>
        </div>
    );
}

const DoorComponent: React.FC<{door: Door, isNearby: boolean}> = ({ door, isNearby }) => {
    const isVertical = door.size.h > door.size.w;
    return (
        <div className={`w-full h-full bg-gray-600 border-2 border-gray-800 flex items-center justify-center relative overflow-hidden transition-all duration-300 ${isNearby ? 'door-interactive-glow' : 'shadow-inner'}`}>
             <div className={`absolute bg-gray-900 ${isVertical ? 'w-full h-1/2' : 'h-full w-1/2'} transition-transform duration-300 ${isNearby ? (isVertical ? '-translate-y-1/4' : '-translate-x-1/4') : ''}`} style={{[isVertical ? 'top' : 'left']: 0}}></div>
             <div className={`absolute bg-gray-900 ${isVertical ? 'w-full h-1/2' : 'h-full w-1/2'} transition-transform duration-300 ${isNearby ? (isVertical ? 'translate-y-1/4' : 'translate-x-1/4') : ''}`} style={{[isVertical ? 'bottom' : 'right']: 0}}></div>
             <div className={`absolute w-4 h-4 rounded-full ${isNearby ? 'bg-green-400 animate-pulse' : 'bg-red-500'}`}></div>
        </div>
    );
};


// --- Character Head Component ---
const CharacterHead: React.FC<{ character: Character }> = ({ character }) => {
    if (character.headImage) {
        return (
            <img
                src={character.headImage}
                alt={character.name}
                className="absolute w-3/5 h-3/5 top-0 left-1/2 -translate-x-1/2 rounded-full border-2 border-gray-600 object-cover"
            />
        );
    }
    
    return (
        <div className={`absolute w-3/5 h-3/5 ${character.skinColor} rounded-full top-0 left-1/2 -translate-x-1/2 border-2 border-gray-600 overflow-hidden`}>
            {/* Hair */}
            <div className={`absolute w-full h-1/2 ${character.hairColor} top-0`}></div>
            {/* Glasses */}
            {character.accessory === 'glasses' && (
                <div className="absolute w-full h-1 bg-black top-1/2 -translate-y-1/2"></div>
            )}
        </div>
    );
};

// --- Main GameWorld Component ---

interface GameWorldProps {
    player: Player;
    roomData: RoomData;
    npcs: Npc[];
    nearbyInteractiveId: string | null | undefined;
    onOpenDisplay?: (display: Display) => void;
}

const GameWorld: React.FC<GameWorldProps> = ({ player, roomData, npcs, nearbyInteractiveId, onOpenDisplay }) => {
    const renderObject = (obj: InteractiveObject) => {
        let component;
        if (obj.type === 'station') component = <StationComponent station={obj} />;
        if (obj.type === 'display') component = <DisplayComponent display={obj} />;
        if (obj.type === 'door') component = <DoorComponent door={obj} isNearby={nearbyInteractiveId === obj.id} />;

        return (
            <div
                key={obj.id}
                className={`absolute transition-all duration-300 cursor-pointer`}
                style={{ left: obj.position.x, top: obj.position.y, width: obj.size.w, height: obj.size.h, zIndex: Math.round(obj.position.y) }}
                onClick={() => {
                    // allow clicking displays to open them even if not using keyboard
                    if (obj.type === 'display' && typeof onOpenDisplay === 'function') {
                        onOpenDisplay(obj);
                    }
                }}
            >
                {component}
            </div>
        );
    }
    
    const renderDecor = (decor: Decor) => (
         <div key={decor.id} className="absolute" style={{ left: decor.position.x, top: decor.position.y, width: decor.size.w, height: decor.size.h, zIndex: Math.round(decor.position.y) }}>
            <DecorComponent decor={decor} />
        </div>
    );

    return (
        <div className="w-full h-full bg-[#b0bec5] overflow-hidden relative">
            {/* Floor Tiles */}
            <div className="absolute inset-0 w-full h-full bg-[linear-gradient(to_right,#90a4ae_1px,transparent_1px),linear-gradient(to_bottom,#90a4ae_1px,transparent_1px)] bg-[size:40px_40px]"></div>
            
            <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 text-lg rounded-md font-bold z-20 border border-gray-500">{roomData.name}</div>

            {/* Walls */}
            {roomData.walls.map((wall, index) => (
                <div key={`wall-${index}`} className="absolute bg-blue-200 border border-blue-400" style={{ left: wall.position.x, top: wall.position.y, width: wall.size.w, height: wall.size.h, zIndex: wall.position.y + wall.size.h }} />
            ))}
            
            {/* Decor */}
            {(roomData.decor || []).map(renderDecor)}

            {/* Interactive Objects */}
            {[...(roomData.stations || []), ...(roomData.doors || []), ...(roomData.displays || [])].map(renderObject)}


             {/* NPCs */}
            {npcs.map(npc => (
                <div key={`npc-${npc.id}`} className="absolute animate-breathing" style={{ left: npc.position.x, top: npc.position.y, width: PLAYER_SIZE, height: PLAYER_SIZE, transition: 'left 0.05s linear, top 0.05s linear', zIndex: Math.round(npc.position.y) }}>
                    <div className="absolute w-4/5 h-2/5 bg-black/20 rounded-full bottom-0 left-1/2 -translate-x-1/2"></div>
                    <div className={`absolute w-full h-4/5 ${npc.character.labCoatColor} rounded-lg bottom-0 border-2 border-gray-600 overflow-hidden`}>
                        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1/4 ${npc.character.shirtColor} rounded-b-md`}></div>
                        <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-1 bg-black/10"></div>
                         {npc.character.accessory === 'clipboard' && <div className="absolute w-1/2 h-1/2 bg-amber-200 border border-black top-1/4 left-0"></div>}
                    </div>
                    <CharacterHead character={npc.character} />
                </div>
            ))}
            
             {/* Player */}
            <div className="absolute transition-all duration-100 ease-linear animate-breathing" style={{ left: player.position.x, top: player.position.y, width: PLAYER_SIZE, height: PLAYER_SIZE, zIndex: Math.round(player.position.y) + 1 }}>
                <div className="absolute w-4/5 h-2/5 bg-black/20 rounded-full bottom-0 left-1/2 -translate-x-1/2"></div>
                <div className={`absolute w-full h-4/5 ${player.character.labCoatColor} rounded-lg bottom-0 border-2 border-gray-600 overflow-hidden`}>
                    <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1/4 ${player.character.shirtColor} rounded-b-md`}></div>
                    <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-1 bg-black/10"></div>
                </div>
                <CharacterHead character={player.character} />
                
                {/* Kick Animation Leg */}
                {player.isKicking && (
                    <div 
                        className={`absolute w-2 h-4 bg-gray-700 rounded-sm transition-all duration-300 animate-kick-leg`}
                        style={{
                            bottom: player.kickDirection === 'down' ? '-8px' : player.kickDirection === 'up' ? '20px' : '8px',
                            left: player.kickDirection === 'left' ? '-8px' : player.kickDirection === 'right' ? '28px' : '15px',
                            transform: player.kickDirection === 'down' ? 'rotate(20deg)' : 
                                      player.kickDirection === 'up' ? 'rotate(-20deg)' : 
                                      player.kickDirection === 'left' ? 'rotate(-70deg)' : 
                                      'rotate(70deg)',
                            transformOrigin: 'top center'
                        }}
                    >
                        {/* Foot */}
                        <div className="absolute bottom-0 w-3 h-2 bg-gray-900 rounded-sm" style={{
                            left: player.kickDirection === 'left' || player.kickDirection === 'right' ? '-0.5px' : '-2px'
                        }}></div>
                    </div>
                )}
                
                {/* Kick Impact Effect */}
                {player.isKicking && (
                    <div 
                        className="absolute animate-ping"
                        style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(255, 255, 255, 0.6)',
                            top: player.kickDirection === 'down' ? '32px' : player.kickDirection === 'up' ? '-8px' : '16px',
                            left: player.kickDirection === 'left' ? '-8px' : player.kickDirection === 'right' ? '32px' : '16px',
                        }}
                    ></div>
                )}
            </div>

            {nearbyInteractiveId && (
                <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg text-lg animate-pulse z-20">
                    Press [E] to interact
                </div>
            )}
        </div>
    );
};

export default GameWorld;