/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DashboardView } from '../../panels/DashboardView';
import { AIPromptBuilderPanel } from '../../panels/AIPromptBuilderPanel';
import { ArtworkGalleryPanel } from '../../panels/ArtworkGalleryPanel';
import { MockupStudioPanel } from '../../panels/MockupStudioPanel';
import { ListingGeneratorPanel } from '../../panels/ListingGeneratorPanel';
import { PublishCenterPanel } from '../../panels/PublishCenterPanel';
import { MiniAcademyPanel } from '../../panels/MiniAcademyPanel';
import { Artwork, MockupData } from '../../types';

interface MainContentProps {
  activeItem: string;
  setActiveItem: (item: string) => void;
  onAskMeryl: (query: string) => void;
  // Dashboard
  onStartDesign: (idea: string) => void;
  onSetImageForInspiration: (imageUrl: string) => void;
  // Prompt Builder & Gallery
  initialPrompt: string;
  inspirationImageURL: string | null;
  onInspirationUsed: () => void;
  onGenerateFromBuilder: (prompt: string) => void;
  onEditPrompt: () => void;
  onGoToMockupStudio: (artwork: Artwork) => void;
  // Mockup Studio
  initialArtwork: Artwork | null;
  onContinueToListing: (mockupData: MockupData) => void;
  // Listing Generator
  mockupForListing: MockupData | null;
  onGoBackToListings: () => void;
}

export const MainContent: React.FC<MainContentProps> = (props) => {
  const renderContent = () => {
    switch (props.activeItem) {
      case 'Prompt Builder':
        return <AIPromptBuilderPanel 
                  initialIdea={props.initialPrompt} 
                  onGenerateArtwork={props.onGenerateFromBuilder}
                  inspirationImageURL={props.inspirationImageURL}
                  onInspirationUsed={props.onInspirationUsed}
                  onAskMeryl={props.onAskMeryl}
                />;
      case 'Artwork Gallery':
        return <ArtworkGalleryPanel 
                  prompt={props.initialPrompt} 
                  onEditPrompt={props.onEditPrompt} 
                  onUseInMockup={props.onGoToMockupStudio}
                  onSetImageForInspiration={props.onSetImageForInspiration}
                />;
      case 'Mockup Studio':
        return <MockupStudioPanel 
                    initialArtwork={props.initialArtwork}
                    initialPrompt={props.initialPrompt} 
                    onContinueToListing={props.onContinueToListing}
                    onSetImageForInspiration={props.onSetImageForInspiration}
                    onAskMeryl={props.onAskMeryl}
                />;
      case 'Listing Generator':
        return <ListingGeneratorPanel 
                  mockupData={props.mockupForListing} 
                  onGoBack={props.onGoBackToListings}
                  onAskMeryl={props.onAskMeryl} 
                />
      case 'Publish Center':
        return <PublishCenterPanel />;
      case 'POD Mini Academy':
        return <MiniAcademyPanel />;
      case 'Dashboard':
      default:
        return <DashboardView 
                  onStartDesign={props.onStartDesign} 
                  onSetImageForInspiration={props.onSetImageForInspiration} 
                  onAskMeryl={props.onAskMeryl}
                />;
    }
  };

  return (
    <main className="main-content">
      {renderContent()}
    </main>
  );
};