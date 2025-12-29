import React, { useState } from 'react';
import { Character } from '../types';
import { PREDEFINED_CHARACTERS } from '../constants';

interface CharacterCustomizationProps {
    onStart: (character: Character) => void;
}

const CharacterPortrait: React.FC<{ character: Character; isSelected: boolean; onClick: () => void; }> = ({ character, isSelected, onClick }) => (
    <div
        onClick={onClick}
        className={`p-4 rounded-xl cursor-pointer transition-all border-4 ${isSelected ? 'border-yellow-400 bg-blue-500/30 scale-105' : 'border-transparent hover:bg-gray-700 hover:scale-102'}`}
        role="button"
        aria-pressed={isSelected}
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
        <div className="relative w-32 h-32 mb-2 mx-auto">
            {character.characterImage ? (
                <img
                    src={character.characterImage}
                    alt={character.name}
                    className="w-full h-full object-contain"
                />
            ) : (
                <div className="w-full h-full bg-gray-600 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">{character.name[0]}</span>
                </div>
            )}
        </div>
        <p className="text-center font-bold text-lg">{character.name}</p>
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
