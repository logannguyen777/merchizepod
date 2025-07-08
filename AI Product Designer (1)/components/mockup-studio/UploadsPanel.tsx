/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowUpOnSquareIcon } from '../icons';
import { InspireButton } from '../ui/InspireButton';
import { Artwork } from '../../types';

interface UploadsPanelProps {
    userUploadedArtworks: Artwork[];
    onUploadClick: () => void;
    onArtworkSelect: (artwork: Artwork) => void;
    onInspire: (imageUrl: string) => void;
    selectedArtworkId?: number | string | null;
}

export const UploadsPanel: React.FC<UploadsPanelProps> = ({
    userUploadedArtworks, onUploadClick, onArtworkSelect, onInspire, selectedArtworkId
}) => {
    return (
        <>
            <div className="artwork-generator-controls">
                <h3 className="panel-content-header"><ArrowUpOnSquareIcon /> Your Uploads</h3>
                <button className="primary-full-btn" onClick={onUploadClick}>
                    <ArrowUpOnSquareIcon /> Upload Your Artwork
                </button>
            </div>
            <div className="artwork-library-scroll-container">
                {userUploadedArtworks.length === 0 ? (
                     <div className="feature-placeholder" style={{padding: '2rem 1rem'}}>
                        <h4>No Images Uploaded</h4>
                        <p>Click the button above to upload your first design.</p>
                    </div>
                ) : (
                    <div className="artwork-library-grid">
                        {userUploadedArtworks.map(art => (
                            <button key={art.id} className={`artwork-library-item ${selectedArtworkId === art.id ? 'selected' : ''}`} onClick={() => onArtworkSelect(art)}>
                                <InspireButton onClick={() => onInspire(art.url)} />
                                <img src={art.url} alt="User uploaded artwork" />
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};
