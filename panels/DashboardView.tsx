/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { TrendScore } from '../components/ui/TrendScore';
import { InspireButton } from '../components/ui/InspireButton';
import { AskMerylButton } from '../components/ui/AskMerylButton';
import { LightBulbIcon, ChartBarIcon } from '../components/icons';
import { Trend, Niche, Keyword, GroundingChunk, UpcomingTrend } from '../types';

interface DashboardViewProps {
  onStartDesign: (idea: string) => void;
  onSetImageForInspiration: (imageUrl: string) => void;
  onAskMeryl: (query: string) => void;
}

const staticKeywords: Keyword[] = [
    { keyword: "Funny Cat Dad Gift", volume: "High", competition: "Medium", potential: "High" },
    { keyword: "Groovy Teacher Shirt", volume: "Medium", competition: "Low", potential: "High" },
    { keyword: "Dog Mom Era", volume: "High", competition: "High", potential: "Medium" },
    { keyword: "In My Spooky Era", volume: "Very High", competition: "High", potential: "High" },
    { keyword: "Mental Health Matters", volume: "Medium", competition: "Medium", potential: "Medium" },
    { keyword: "Custom Gamer Tag", volume: "Low", competition: "Low", potential: "Untapped" },
];

const staticUpcomingTrends: UpcomingTrend[] = [
  {
    trendName: "Solarpunk Academia",
    reason: "A shift towards optimistic, eco-friendly futures will blend academic aesthetics with nature.",
    confidence: "High",
    imageKeywords: "solarpunk city nature",
  },
  {
    trendName: "Retro-Futurism Revival",
    reason: "Nostalgia for early digital and space-age designs is growing, especially with younger audiences.",
    confidence: "Medium",
    imageKeywords: "retro futurism robot",
  },
  {
    trendName: "Cottagecore Gaming",
    reason: "The cozy gaming community is expanding, creating a new niche for calm, nature-inspired gamer apparel.",
    confidence: "Speculative",
    imageKeywords: "cozy gaming controller flowers",
  },
];


const ConfidenceMeter = ({ confidence }: { confidence: 'High' | 'Medium' | 'Speculative' }) => {
    const confidenceMap = {
        High: { width: '100%', className: '' },
        Medium: { width: '66%', className: 'medium' },
        Speculative: { width: '33%', className: 'speculative' },
    };
    const { width, className } = confidenceMap[confidence];
    return (
        <div className="confidence-meter">
            <span className="confidence-label">AI Confidence: {confidence}</span>
            <div className="confidence-bar-bg">
                <div className={`confidence-bar-fg ${className}`} style={{ width }}></div>
            </div>
        </div>
    );
};


export const DashboardView: React.FC<DashboardViewProps> = ({ onStartDesign, onSetImageForInspiration, onAskMeryl }) => {
  const [selectedNiche, setSelectedNiche] = useState('General');
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [isLoadingKeywords, setIsLoadingKeywords] = useState(true);
  const [sources, setSources] = useState<GroundingChunk[]>([]);
  const [upcomingTrends, setUpcomingTrends] = useState<UpcomingTrend[]>([]);
  const [isLoadingTrends, setIsLoadingTrends] = useState(true);


  const fetchKeywords = useCallback(async () => {
    setIsLoadingKeywords(true);
    setSources([]);
    try {
      if (!process.env.API_KEY) {
          console.warn("API_KEY not found, falling back to static keyword data.");
          setKeywords(staticKeywords);
          return;
      }

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `
        Act as a market trend analyst for print-on-demand products. Your task is to generate a list of 7 trending keywords for t-shirts right now for the "${selectedNiche}" niche. If the niche is "General", provide broad, popular trends. Use your knowledge of current events, holidays, and social media buzz related to this niche.

        **Strict Output Requirements:**
        1.  The output MUST be a single, valid JSON array of objects.
        2.  The entire response body must be ONLY the JSON array. It must start with '[' and end with ']'. Do NOT include any other text, explanations, or markdown formatting like \`\`\`json.
        3.  Each object in the array represents a keyword and MUST contain these four keys: "keyword", "volume", "competition", and "potential".
        4.  All keys and all string values must be enclosed in double quotes (").
        5.  The value for "volume" must be one of: "Low", "Medium", "High", "Very High".
        6.  The value for "competition" must be one of: "Low", "Medium", "High".
        7.  The value for "potential" must be one of: "Untapped", "Medium", "High".
        8.  There must be NO trailing commas after the last element in the array or the last property in an object.
      `;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-04-17',
        contents: prompt,
        config: {
          tools: [{googleSearch: {}}],
        },
      });

      setSources(response.candidates?.[0]?.groundingMetadata?.groundingChunks || []);
      
      let jsonStr = response.text.trim();
      const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
      const match = jsonStr.match(fenceRegex);
      if (match && match[2]) {
        jsonStr = match[2].trim();
      }
      
      const parsedData = JSON.parse(jsonStr);

      if (Array.isArray(parsedData) && parsedData.every(item => 'keyword' in item)) {
        setKeywords(parsedData);
      } else {
        throw new Error("Invalid data format received from API.");
      }

    } catch (error: any) {
      console.error("Error fetching AI keywords:", error);
      if (error.message?.includes('RESOURCE_EXHAUSTED') || error.status === 429) {
        console.warn("API quota exceeded. Falling back to static keyword data.");
      }
      setKeywords(staticKeywords);
    } finally {
      setIsLoadingKeywords(false);
    }
  }, [selectedNiche]);

  useEffect(() => {
      fetchKeywords();
  }, [fetchKeywords]);
  
  useEffect(() => {
    const fetchUpcomingTrends = async () => {
      setIsLoadingTrends(true);
      try {
        if (!process.env.API_KEY) {
          throw new Error("API_KEY not found.");
        }
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `
            Act as a futuristic trend forecaster for print-on-demand e-commerce. Based on emerging patterns, social shifts, and upcoming media, predict 3 upcoming t-shirt design trends for the next 3-6 months.

            **Strict Output Requirements:**
            1. The output MUST be a single, valid JSON array of objects.
            2. The entire response body must be ONLY the JSON array.
            3. Each object MUST contain these four keys: "trendName", "reason", "confidence", "imageKeywords".
            4. "trendName": A short, catchy name for the trend.
            5. "reason": A brief, one-sentence explanation for why this trend is predicted to emerge.
            6. "confidence": Your confidence in this prediction. Must be one of: "High", "Medium", "Speculative".
            7. "imageKeywords": A short string of 2-3 keywords I can use to find a representative stock photo (e.g., "solarpunk city", "retro futurism robot").

            **Example Object:**
            {
              "trendName": "Solarpunk Aesthetics",
              "reason": "Growing interest in optimistic, eco-friendly futures will drive demand for nature-integrated tech designs.",
              "confidence": "High",
              "imageKeywords": "solarpunk city nature"
            }`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-preview-04-17',
          contents: prompt,
          config: { responseMimeType: "application/json" }
        });

        let jsonStr = response.text.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) { jsonStr = match[2].trim(); }
        
        const parsedData = JSON.parse(jsonStr);

        if (Array.isArray(parsedData) && parsedData.every(item => 'trendName' in item)) {
          setUpcomingTrends(parsedData);
        } else {
          throw new Error("Invalid data format for upcoming trends.");
        }

      } catch (error) {
        console.error("Error fetching upcoming trends:", error);
        setUpcomingTrends(staticUpcomingTrends);
      } finally {
        setIsLoadingTrends(false);
      }
    };
    fetchUpcomingTrends();
  }, []);


  const steps = [
    { num: 1, title: "Explore Ideas", desc: "Use our AI-powered dashboard to discover trending niches and keywords for your next product design." },
    { num: 2, title: "Generate Artwork", desc: "Describe your idea in the top bar. We'll generate a stunning gallery of unique artwork for you." },
    { num: 3, title: "Create & Publish", desc: "Select your favorite art, place it on a mockup, and get an AI-generated listing ready to publish." },
  ];

  const niches: Niche[] = [
    { name: "General", emoji: "✨", tooltip: "High" },
    { name: "Pets", emoji: "🐾", tooltip: "High" }, { name: "Teachers", emoji: "👩‍🏫", tooltip: "High" },
    { name: "Moms", emoji: "🤱", tooltip: "High" }, { name: "LGBTQ+", emoji: "🏳️‍🌈", tooltip: "Medium" },
    { name: "Halloween", emoji: "🎃", tooltip: "High (Seasonal)" }, { name: "Gym & Fitness", emoji: "💪", tooltip: "Medium" },
    { name: "Mental Health", emoji: "🧠", tooltip: "Untapped" }, { name: "Gaming", emoji: "🎮", tooltip: "High" },
    { name: "Reading", emoji: "📚", tooltip: "Medium" }, { name: "Coffee", emoji: "☕", tooltip: "High" },
    { name: "Camping", emoji: "🏕️", tooltip: "Medium" },
  ];

  return (
    <div className="dashboard-panel">
      <header className="welcome-header">
        <h1>Let's create your next best-seller</h1>
        <p>Welcome to your AI-powered design studio. Go from idea to a published product in minutes, not days.</p>
      </header>
      
       <section className="panel-section">
        <header className="panel-section-header">
          <h2>💡 Niche Explorer</h2>
          <p>Select a niche to discover its top keywords.</p>
        </header>
        <div className="niche-grid">
          {niches.map(niche => (
            <button 
              key={niche.name} 
              className={`niche-card ${selectedNiche === niche.name ? 'active' : ''}`} 
              title={`Avg. Sales: ${niche.tooltip}`} 
              onClick={() => setSelectedNiche(niche.name)}
            >
              <span className="niche-card-emoji">{niche.emoji}</span>
              <span className="niche-card-name">{niche.name}</span>
            </button>
          ))}
        </div>
      </section>

       <section className="panel-section">
        <header className="panel-section-header">
          <h2><ChartBarIcon style={{verticalAlign: 'bottom', marginRight: '0.5rem'}}/> Upcoming Trends</h2>
          <p>AI predictions for what will be popular in the next 3-6 months.</p>
        </header>
        <div className="upcoming-trends-grid">
          {isLoadingTrends ? (
             [...Array(3)].map((_, i) => (
               <div key={i} className="skeleton-image" style={{height: '160px', borderRadius: '12px', opacity: 1 - i*0.1}}></div>
            ))
          ) : (
            upcomingTrends.map(trend => (
              <div key={trend.trendName} className="upcoming-trend-card" onClick={() => onStartDesign(trend.trendName)}>
                <img src={`https://picsum.photos/seed/${encodeURIComponent(trend.imageKeywords)}/100`} alt={trend.trendName} className="upcoming-trend-card-img" />
                <div className="upcoming-trend-card-content">
                  <h4>{trend.trendName}</h4>
                  <p>{trend.reason}</p>
                  <ConfidenceMeter confidence={trend.confidence} />
                </div>
              </div>
            ))
          )}
        </div>
      </section>
      
      <section className="panel-section">
        <header className="panel-section-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem'}}>
            <div>
              <h2>🔍 Top Keywords for '{selectedNiche}'</h2>
              <p>A detailed look at keywords with high potential, powered by Gemini with Google Search.</p>
            </div>
            <AskMerylButton 
              query="What do 'Volume', 'Competition', and 'AI Potential' mean?"
              onClick={onAskMeryl}
            />
        </header>
        <div className="table-container">
          <table className="keywords-table">
            <thead>
              <tr>
                <th>Keyword</th>
                <th>Volume</th>
                <th>Competition</th>
                <th>AI Potential</th>
              </tr>
            </thead>
            <tbody>
              {isLoadingKeywords ? (
                [...Array(6)].map((_, i) => (
                   <tr key={i}><td colSpan={4}><div className="skeleton-image" style={{height: '24px', opacity: 1 - i*0.1}}></div></td></tr>
                ))
              ) : (
                keywords.map(kw => (
                  <tr key={kw.keyword} onClick={() => onStartDesign(kw.keyword)}>
                    <td>{kw.keyword}</td>
                    <td><span className={`tag tag-${kw.volume.toLowerCase().replace(/\s/g, '-')}`}>{kw.volume}</span></td>
                    <td><span className={`tag tag-${kw.competition.toLowerCase()}`}>{kw.competition}</span></td>
                    <td><span className={`tag tag-${kw.potential.toLowerCase()}`}>{kw.potential}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

       {sources.length > 0 && (
        <section className="sources-section">
          <header className="panel-section-header" style={{marginBottom: '1rem'}}>
            <h3 style={{fontSize: '1.25rem'}}>Data Sources</h3>
            <p>The keyword analysis above was grounded with live data from the following web sources:</p>
          </header>
          <ul className="sources-list">
            {sources.map((source, index) => (
              source.web?.uri && (
                <li key={index}>
                  <a href={source.web.uri} target="_blank" rel="noopener noreferrer">
                    {source.web.title || source.web.uri}
                  </a>
                </li>
              )
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};