/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { SparklesIcon, PencilSquareIcon, MagicWandIcon, ArrowUpOnSquareIcon } from '../components/icons';
import { AskMerylButton } from '../components/ui/AskMerylButton';


interface AIPromptBuilderPanelProps {
  initialIdea: string;
  onGenerateArtwork: (prompt: string) => void;
  inspirationImageURL: string | null;
  onInspirationUsed: () => void;
  onAskMeryl: (query: string) => void;
}

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
}

const imageUrlToFile = async(url: string, fileName = 'inspiration.jpg') => {
    // Use a cors-proxy if necessary, or ensure images are served with CORS headers
    const response = await fetch(url);
    const blob = await response.blob();
    return new File([blob], fileName, { type: blob.type });
}


export const AIPromptBuilderPanel: React.FC<AIPromptBuilderPanelProps> = ({ initialIdea = '', onGenerateArtwork, inspirationImageURL, onInspirationUsed, onAskMeryl }) => {
  const [idea, setIdea] = useState(initialIdea);
  const [activeStyle, setActiveStyle] = useState('Retro');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [finalPrompt, setFinalPrompt] = useState('');
  
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const styles = ['Retro', 'Bold', 'Minimalist', 'Cute', 'Grunge', 'Anime'];

  const sampleSuggestions: { [key: string]: string[] } = {
    'Retro Sunset T-Shirt': [
      "A vibrant retro-style sunset over a serene mountain range, with silhouetted palm trees in the foreground. The design uses bold, saturated colors like orange, pink, and purple, reminiscent of 80s synthwave aesthetics. The overall mood is nostalgic and calm.",
      "Vector art of a classic convertible car driving into a stylized, geometric sunset. The design features clean lines, a limited color palette of warm tones, and a subtle film grain texture to give it a vintage, screen-printed look. The text 'Endless Summer' is integrated in a retro script font.",
      "A distressed, hand-drawn illustration of a sun with a serene face, wearing sunglasses. The style is inspired by 70s rock posters, with psychedelic patterns and earthy colors. The texture is rough, as if printed on old, worn-out fabric."
    ],
    default: [
      "A detailed vector illustration of [your idea], focusing on clean lines and a modern, flat design style. The color palette is bright and cheerful.",
      "A vintage, cartoon-style depiction of [your idea], with bold outlines and a slightly distressed texture for a retro feel. The scene is humorous and dynamic.",
      "A minimalist, single-line drawing of [your idea], presented in a high-contrast, black and white aesthetic. The design is elegant, simple, and impactful."
    ]
  };
  
    useEffect(() => {
        if (inspirationImageURL) {
            const processInspiration = async () => {
                try {
                    setIsAnalyzingImage(true);
                    setIdea('');
                    setUploadedImage(null);
                    setImagePreview(null);
                    setSuggestions([]);
                    setFinalPrompt('');
                    
                    const file = await imageUrlToFile(inspirationImageURL);
                    setUploadedImage(file);
                    setImagePreview(URL.createObjectURL(file));
                } catch (error) {
                    console.error("Error processing inspiration image:", error);
                    setIdea("Sorry, I couldn't load that image. Please try another one.");
                    setIsAnalyzingImage(false);
                } finally {
                    onInspirationUsed();
                }
            };
            processInspiration();
        }
    }, [inspirationImageURL, onInspirationUsed]);


  const handleGenerateSuggestions = () => {
    setIsLoading(true);
    setSuggestions([]);
    setFinalPrompt('');
    // Simulate AI call
    setTimeout(() => {
      const ideaKey = Object.keys(sampleSuggestions).find(key => key.toLowerCase() === idea.toLowerCase()) || 'default';
      const generated = sampleSuggestions[ideaKey].map(prompt => prompt.replace('[your idea]', idea));
      setSuggestions(generated);
      setIsLoading(false);
    }, 1500);
  };

  const handleUsePrompt = (promptText: string) => {
    setFinalPrompt(promptText);
  };
  
  useEffect(() => {
    setIdea(initialIdea);
    if(initialIdea) {
        setSuggestions([]);
        setFinalPrompt('');
    }
  }, [initialIdea]);

  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedImage(file);
      setImagePreview(URL.createObjectURL(file));
      // Reset text idea when new image is uploaded
      setIdea('');
    }
  };

  useEffect(() => {
    const generatePromptFromImage = async () => {
      if (!uploadedImage) return;
      setIsAnalyzingImage(true);
      setIdea(''); // Clear previous idea

      try {
        if (!process.env.API_KEY) {
          throw new Error("API_KEY not configured.");
        }
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const imagePart = await fileToGenerativePart(uploadedImage);
        const textPart = { text: "You are a creative assistant for a print-on-demand store. Describe the provided image in a concise, descriptive, and inspiring way. This description will be used as a prompt for an AI image generator to create a new t-shirt graphic. Focus on the style, subject, colors, and overall mood. Example: 'A cute, cartoon-style corgi wearing a party hat, surrounded by confetti, minimalist vector art'." };
        
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-preview-04-17',
          contents: { parts: [imagePart, textPart] },
        });

        setIdea(response.text);

      } catch (error: any) {
        console.error("Error analyzing image:", error);
        if (error.message?.includes('RESOURCE_EXHAUSTED') || error.status === 429) {
          setIdea("AI analysis is busy. Try describing your image manually, e.g., 'A golden retriever on a beach'.");
        } else {
          setIdea("Error analyzing image. Please try again or describe it manually.");
        }
      } finally {
        setIsAnalyzingImage(false);
      }
    };
    generatePromptFromImage();
  }, [uploadedImage]);

  return (
    <div className="ai-prompt-builder-panel">
      <header className="welcome-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem'}}>
        <div>
          <h1>AI Prompt Builder</h1>
          <p>Turn your simple idea into a rich, high-quality prompt for the AI image generator.</p>
        </div>
        <AskMerylButton 
          query="Give me tips for writing a great AI art prompt"
          onClick={onAskMeryl}
          className="ask-meryl-btn"
        />
      </header>
      
      <div className="prompt-builder-input-section">
        <label>1. Start with an Image (AI-to-Prompt)</label>
        <div className="image-upload-area">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange}
            style={{display: 'none'}}
            accept="image/*"
          />
          <button className="image-upload-btn" onClick={handleImageUploadClick}>
            <ArrowUpOnSquareIcon />
            {imagePreview ? 'Upload a Different Image' : 'Upload Your Inspiration'}
          </button>
          {imagePreview && <img src={imagePreview} alt="Uploaded preview" className="image-preview-thumbnail" />}
        </div>
      </div>
      
      <div className="prompt-builder-input-section">
        <label htmlFor="idea-input">2. Or, Enter Your Idea Manually</label>
        <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
            <input 
                id="idea-input"
                type="text"
                className="prompt-idea-input"
                placeholder="e.g., 'A funny cat shirt'"
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                disabled={isAnalyzingImage}
            />
            {isAnalyzingImage && <div className="image-analysis-spinner"></div>}
        </div>
        
        <label>3. Select a Style</label>
        <div className="style-chips-container">
            {styles.map(style => (
                <button 
                    key={style} 
                    className={`style-chip ${activeStyle === style ? 'active' : ''}`}
                    onClick={() => setActiveStyle(style)}
                >
                    {style}
                </button>
            ))}
        </div>
        
        <button className="generate-suggestions-btn" onClick={handleGenerateSuggestions} disabled={isLoading || !idea || isAnalyzingImage}>
            <SparklesIcon />
            {isLoading ? 'Generating...' : 'Generate AI Suggestions'}
        </button>
      </div>

      {(isLoading || suggestions.length > 0) && (
        <div className="panel-section">
            <header className="panel-section-header">
                <h2>🧠 AI Prompt Suggestions</h2>
                <p>Choose a prompt to start with, or edit it below.</p>
            </header>
            {isLoading && (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Our AI is crafting the perfect prompts for you...</p>
                </div>
            )}
            <div className="suggestions-grid">
                {suggestions.map((prompt, index) => (
                    <div key={index} className="prompt-suggestion-card">
                        <p className="prompt-suggestion-content">{prompt}</p>
                        <div className="prompt-suggestion-actions">
                            <button onClick={() => handleUsePrompt(prompt)}>
                                👍 Use this prompt
                            </button>
                            <button onClick={() => handleUsePrompt(prompt)}>
                                <PencilSquareIcon />
                                Edit
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}

      {finalPrompt && (
        <div className="panel-section">
            <header className="panel-section-header">
                <h2>🎨 Final Prompt Editor</h2>
                <p>Make any final adjustments before generating your artwork.</p>
            </header>
            <div className="final-prompt-editor">
                <textarea 
                    value={finalPrompt}
                    onChange={(e) => setFinalPrompt(e.target.value)}
                    rows={4}
                    aria-label="Final Prompt"
                ></textarea>
                <button className="generate-artwork-btn" onClick={() => onGenerateArtwork(finalPrompt)}>
                    <MagicWandIcon/>
                    Generate Artwork
                </button>
            </div>
        </div>
      )}
    </div>
  );
};
