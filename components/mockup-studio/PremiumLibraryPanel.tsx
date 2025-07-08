/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MagnifyingGlassIcon, SparklesIcon } from '../icons';
import { InspireButton } from '../ui/InspireButton';
import { Artwork, PremiumLibraryCategory } from '../../types';

interface PremiumLibraryPanelProps {
    premiumLibrary: PremiumLibraryCategory[];
    artworkCategory: 'Patterns' | 'Graphics' | 'Photos';
    onCategoryChange: (category: 'Patterns' | 'Graphics' | 'Photos') => void;
    visibleCounts: { [key: string]: number };
    onSetVisibleCounts: React.Dispatch<React.SetStateAction<{ [key: string]: number }>>;
    onArtworkSelect: (artwork: Artwork) => void;
    onInspire: (imageUrl: string) => void;
    selectedArtworkId?: number | string | null;
}

const INITIAL_VISIBLE_COUNT = 8;
const LOAD_MORE_COUNT = 16;

export const PremiumLibraryPanel: React.FC<PremiumLibraryPanelProps> = ({
    premiumLibrary, artworkCategory, onCategoryChange, visibleCounts,
    onSetVisibleCounts, onArtworkSelect, onInspire, selectedArtworkId
}) => {

    const currentLibraryCategory = premiumLibrary.find(cat => cat.name === artworkCategory);
    const artworkCategories = premiumLibrary.map(cat => cat.name);

    return (
        <>
            <h3 className="panel-content-header"><SparklesIcon /> Premium Image Collection</h3>
            <div className="panel-search-bar">
                <MagnifyingGlassIcon />
                <input type="text" placeholder="Search Premium Images" />
            </div>
            <div className="artwork-category-filters">
                {artworkCategories.map(cat => (
                    <button
                        key={cat}
                        className={`chip-btn ${artworkCategory === cat ? 'active' : ''}`}
                        onClick={() => {
                            onCategoryChange(cat);
                            onSetVisibleCounts({}); // Reset counts when category changes
                        }}
                    >
                        {cat}
                    </button>
                ))}
            </div>
            <div className="artwork-library-scroll-container">
                {currentLibraryCategory?.subCategories.map(subCat => {
                    const visibleCount = visibleCounts[subCat.name] || INITIAL_VISIBLE_COUNT;
                    return (
                        <React.Fragment key={subCat.name}>
                            <h4 className="artwork-subcategory-header">{subCat.name}</h4>
                            <div className="artwork-library-grid">
                                {subCat.artworks.slice(0, visibleCount).map(art => (
                                    <button key={art.id} className={`artwork-library-item ${selectedArtworkId === art.id ? 'selected' : ''}`} onClick={() => onArtworkSelect(art)}>
                                        <InspireButton onClick={() => onInspire(art.url)} />
                                        <img src={art.url} alt={`${subCat.name} artwork`} />
                                    </button>
                                ))}
                            </div>
                            {visibleCount < subCat.artworks.length && (
                                <button
                                    className="show-more-btn"
                                    onClick={() => onSetVisibleCounts(prev => ({ ...prev, [subCat.name]: visibleCount + LOAD_MORE_COUNT }))}
                                >
                                    Show More
                                </button>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </>
    );
};
