/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
    ArrowLeftIcon, PinIcon, TrashIcon, ArrowPathIcon, CurrencyDollarIcon, 
    ArrowUpOnSquareIcon, LightBulbIcon 
} from '../components/icons';
import { AskMerylButton } from '../components/ui/AskMerylButton';
import { MockupData } from '../types';

interface ListingGeneratorPanelProps {
    mockupData: MockupData | null;
    onGoBack: () => void;
    onAskMeryl: (query: string) => void;
}

interface MockupImage {
    id: number;
    url: string;
    type: string;
}

const staticContent = {
  title: "Awesome Graphic Design T-Shirt",
  description: "This high-quality t-shirt is a perfect blend of style and comfort. Featuring a unique, eye-catching design, it's sure to become your new favorite.\n\nKey Features:\n• 100% Premium Soft Cotton\n• Classic Unisex Fit\n• Durable, High-Quality Print\n• Eco-friendly inks",
  tags: ["custom shirt", "graphic tee", "vintage shirt", "designer top", "gift for him", "gift for her", "aesthetic clothing", "unique gift", "funny shirt", "retro design", "minimalist", "modern art", "cool tee"]
};

export const ListingGeneratorPanel: React.FC<ListingGeneratorPanelProps> = ({ mockupData, onGoBack, onAskMeryl }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [price, setPrice] = useState('24.99');
    const [coverImageId, setCoverImageId] = useState(1);
    const [mockups, setMockups] = useState<MockupImage[]>([]);

    const [isLoading, setIsLoading] = useState({ title: false, description: false, tags: false });
    
    const fallbackToStatic = (fieldType: 'title' | 'description' | 'tags' | 'all') => {
        if (fieldType === 'title' || fieldType === 'all') setTitle(staticContent.title);
        if (fieldType === 'description' || fieldType === 'all') setDescription(staticContent.description);
        if (fieldType === 'tags' || fieldType === 'all') setTags(staticContent.tags);
    };


    const handleRegenerate = async (fieldType: 'title' | 'description' | 'tags') => {
        if (!title && fieldType !== 'title') {
            alert("Please generate a title first to provide context.");
            return;
        }
        setIsLoading(prev => ({ ...prev, [fieldType]: true }));

        try {
            if (!process.env.API_KEY) {
              throw new Error("API_KEY not configured.");
            }

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            let prompt = '';
            
            const context = `The product is a ${mockupData?.productType} featuring a design described as: "${title}".`;

            switch(fieldType) {
                case 'title':
                    prompt = `You are a marketing expert for a print-on-demand store. The current product title is "${title}". Generate a new, single, catchy, and SEO-optimized title. The title should be under 80 characters. Do not use quotes or any prefix like "New Title:".`;
                    break;
                case 'description':
                    prompt = `You are a marketing expert for a print-on-demand store. ${context} Write a compelling and SEO-optimized product description. It should be engaging, include bullet points for key features (like 100% cotton, unisex fit), and end with a call to action. Do not wrap the output in markdown.`;
                    break;
                case 'tags':
                    prompt = `You are an SEO expert for Etsy and Shopify. ${context} Generate a list of 13 relevant, high-traffic tags. The output must be a single, valid JSON array of strings, like ["tag one", "tag two"]. The entire response must be ONLY the JSON array. It must start with '[' and end with ']'. Do not include any other text, explanations, or markdown formatting.`;
                    break;
            }

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-preview-04-17',
                contents: prompt,
                 config: {
                    responseMimeType: fieldType === 'tags' ? "application/json" : undefined,
                },
            });
            
            const text = response.text;

            switch(fieldType) {
                case 'title':
                    setTitle(text.replace(/"/g, ''));
                    break;
                case 'description':
                    setDescription(text);
                    break;
                case 'tags':
                    let jsonStr = text.trim();
                    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
                    const match = jsonStr.match(fenceRegex);
                    if (match && match[2]) {
                        jsonStr = match[2].trim();
                    }
                    const parsedTags = JSON.parse(jsonStr);
                    if(Array.isArray(parsedTags)) {
                        setTags(parsedTags);
                    }
                    break;
            }

        } catch (error: any) {
            console.error(`Error regenerating ${fieldType}:`, error);
            if (error.message?.includes('RESOURCE_EXHAUSTED') || error.status === 429) {
                console.warn(`API quota exceeded. Falling back to static ${fieldType}.`);
                fallbackToStatic(fieldType);
            } else {
                alert(`Failed to regenerate ${fieldType}. Please check the console for details.`);
            }
        } finally {
            setIsLoading(prev => ({ ...prev, [fieldType]: false }));
        }
    };

    useEffect(() => {
        if (mockupData) {
            const initialMockups: MockupImage[] = [
                { id: 1, url: mockupData.mockupUrl, type: 'Main' },
                { id: 2, url: 'https://picsum.photos/seed/lifestyle1/800', type: 'Lifestyle' },
                { id: 3, url: 'https://picsum.photos/seed/flatlay1/800', type: 'Flat Lay' },
                { id: 4, url: 'https://picsum.photos/seed/detail1/800', type: 'Detail' },
            ];
            setMockups(initialMockups);

            const generateInitialContent = async () => {
                if (!mockupData || (title && description && tags.length > 0)) return;
                
                setIsLoading({ title: true, description: true, tags: true });

                try {
                    if (!process.env.API_KEY) {
                        throw new Error("API_KEY not configured.");
                    }
                    
                    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                    const prompt = `You are a marketing and SEO expert for a print-on-demand store. I have a new product: a ${mockupData.productType}. The design is modern and trendy (imagine a popular style like vintage or minimalist).
                    
                    Generate all the necessary listing information for this product.
                    
                    Your response must be a single, valid JSON object. The entire response must be ONLY the JSON object. It must start with '{' and end with '}'. Do NOT include any other text, explanations, or markdown formatting like \`\`\`json.
                    
                    The JSON object must have these three keys: "title", "description", and "tags".
                    
                    - "title": A string. A catchy, SEO-friendly title under 80 characters.
                    - "description": A string. An engaging product description. Use newline characters (\\n) for paragraphs and to create a bulleted list of features.
                    - "tags": An array of 13 strings. These should be relevant, high-traffic keywords for platforms like Etsy.`;
                    
                    const response = await ai.models.generateContent({
                        model: 'gemini-2.5-flash-preview-04-17',
                        contents: prompt,
                        config: { responseMimeType: "application/json" },
                    });

                    let jsonStr = response.text.trim();
                    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
                    const match = jsonStr.match(fenceRegex);
                    if (match && match[2]) {
                      jsonStr = match[2].trim();
                    }
                    const parsedData = JSON.parse(jsonStr);

                    if (parsedData.title && parsedData.description && Array.isArray(parsedData.tags)) {
                        setTitle(parsedData.title);
                        setDescription(parsedData.description);
                        setTags(parsedData.tags.slice(0, 13));
                    } else {
                        throw new Error("Invalid JSON structure from API");
                    }
                } catch (error: any) {
                    console.error("Error generating initial content:", error);
                    if (error.message?.includes('RESOURCE_EXHAUSTED') || error.status === 429 || error.message.includes("API_KEY not configured")) {
                        console.warn("API issue detected. Falling back to static content for listing generator.");
                        fallbackToStatic('all');
                    }
                } finally {
                    setIsLoading({ title: false, description: false, tags: false });
                }
            };
            generateInitialContent();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mockupData]);

    if (!mockupData) {
        return (
            <div className="listing-generator-panel centered-message">
                <h2>Go to the Mockup Studio to create a product first.</h2>
                <button className="primary-btn" onClick={onGoBack}>
                    <ArrowLeftIcon /> Back to Mockup Studio
                </button>
            </div>
        );
    }
    
    const coverImage = mockups.find(m => m.id === coverImageId) || mockups[0];

    return (
        <div className="listing-generator-panel">
            <header className="listing-generator-header">
                <button className="back-btn" onClick={onGoBack}>
                    <ArrowLeftIcon /> Back to Mockup Studio
                </button>
                <div className="header-content">
                    <h1>AI Listing Generator</h1>
                    <p>Fine-tune your product details, then publish to your stores.</p>
                </div>
                <AskMerylButton
                    query="How can I improve my product listings to sell more?"
                    onClick={onAskMeryl}
                />
            </header>

            <div className="listing-content-layout">
                <aside className="listing-gallery-column">
                    <div className="main-mockup-container">
                        {coverImage && <img src={coverImage.url} alt="Main product mockup" className="main-mockup-image" />}
                         {isLoading.title && <div className="skeleton-overlay">Generating...</div>}
                    </div>
                    <div className="mockup-thumbnails">
                        {mockups.map(mockup => (
                            <div
                                key={mockup.id}
                                className={`thumbnail-container ${coverImageId === mockup.id ? 'active' : ''}`}
                                onClick={() => setCoverImageId(mockup.id)}
                                role="button"
                                aria-label={`Select ${mockup.type} as cover image`}
                            >
                                <img src={mockup.url} alt={`${mockup.type} mockup thumbnail`} />
                                {coverImageId === mockup.id && <div className="thumbnail-overlay"><PinIcon /></div>}
                            </div>
                        ))}
                        <button className="thumbnail-container add-mockup-btn" title="Generate more mockups (Coming soon!)">
                            <LightBulbIcon />
                            <span>AI Mockups</span>
                        </button>
                    </div>
                </aside>

                <main className="listing-details-column">
                    <div className="listing-form">
                        <div className="form-field">
                            <label htmlFor="title-input">Title</label>
                            <div className="input-with-button">
                                <input id="title-input" type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Cute Cat Astronaut T-Shirt" disabled={isLoading.title} />
                                {isLoading.title && <div className="skeleton-image" style={{height: '2rem', position: 'absolute', top: '0.5rem', left: '0.5rem', right: '3.5rem'}}></div>}
                                <button className="tool-button" onClick={() => handleRegenerate('title')} disabled={isLoading.title}>
                                    {isLoading.title ? <div className="loading-spinner mini-spinner"></div> : <ArrowPathIcon />}
                                </button>
                            </div>
                        </div>

                        <div className="form-field">
                            <label htmlFor="description-input">Description</label>
                            <div className="input-with-button">
                                <textarea id="description-input" value={description} onChange={e => setDescription(e.target.value)} rows={8} placeholder="A compelling product description..." disabled={isLoading.description} />
                                {isLoading.description && <div className="skeleton-image" style={{height: '10rem', position: 'absolute', top: '0.5rem', left: '0.5rem', right: '3.5rem'}}></div>}
                                <button className="tool-button" onClick={() => handleRegenerate('description')} disabled={isLoading.description || !title}>
                                    {isLoading.description ? <div className="loading-spinner mini-spinner"></div> : <ArrowPathIcon />}
                                </button>
                            </div>
                        </div>

                        <div className="form-field">
                            <label>Tags</label>
                            <div className="input-with-button">
                                <div className="tags-container">
                                    {isLoading.tags && tags.length === 0 && <div className="skeleton-image" style={{height: '4rem', width: '100%'}}></div>}
                                    {tags.map((tag, index) => (
                                        <div key={index} className="tag-item">
                                            {tag}
                                            <button onClick={() => setTags(tags.filter((_, i) => i !== index))}>
                                                <TrashIcon />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <button className="tool-button" onClick={() => handleRegenerate('tags')} disabled={isLoading.tags || !title}>
                                    {isLoading.tags ? <div className="loading-spinner mini-spinner"></div> : <ArrowPathIcon />}
                                </button>
                            </div>
                        </div>

                        <div className="form-field">
                            <label htmlFor="price-input">Price</label>
                            <div className="input-with-icon">
                                <CurrencyDollarIcon />
                                <input id="price-input" type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} />
                            </div>
                        </div>
                    </div>

                    <div className="listing-actions">
                        <button className="primary-btn publish-btn" onClick={() => alert('Publishing to connected stores... (Demo)')}>
                            <ArrowUpOnSquareIcon /> Publish
                        </button>
                    </div>
                </main>
            </div>
        </div>
    );
};