/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SparklesIcon, MagicWandIcon } from '../icons';
import { InspireButton } from '../ui/InspireButton';
import { Artwork } from '../../types';

interface AIGeneratorPanelProps {
    prompt: string;
    onPromptChange: (value: string) => void;
    generationType: 'graphic' | 'pattern';
    onGenerationTypeChange: (type: 'graphic' | 'pattern') => void;
    activeStyle: string;
    onStyleChange: (style: string) => void;
    isLoading: boolean;
    onGenerate: () => void;
    artworks: Artwork[];
    onArtworkSelect: (artwork: Artwork) => void;
    onInspire: (imageUrl: string) => void;
    selectedArtworkId?: number | string | null;
}

const generationStyles = ['Vector', 'Vintage', 'Minimalist', 'Cute', 'Grunge', 'Anime', 'Watercolor', 'Line Art', 'Gothic', 'Psychedelic'];

export const AIGeneratorPanel: React.FC<AIGeneratorPanelProps> = ({
    prompt, onPromptChange, generationType, onGenerationTypeChange,
    activeStyle, onStyleChange, isLoading, onGenerate,
    artworks, onArtworkSelect, onInspire, selectedArtworkId
}) => {
    return (
        <>
            <h3 className="panel-content-header"><MagicWandIcon /> AI Artwork Generator</h3>
            <div className="artwork-generator-controls">
                <textarea
                    className="artwork-library-prompt"
                    rows={3}
                    placeholder="Describe your design..."
                    value={prompt}
                    onChange={e => onPromptChange(e.target.value)}
                />
                <div className="generation-options-container">
                    <label><input type="radio" name="genType" value="graphic" checked={generationType === 'graphic'} onChange={() => onGenerationTypeChange('graphic')} /> Graphic</label>
                    <label><input type="radio" name="genType" value="pattern" checked={generationType === 'pattern'} onChange={() => onGenerationTypeChange('pattern')} /> Pattern</label>
                </div>
                <h4 className="panel-content-header" style={{ fontSize: '0.9rem', marginBottom: '-0.25rem', marginTop: '0.5rem' }}>Style</h4>
                <div className="style-chips-container">
                    {generationStyles.map(style => (
                        <button key={style} className={`style-chip ${activeStyle === style ? 'active' : ''}`} onClick={() => onStyleChange(style)}>
                            {style}
                        </button>
                    ))}
                </div>
                <button className="artwork-library-generate-btn" onClick={onGenerate} disabled={isLoading}>
                    {isLoading ? <div className="loading-spinner mini-spinner"></div> : <SparklesIcon />}
                    {isLoading ? 'Generating...' : 'Generate'}
                </button>
            </div>
            <div className="artwork-library-scroll-container">
                <div className="artwork-library-grid">
                    {isLoading && artworks.length === 0 && [...Array(4)].map((_, i) => <div key={i} className="artwork-library-skeleton"></div>)}
                    {artworks.map(art => (
                        <button key={art.id} className={`artwork-library-item ${selectedArtworkId === art.id ? 'selected' : ''}`} onClick={() => onArtworkSelect(art)}>
                            <InspireButton onClick={() => onInspire(art.url)} />
                            <img src={art.url} alt="AI generated artwork" />
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
};
