import React from 'react';
import { Station, Wall, Step, InventoryItem, Npc, Character, RoomId, RoomData, Door, Display, Decor } from './types';
import { EvidenceCollection, DnaExtraction, EnzymeSelection, DnaDigestion, GelPrep, GelLoading, Electrophoresis, UvImaging, Analysis, SouthernBlotting, ProbeHybridization, AutoradiographyAnalysis, ApplicationMinigame, InfoDisplay, StepsImageDisplay, ComparisonTable, AdvantagesDisplay, LimitationsDisplay, ReferencesDisplay, CompletionDisplay, GenomeMappingDisplay } from './components/minigames';
// Import new interactive mini-games for enhanced gameplay
// Import new interactive mini-games for enhanced gameplay
import { InteractiveDnaExtraction, InteractiveElectrophoresis, InteractiveSouthernBlotting, InteractiveProbeHybridization, InteractiveAutoradiography, InteractiveDnaDigestion } from './components/InteractiveMiniGames';
import { FileText, TestTube, Dna, Beaker, FlaskConical, Gavel, Scan, Layers, Sigma, Film, BookOpen } from 'lucide-react';

export const PLAYER_SIZE = 32;
export const PLAYER_SPEED = 5;
export const NPC_SPEED = 1;
export const INTERACTION_RADIUS = 30;

// Game World Dimensions
export const ROOM_CONFIG = {
    width: 800,
    height: 600,
};

export const PREDEFINED_CHARACTERS: Character[] = [
    { name: 'Usama', labCoatColor: 'bg-white', skinColor: 'bg-orange-300', hairColor: 'bg-gray-800', shirtColor: 'bg-blue-500', characterImage: '/assets/characters/usama.png' },
    { name: 'Armeela', labCoatColor: 'bg-white', skinColor: 'bg-yellow-200', hairColor: 'bg-yellow-900', shirtColor: 'bg-green-500', characterImage: '/assets/characters/armeela.png' },
    { name: 'Zia', labCoatColor: 'bg-white', skinColor: 'bg-amber-500', hairColor: 'bg-stone-700', shirtColor: 'bg-red-500', characterImage: '/assets/characters/zia.png' },
    { name: 'Aliyan', labCoatColor: 'bg-white', skinColor: 'bg-stone-400', hairColor: 'bg-gray-400', shirtColor: 'bg-gray-700', characterImage: '/assets/characters/aliyan.png' },
];

const BASE_WALLS: Wall[] = [
    { position: { x: 0, y: 0 }, size: { w: ROOM_CONFIG.width, h: 10 } }, // Top
    { position: { x: 0, y: ROOM_CONFIG.height - 10 }, size: { w: ROOM_CONFIG.width, h: 10 } }, // Bottom
    { position: { x: 0, y: 0 }, size: { w: 10, h: ROOM_CONFIG.height } }, // Left
    { position: { x: ROOM_CONFIG.width - 10, y: 0 }, size: { w: 10, h: ROOM_CONFIG.height } }, // Right
];

// STEPS for Methodology Room
export const STEPS: Step[] = [
    // Using new interactive mini-games with drag-and-drop and physics simulations
    { stationId: 'extraction', objective: 'Extract DNA from the sample.', description: 'Drag reagents in the correct order to lyse cells and purify DNA.', miniGame: InteractiveDnaExtraction, requiredItems: ['DNA Sample'], resultingItems: ['Extracted DNA'] },
    { stationId: 'digestion', objective: 'Digest DNA with a restriction enzyme.', description: 'Choose the correct enzyme and incubate it with the DNA to cut it into fragments.', miniGame: InteractiveDnaDigestion, requiredItems: ['Extracted DNA'], resultingItems: ['Restriction Enzyme', 'Digested DNA'] },
    { stationId: 'electrophoresis', objective: 'Run gel electrophoresis.', description: 'Load samples, control voltage, and watch DNA fragments separate by size.', miniGame: InteractiveElectrophoresis, requiredItems: ['Digested DNA'], resultingItems: ['Agarose Gel', 'Loaded Gel'] },
    { stationId: 'blotting', objective: 'Perform a Southern Blot.', description: 'Set up the blotting apparatus and transfer DNA from gel to membrane.', miniGame: InteractiveSouthernBlotting, requiredItems: ['Loaded Gel'], resultingItems: ['Blotting Membrane'] },
    { stationId: 'hybridization', objective: 'Perform Probe Hybridization.', description: 'Add a radioactive probe to bind to specific DNA sequences.', miniGame: InteractiveProbeHybridization, requiredItems: ['Blotting Membrane'], resultingItems: ['Probed Membrane'] },
    { stationId: 'detection', objective: 'Detect the DNA bands.', description: 'Use X-ray film to visualize the radioactive probe and reveal the DNA fingerprint.', miniGame: InteractiveAutoradiography, requiredItems: ['Probed Membrane'], resultingItems: ['Autoradiograph Film', 'Final Report'] },
];

export const ROOM_DATA: Record<RoomId, RoomData> = {
    INTRODUCTION: {
        id: 'INTRODUCTION',
        name: "Introduction & Principle",
        walls: [...BASE_WALLS],
        stations: [
            { id: 'sample-collection', type: 'station', name: 'Sample Collection', position: { x: 360, y: 250 }, size: { w: 80, h: 50 }, color: 'bg-blue-500', step: { stationId: 'sample-collection', objective: 'Collect sample', description: 'Collect the patient sample to begin RFLP analysis.', miniGame: EvidenceCollection, requiredItems: [], resultingItems: ['Case File', 'DNA Sample'] } }
        ],
        displays: [
            { id: 'poster-what-is-rflp', type: 'display', name: 'What is RFLP?', position: { x: 50, y: 150 }, size: { w: 100, h: 150 }, step: { stationId: 'poster-what-is-rflp', objective: 'Learn about RFLP', description: 'Restriction Fragment Length Polymorphism (RFLP) is a technique that exploits variations in homologous DNA sequences, known as polymorphisms, to distinguish individuals, populations, or species.', requiredItems: [], resultingItems: [] } },
            { id: 'poster-enzymes', type: 'display', name: 'Restriction Enzymes', position: { x: 650, y: 150 }, size: { w: 100, h: 150 }, step: { stationId: 'poster-enzymes', objective: 'Learn about Enzymes', description: 'Restriction enzymes are proteins that cut DNA at specific recognition sites. The resulting fragments can be separated by size, creating a unique "fingerprint" for a given DNA sample.', requiredItems: [], resultingItems: [] } }
        ],
        doors: [
            { id: 'intro-methodology', type: 'door', name: 'To Methodology', position: { x: 380, y: 10 }, size: { w: 60, h: 15 }, to: 'METHODOLOGY', targetDoorId: 'methodology-intro' }
        ],
        decor: [
            { id: 'intro-desk', type: 'desk', position: { x: 320, y: 480 }, size: { w: 160, h: 50 } },
            { id: 'intro-computer-1', type: 'computer', position: { x: 380, y: 465 }, size: { w: 40, h: 40 } },
            { id: 'intro-plant-1', type: 'plant', position: { x: 500, y: 520 }, size: { w: 30, h: 50 } },
            { id: 'intro-bench-1', type: 'lab-bench', position: { x: 20, y: 450 }, size: { w: 200, h: 40 } },
            { id: 'intro-bench-2', type: 'lab-bench', position: { x: 580, y: 450 }, size: { w: 200, h: 40 } },
            { id: 'intro-computer-2', type: 'computer', position: { x: 100, y: 435 }, size: { w: 40, h: 40 } },
            { id: 'intro-plant-2', type: 'plant', position: { x: 20, y: 520 }, size: { w: 30, h: 50 } },
            { id: 'intro-shelf-1', type: 'shelf', position: { x: 50, y: 80 }, size: { w: 100, h: 20 } },
            { id: 'intro-shelf-2', type: 'shelf', position: { x: 650, y: 80 }, size: { w: 100, h: 20 } },
        ]
    },
    METHODOLOGY: {
        id: 'METHODOLOGY',
        name: "Methodology / Steps",
        walls: [...BASE_WALLS],
        stations: [
            { id: 'extraction', type: 'station', name: 'DNA Extraction', position: { x: 30, y: 50 }, size: { w: 80, h: 50 }, color: 'bg-green-500', step: STEPS[0] },
            { id: 'digestion', type: 'station', name: 'Restriction Digestion', position: { x: 150, y: 180 }, size: { w: 80, h: 50 }, color: 'bg-red-500', step: STEPS[1] },
            { id: 'electrophoresis', type: 'station', name: 'Gel Electrophoresis', position: { x: 300, y: 50 }, size: { w: 100, h: 60 }, color: 'bg-indigo-500', step: STEPS[2] },
            { id: 'blotting', type: 'station', name: 'Southern Blotting', position: { x: 500, y: 180 }, size: { w: 80, h: 50 }, color: 'bg-yellow-500', step: STEPS[3] },
            { id: 'hybridization', type: 'station', name: 'Probe Hybridization', position: { x: 650, y: 150 }, size: { w: 80, h: 50 }, color: 'bg-purple-500', step: STEPS[4] },
            { id: 'detection', type: 'station', name: 'Autoradiography & Analysis', position: { x: 680, y: 450 }, size: { w: 80, h: 50 }, color: 'bg-pink-500', step: STEPS[5] },
        ],
        displays: [
            {
                id: 'method-steps',
                type: 'display',
                name: 'Protocol Steps',
                position: { x: 420, y: 50 },
                size: { w: 140, h: 100 },
                step: {
                    stationId: 'protocol-overview',
                    objective: 'View Protocol Overview',
                    description: 'Click to view the complete RFLP protocol workflow diagram showing all steps from DNA extraction to final analysis.',
                    miniGame: StepsImageDisplay,
                    miniGameProps: { src: '/assets/steps.jpg' },
                    requiredItems: [],
                    resultingItems: []
                }
            },
        ],
        doors: [
            { id: 'methodology-intro', type: 'door', name: 'To Introduction', position: { x: 380, y: 575 }, size: { w: 60, h: 15 }, to: 'INTRODUCTION', targetDoorId: 'intro-methodology' },
            { id: 'methodology-apps', type: 'door', name: 'To Applications', position: { x: 10, y: 280 }, size: { w: 15, h: 60 }, to: 'APPLICATIONS', targetDoorId: 'apps-methodology' }
        ]
    },
    APPLICATIONS: {
        id: 'APPLICATIONS',
        name: 'Applications',
        walls: [...BASE_WALLS],
        displays: [
            // Fix: Changed minigame definition to avoid JSX and fix parsing errors.
            { id: 'app-forensics', type: 'display', name: 'Forensic Science', position: { x: 50, y: 50 }, size: { w: 120, h: 80 }, step: { stationId: 'app-forensics', objective: 'Solve a case.', description: 'RFLP is used to create DNA fingerprints. Match the crime scene sample to the correct suspect.', miniGame: ApplicationMinigame, miniGameProps: { type: "Forensics" }, requiredItems: [], resultingItems: [] } },
            // Fix: Changed minigame definition to avoid JSX and fix parsing errors.
            { id: 'app-paternity', type: 'display', name: 'Paternity Testing', position: { x: 630, y: 150 }, size: { w: 120, h: 80 }, step: { stationId: 'app-paternity', objective: 'Determine paternity.', description: 'A child inherits DNA from both parents. Compare the child\'s DNA bands to the potential fathers to find the match.', miniGame: ApplicationMinigame, miniGameProps: { type: "Paternity" }, requiredItems: [], resultingItems: [] } },
            // Fix: Changed minigame definition to avoid JSX and fix parsing errors.
            { id: 'app-diseases', type: 'display', name: 'Genetic Diseases', position: { x: 50, y: 350 }, size: { w: 120, h: 80 }, step: { stationId: 'app-diseases', objective: 'Diagnose a disease.', description: 'Certain genetic diseases alter DNA, creating unique RFLP patterns. Identify the patient carrying the disease allele.', miniGame: ApplicationMinigame, miniGameProps: { type: "Disease" }, requiredItems: [], resultingItems: [] } },
            { id: 'app-mapping', type: 'display', name: 'Genome Mapping', position: { x: 630, y: 350 }, size: { w: 120, h: 80 }, step: { stationId: 'app-mapping', objective: 'Learn about Genome Mapping.', description: 'Explore how RFLP was used to create the first genetic maps.', miniGame: GenomeMappingDisplay, requiredItems: [], resultingItems: [] } },
        ],
        doors: [
            { id: 'apps-methodology', type: 'door', name: 'To Methodology', position: { x: 775, y: 280 }, size: { w: 15, h: 60 }, to: 'METHODOLOGY', targetDoorId: 'methodology-apps' },
            { id: 'apps-limitations', type: 'door', name: 'To Limitations', position: { x: 380, y: 10 }, size: { w: 60, h: 15 }, to: 'LIMITATIONS', targetDoorId: 'limitations-apps' }
        ]
    },
    LIMITATIONS: {
        id: 'LIMITATIONS',
        name: 'Advantages, Limitations & References',
        walls: [...BASE_WALLS],
        displays: [
            { id: 'adv-board', type: 'display', name: 'Advantages', position: { x: 50, y: 100 }, size: { w: 150, h: 100 }, step: { stationId: 'adv-board', objective: 'Learn Advantages', description: '', miniGame: AdvantagesDisplay, requiredItems: [], resultingItems: [] } },
            { id: 'lim-board', type: 'display', name: 'Limitations', position: { x: 600, y: 140 }, size: { w: 150, h: 100 }, step: { stationId: 'lim-board', objective: 'Learn Limitations', description: '', miniGame: LimitationsDisplay, requiredItems: [], resultingItems: [] } },
            { id: 'pcr-compare', type: 'display', name: 'RFLP vs PCR', position: { x: 280, y: 50 }, size: { w: 150, h: 100 }, step: { stationId: 'pcr-compare', objective: 'Compare with PCR', description: '', miniGame: ComparisonTable, requiredItems: [], resultingItems: [] } },
            { id: 'references', type: 'display', name: 'References', position: { x: 50, y: 360 }, size: { w: 150, h: 100 }, step: { stationId: 'references', objective: 'View References', description: '', miniGame: ReferencesDisplay, requiredItems: [], resultingItems: [] } },
            { id: 'completion', type: 'display', name: 'Complete Training', position: { x: 300, y: 430 }, size: { w: 200, h: 80 }, step: { stationId: 'completion', objective: 'Complete Training', description: '', miniGame: CompletionDisplay, requiredItems: [], resultingItems: [] } },
        ],
        doors: [
            { id: 'limitations-apps', type: 'door', name: 'To Applications', position: { x: 380, y: 575 }, size: { w: 60, h: 15 }, to: 'APPLICATIONS', targetDoorId: 'apps-limitations' }
        ]
    }
};

export const DOOR_POSITIONS = {
    INTRODUCTION: { 'intro-methodology': { x: 390, y: 40 } },
    METHODOLOGY: { 'methodology-intro': { x: 390, y: 530 }, 'methodology-apps': { x: 40, y: 290 } },
    APPLICATIONS: { 'apps-methodology': { x: 730, y: 290 }, 'apps-limitations': { x: 390, y: 40 } },
    LIMITATIONS: { 'limitations-apps': { x: 390, y: 530 } }
};


export const INITIAL_NPCS: Npc[] = [
    { id: 1, position: { x: 300, y: 300 }, character: PREDEFINED_CHARACTERS[1], state: 'working', targetPosition: { x: 150, y: 150 }, workTimer: 100 },
    { id: 2, position: { x: 500, y: 100 }, character: PREDEFINED_CHARACTERS[2], state: 'walking', targetPosition: { x: 650, y: 450 }, workTimer: 0 },
];

export const INVENTORY_ICONS: Record<InventoryItem, React.ElementType> = {
    'Case File': FileText,
    'DNA Sample': TestTube,
    'Extracted DNA': Dna,
    'Restriction Enzyme': Beaker,
    'Digested DNA': Sigma,
    'Agarose Gel': FlaskConical,
    'Loaded Gel': FlaskConical,
    'Blotting Membrane': Layers,
    'Probed Membrane': Layers,
    'Autoradiograph Film': Film,
    'Final Report': Gavel
};

// Deprecated, use ROOM_DATA instead
export const LAB_WALLS: Wall[] = [];
export const STATIONS: Station[] = [];