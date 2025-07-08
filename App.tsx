/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MainContent } from './components/layout/MainContent';
import { MockupData, Artwork } from './types';
import { FloatChat } from './components/chat/FloatChat';

export const App = () => {
  const [activeItem, setActiveItem] = useState('Dashboard');
  const [headerPrompt, setHeaderPrompt] = useState('');
  const [currentFinalPrompt, setCurrentFinalPrompt] = useState('');
  
  const [artworkForMockup, setArtworkForMockup] = useState<Artwork | null>(null);
  const [mockupForListing, setMockupForListing] = useState<MockupData | null>(null);
  
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const [imageForInspiration, setImageForInspiration] = useState<string | null>(null);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatQuery, setChatQuery] = useState<string | null>(null);

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };
  
  const handleAskMeryl = (query: string) => {
      setChatQuery(query);
      setIsChatOpen(true);
  };

  const handleStartGeneration = (prompt: string) => {
    setHeaderPrompt(prompt);
    setCurrentFinalPrompt(prompt);
    setActiveItem('Artwork Gallery');
  };

  const handleEditPrompt = () => {
    setActiveItem('Prompt Builder');
  };

  const handleGenerateFromBuilder = (prompt: string) => {
    setHeaderPrompt(prompt);
    setCurrentFinalPrompt(prompt);
    setActiveItem('Artwork Gallery');
  };

  const handleGoToMockupStudio = (artwork: Artwork) => {
    setArtworkForMockup(artwork);
    setActiveItem('Mockup Studio');
  };

  const handleContinueToListing = (mockupData: MockupData) => {
    setMockupForListing(mockupData);
    setActiveItem('Listing Generator');
  };
  
  const handleBackToMockupStudio = () => {
      setActiveItem('Mockup Studio');
  }

  const handleSetImageForInspiration = (imageUrl: string) => {
    setImageForInspiration(imageUrl);
    setActiveItem('Prompt Builder');
  };

  const handleInspirationUsed = () => {
    setImageForInspiration(null);
  };

  return (
    <>
      <div className={`app-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Sidebar 
          activeItem={activeItem} 
          setActiveItem={setActiveItem} 
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
        <div className="app-content">
          <Header 
              prompt={headerPrompt}
              onPromptChange={setHeaderPrompt}
              onGenerate={handleStartGeneration}
          />
          <MainContent 
            activeItem={activeItem}
            setActiveItem={setActiveItem}
            onAskMeryl={handleAskMeryl}
            // Props for Dashboard
            onStartDesign={handleStartGeneration}
            onSetImageForInspiration={handleSetImageForInspiration}
            // Props for Prompt Builder & Gallery
            initialPrompt={currentFinalPrompt}
            inspirationImageURL={imageForInspiration}
            onInspirationUsed={handleInspirationUsed}
            onGenerateFromBuilder={handleGenerateFromBuilder}
            onEditPrompt={handleEditPrompt}
            onGoToMockupStudio={handleGoToMockupStudio}
            // Props for Mockup Studio
            initialArtwork={artworkForMockup}
            onContinueToListing={handleContinueToListing}
            // Props for Listing Generator
            mockupForListing={mockupForListing}
            onGoBackToListings={handleBackToMockupStudio}
          />
        </div>
      </div>
      <FloatChat
        isInitiallyOpen={isChatOpen}
        initialQuery={chatQuery}
        onToggle={(isOpen) => setIsChatOpen(isOpen)}
        onQueryHandled={() => setChatQuery(null)}
      />
    </>
  );
};
