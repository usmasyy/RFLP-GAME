import React, { useState } from 'react';
import { Character } from '../types';
import { PREDEFINED_CHARACTERS } from '../constants';

interface CharacterCustomizationProps {
    onStart: (character: Character) => void;
}

const CharacterPortrait: React.FC<{ character: Character; isSelected: boolean; onClick: () => void; }> = ({ character, isSelected, onClick }) => (
    <div
        onClick={onClick}
        className={`p-2 rounded-lg cursor-pointer transition-all border-4 ${isSelected ? 'border-yellow-400 bg-blue-500/30' : 'border-transparent hover:bg-gray-700'}`}
        role="button"
        aria-pressed={isSelected}
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
        <div className="relative w-24 h-24 mb-2 mx-auto">
             {/* Shadow */}
            <div className="absolute w-4/5 h-2/5 bg-black/20 rounded-full bottom-0 left-1/2 -translate-x-1/2"></div>
            {/* Body (Lab Coat) */}
            <div className={`absolute w-full h-4/5 ${character.labCoatColor} rounded-lg bottom-0 border-2 border-gray-600 overflow-hidden`}>
                {/* Shirt */}
                <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1/4 ${character.shirtColor} rounded-b-md`}></div>
                <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-1 bg-black/10"></div>
            </div>
            {/* Head */}
            <div className={`absolute w-3/5 h-3/5 ${character.skinColor} rounded-full top-0 left-1/2 -translate-x-1/2 border-2 border-gray-600 overflow-hidden`}>
                {/* Hair */}
                <div className={`absolute w-full h-1/2 ${character.hairColor} top-0`}></div>
                {/* Glasses */}
                {character.accessory === 'glasses' && (
                    <div className="absolute w-full h-1 bg-black top-1/2 -translate-y-1/2"></div>
                )}
            </div>
        </div>
        <p className="text-center font-semibold">{character.name}</p>
    </div>
);


const CharacterCustomization: React.FC<CharacterCustomizationProps> = ({ onStart }) => {
    const [selectedIndex, setSelectedIndex] = useState<number>(0);

    const handleCharacterSelect = (index: number) => {
        setSelectedIndex(index);
    };

    return (
        <div className="bg-gray-800 text-white p-8 rounded-lg shadow-2xl border-2 border-blue-400 flex flex-col items-center animate-fade-in-up w-full max-w-2xl">
            <h1 className="text-4xl font-bold text-yellow-300 mb-2">PRESENATION MADE BY</h1>
            <p className="text-gray-300 mb-6">Select a member to begin the investigation.</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {PREDEFINED_CHARACTERS.map((char, index) => (
                    <CharacterPortrait
                        key={char.name}
                        character={char}
                        isSelected={index === selectedIndex}
                        onClick={() => handleCharacterSelect(index)}
                    />
                ))}
            </div>

            <button
                onClick={() => onStart(PREDEFINED_CHARACTERS[selectedIndex])}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-xl transition-transform transform hover:scale-105"
            >
                Start Investigation
            </button>
        </div>
    );
};

export default CharacterCustomization;
