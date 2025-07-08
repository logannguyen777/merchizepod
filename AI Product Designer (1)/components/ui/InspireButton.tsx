/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SparklesIcon } from '../icons';

interface InspireButtonProps {
  onClick: () => void;
  className?: string;
}

export const InspireButton: React.FC<InspireButtonProps> = ({ onClick, className = '' }) => (
  <button 
    className={`inspire-button ${className}`}
    onClick={(e) => {
      e.stopPropagation(); // Prevent card clicks
      e.preventDefault();
      onClick();
    }}
    title="AI-inspire new designs from this image"
    aria-label="AI-inspire new designs from this image"
  >
    <SparklesIcon />
  </button>
);
