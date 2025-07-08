/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { MagicWandIcon, FireIcon, MagnifyingGlassIcon, ClockIcon } from '../icons';

interface HeaderProps {
    prompt: string;
    onPromptChange: (value: string) => void;
    onGenerate: (prompt: string) => void;
}

const hotTrends = [
    'Retro Sunset',
    'Funny Cat Dad',
    'Groovy Teacher',
    'Spooky Season',
];

const searchableTerms = [
    'A cute cat astronaut on a skateboard',
    'Vintage floral pattern for fabric',
    'Minimalist line art of a mountain range',
    'Gothic lettering with roses and thorns',
    'Psychedelic mushroom forest illustration',
    'A corgi wearing a crown, pop art style',
    'Japanese wave design in a circle',
    'Funny quote about coffee and chaos',
    'Synthwave cityscape with a sports car',
    'Watercolor painting of a hummingbird',
    'Dog mom with paw prints and hearts',
    'Anime character with cherry blossoms',
    'Distressed American flag for a t-shirt',
    'Camping scene with a tent and campfire',
    'Skull with a floral headdress',
];

export const Header: React.FC<HeaderProps> = ({ prompt, onPromptChange, onGenerate }) => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Hide dropdown if clicked outside
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsDropdownVisible(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);
  
  const handleInputChange = (value: string) => {
      onPromptChange(value);
      if (value) {
          const filtered = searchableTerms.filter(term => 
              term.toLowerCase().includes(value.toLowerCase())
          );
          setSuggestions(filtered);
      } else {
          setSuggestions(searchableTerms.slice(0, 5)); // Show a few initial suggestions
      }
  };

  const handleItemClick = (term: string) => {
    onPromptChange(term);
    onGenerate(term);
    setIsDropdownVisible(false);
  };
  
  const handleGenerateClick = () => {
      if(prompt.trim()) {
          onGenerate(prompt);
          setIsDropdownVisible(false);
      }
  };

  const onFocus = () => {
    setIsDropdownVisible(true);
    if (!prompt) {
        setSuggestions(searchableTerms.slice(0, 5));
    }
  }
  
  return (
    <header className="header" aria-label="Main Header">
      <div className="prompt-input-wrapper" ref={wrapperRef}>
        <input 
          type="text" 
          className="prompt-input" 
          placeholder="Describe your design idea... e.g., 'A cute cat astronaut on a skateboard'" 
          aria-label="Design Prompt"
          value={prompt}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={onFocus}
          onKeyDown={(e) => {
              if (e.key === 'Enter') {
                  handleGenerateClick();
              }
          }}
        />
        <button 
            className="generate-button" 
            aria-label="Generate Designs"
            onClick={handleGenerateClick}
            disabled={!prompt.trim()}
        >
          <MagicWandIcon />
          <span>Generate</span>
        </button>

        <div className={`search-dropdown ${isDropdownVisible ? 'visible' : ''}`}>
            <div className="dropdown-section">
                <div className="dropdown-section-header">
                    <FireIcon />
                    <span>Hot Trends</span>
                </div>
                <div className="hot-trends-container">
                    {hotTrends.map(trend => (
                        <button key={trend} className="trend-chip" onClick={() => handleItemClick(trend)}>
                            {trend}
                        </button>
                    ))}
                </div>
            </div>
            <div className="dropdown-section">
                 <div className="dropdown-section-header">
                    <MagnifyingGlassIcon />
                    <span>Suggestions</span>
                </div>
                <ul className="suggestions-list">
                    {suggestions.map(suggestion => (
                        <li key={suggestion} className="suggestion-item" onClick={() => handleItemClick(suggestion)}>
                            <ClockIcon />
                            <span>{suggestion}</span>
                        </li>
                    ))}
                </ul>
                {suggestions.length === 0 && prompt && (
                  <div className="no-suggestions">No suggestions found.</div>
                )}
            </div>
        </div>
      </div>
    </header>
  );
};