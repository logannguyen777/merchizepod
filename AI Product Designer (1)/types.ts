/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface NavItem {
  name: string;
  icon: React.FC<any>;
  iconSolid?: React.FC<any>;
  type?: 'separator';
}

export interface Trend {
  keyword: string;
  image: string;
  score: number;
}

export interface Niche {
    name:string;
    emoji: string;
    tooltip: string;
}

export interface UpcomingTrend {
  trendName: string;
  reason: string;
  confidence: 'High' | 'Medium' | 'Speculative';
  imageKeywords: string;
}

export interface Keyword {
    keyword: string;
    volume: string;
    competition: string;
    potential: string;
}

export interface Artwork {
  id: number | string;
  url: string;
}

export interface MockupData {
  productType: string;
  artworkUrl: string;
  mockupUrl: string;
}

export interface Texture {
    id: number | string;
    url: string;
}

// New types for the structured library
export interface ArtworkSubCategory {
  name: string;
  artworks: Artwork[];
}

export interface PremiumLibraryCategory {
  name: 'Patterns' | 'Graphics' | 'Photos';
  subCategories: ArtworkSubCategory[];
}

// New types for Grounding with Google Search
export interface GroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  };
}

export interface TextPath {
  type: 'arc-up' | 'arc-down' | 'circle';
  amount: number; // For arc, this is curvature (-100 to 100). For circle, this is radius.
}

export interface TextLayer {
  id: string;
  content: string;
  fontFamily: string;
  fontSize: number; // Base size, scale is used for transform
  fontWeight: '400' | '700';
  fontStyle: 'normal' | 'italic';
  color: string;
  outlineColor: string;
  outlineWidth: number;
  textShadow?: string; // For advanced effects like glow or multiple shadows
  x: number;
  y: number;
  scale: number;
  rotation: number;
  opacity: number;
  // New properties for advanced text styling
  path?: TextPath;
  letterSpacing: number; // in pixels
  backgroundImage?: string; // for gradients
  backgroundClip?: 'text'; // for gradients
}

export interface TextTemplate {
  name:string;
  content: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: '400' | '700';
  fontStyle: 'normal' | 'italic';
  color: string;
  textShadow?: string;
  // New properties for advanced text styling
  path?: TextPath;
  letterSpacing: number;
  backgroundImage?: string;
  backgroundClip?: 'text';
}

export interface Message {
  role: 'user' | 'model';
  content: string;
  isTyping?: boolean;
}

export interface AcademyLesson {
  id: string;
  title: string;
  icon: React.FC<any>;
  summary: string;
  content: string;
}