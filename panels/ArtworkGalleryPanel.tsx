/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { PencilSquareIcon, ArrowPathIcon, TShirtIcon } from '../components/icons';
import { SkeletonCard } from '../components/ui/SkeletonCard';
import { InspireButton } from '../components/ui/InspireButton';
import { Artwork } from '../types';

interface ArtworkGalleryPanelProps {
    prompt: string;
    onEditPrompt: () => void;
    onUseInMockup: (artwork: Artwork) => void;
    onSetImageForInspiration: (imageUrl: string) => void;
}

export const ArtworkGalleryPanel: React.FC<ArtworkGalleryPanelProps> = ({ prompt, onEditPrompt, onUseInMockup, onSetImageForInspiration }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [artworks, setArtworks] = useState<Artwork[]>([]);
    const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);

    const generateArtworks = useCallback(async () => {
        if (!prompt) return;
        setIsLoading(true);
        setSelectedArtwork(null);
        
        try {
            if (!process.env.API_KEY) {
                throw new Error("API_KEY not configured.");
            }
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateImages({
                model: 'imagen-3.0-generate-002',
                prompt: `A professional, high-quality POD (print on demand) t-shirt design graphic, vector style, transparent background. The design is about: ${prompt}`,
                config: { numberOfImages: 4, outputMimeType: 'image/png' },
            });
            
            const newArtworks = response.generatedImages.map((img, i) => ({
                id: Date.now() + i,
                url: `data:image/png;base64,${img.image.imageBytes}`,
            }));
            setArtworks(newArtworks);
        } catch (error: any) {
            console.error("Error generating artwork:", error);
            if (error.message?.includes('RESOURCE_EXHAUSTED') || error.status === 429) {
                console.warn("API quota exceeded. Falling back to placeholder images.");
            }
            // Fallback to placeholders on any error
            const encodedPrompt = encodeURIComponent(prompt.split(' ').slice(0, 5).join(','));
            const fallbackArtworks = [...Array(4)].map((_, i) => ({
                id: Date.now() + i,
                url: `https://picsum.photos/seed/${encodedPrompt}${i}/512`,
            }));
            setArtworks(fallbackArtworks);
        } finally {
            setIsLoading(false);
        }
    }, [prompt]);

    useEffect(() => {
        generateArtworks();
    }, [generateArtworks]);
    
    if (!prompt) {
        return (
            <div className="welcome-header">
                <h1>AI Artwork Gallery</h1>
                <p>Enter a description in the header bar above to generate your artwork.</p>
            </div>
        )
    }

    return (
        <div className="artwork-gallery-panel">
            <header className="welcome-header">
                <h1>AI Artwork Gallery</h1>
                <p>Here are the AI-generated artworks based on your prompt. Select your favorite to continue.</p>
            </header>
            
            <div className="artwork-prompt-bar">
                <p className="artwork-prompt-text"><strong>Prompt:</strong> {prompt}</p>
                <div className="artwork-prompt-actions">
                    <button className="secondary-btn" onClick={onEditPrompt}>
                        <PencilSquareIcon /> Edit Prompt
                    </button>
                    <button className="primary-btn" onClick={generateArtworks} disabled={isLoading}>
                        <ArrowPathIcon /> {isLoading ? "Generating..." : "Regenerate"}
                    </button>
                </div>
            </div>

            <div className="panel-section">
                <div className="artwork-grid">
                    {isLoading ? (
                        [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
                    ) : (
                        artworks.map(art => (
                            <div 
                                key={art.id} 
                                className={`artwork-card ${selectedArtwork?.id === art.id ? 'selected' : ''}`}
                                onClick={() => setSelectedArtwork(art)}
                                onDoubleClick={() => {
                                    setSelectedArtwork(art);
                                    if (onUseInMockup) onUseInMockup(art);
                                }}
                                role="button"
                                tabIndex={0}
                                aria-pressed={selectedArtwork?.id === art.id}
                            >
                                <InspireButton onClick={() => onSetImageForInspiration(art.url)} />
                                <img src={art.url} alt="AI generated artwork" />
                                <div className="artwork-card-overlay">
                                    {selectedArtwork?.id !== art.id && <span>Click to select</span>}
                                    {selectedArtwork?.id === art.id && onUseInMockup && (
                                        <button className="use-mockup-btn" onClick={() => onUseInMockup(selectedArtwork)}>
                                            <TShirtIcon/> Use in Mockup Studio
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};