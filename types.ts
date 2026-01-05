import React from 'react';

export enum GameState {
    CHARACTER_CREATION,
    INTRO_ANIMATION,
    PLAYING,
    INTERACTING,
    GAME_COMPLETE,
}

export type Position = {
    x: number;
    y: number;
};

export type Size = {
    w: number;
    h: number;
};

export type Character = {
    name: string;
    labCoatColor: string;
    skinColor: string;
    hairColor: string;
    shirtColor: string;
    accessory?: 'glasses' | 'clipboard';
    headImage?: string;
    characterImage?: string;
};

export type Player = {
    position: Position;
    character: Character;
    isKicking?: boolean;
    kickDirection?: 'up' | 'down' | 'left' | 'right';
};

export type Npc = {
    id: number;
    position: Position;
    character: Character;
    state: 'walking' | 'working' | 'idle';
    targetPosition: Position;
    workTimer: number; // Ticks until next action
    // New fields for interactive dialogue
    dialogue?: string[];
    role?: string;
    roomId?: RoomId;
    isInteractable?: boolean;
    isFemale?: boolean;
};

export interface BaseInteractive {
    id: string;
    name: string;
    position: Position;
    size: Size;
}

export interface Station extends BaseInteractive {
    type: 'station';
    color: string;
    step: Step;
}

export interface Door extends BaseInteractive {
    type: 'door';
    to: RoomId;
    targetDoorId: string;
}

export interface Display extends BaseInteractive {
    type: 'display';
    step: Step;
}

export type InteractiveObject = Station | Door | Display;

export interface Decor {
    id: string;
    type: 'desk' | 'plant' | 'computer' | 'lab-bench' | 'shelf';
    position: Position;
    size: Size;
}

export interface Wall {
    position: Position;
    size: Size;
}

export type InventoryItem =
    | 'Case File'
    | 'DNA Sample'
    | 'Extracted DNA'
    | 'Restriction Enzyme'
    | 'Digested DNA'
    | 'Agarose Gel'
    | 'Loaded Gel'
    | 'Blotting Membrane'
    | 'Probed Membrane'
    | 'Autoradiograph Film'
    | 'Final Report';

export interface Step {
    stationId: string;
    objective: string;
    description: string;
    // Fix: Changed to store component and props separately to avoid JSX in .ts files
    miniGame?: React.ComponentType<any>;
    miniGameProps?: Record<string, any>;
    requiredItems: InventoryItem[];
    resultingItems: InventoryItem[];
}

export type RoomId = 'INTRODUCTION' | 'METHODOLOGY' | 'APPLICATIONS' | 'LIMITATIONS';

export interface RoomData {
    id: RoomId;
    name: string;
    walls: Wall[];
    stations?: Station[];
    doors: Door[];
    displays?: Display[];
    decor?: Decor[];
}
