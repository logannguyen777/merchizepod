/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
    RocketIcon, ArrowUpOnSquareIcon, ChatBubbleLeftEllipsisIcon, EyeIcon, 
    ArrowUturnLeftIcon, ArrowUturnRightIcon, PlusIcon, MinusIcon, 
    MagicWandIcon, SparklesIcon, TShirtIcon, LayersUpIcon
} from '../components/icons';
import { InspireButton } from '../components/ui/InspireButton';
import { AskMerylButton } from '../components/ui/AskMerylButton';
import { Artwork, MockupData, PremiumLibraryCategory, TextLayer, TextTemplate } from '../types';
import { AIGeneratorPanel } from '../components/mockup-studio/AIGeneratorPanel';
import { PremiumLibraryPanel } from '../components/mockup-studio/PremiumLibraryPanel';
import { UploadsPanel } from '../components/mockup-studio/UploadsPanel';
import { ProductPanelInfo } from '../components/mockup-studio/ProductPanelInfo';
import { TextPanel } from '../components/mockup-studio/TextPanelInfo';
import { LayersPanelInfo } from '../components/mockup-studio/LayersPanelInfo';
import { LayerPropertiesPanel } from '../components/mockup-studio/LayerPropertiesPanel';


// --- Helper Functions ---

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
    // NOTE: In a real-world scenario, you might need a CORS proxy to fetch images from external domains.
    // For this example, we assume images are either data URLs or from origins with permissive CORS policies (like picsum.photos).
    const response = await fetch(url);
    const blob = await response.blob();
    return new File([blob], fileName, { type: blob.type });
}


// --- Main Mockup Studio Panel ---

interface MockupStudioPanelProps {
    initialArtwork: Artwork | null;
    initialPrompt?: string;
    onContinueToListing: (mockupData: MockupData) => void;
    onSetImageForInspiration: (imageUrl: string) => void;
    onAskMeryl: (query: string) => void;
}

const premiumLibrary: PremiumLibraryCategory[] = [
    {
        name: 'Patterns',
        subCategories: [
            { name: 'Floral & Botanical', artworks: Array.from({ length: 20 }, (_, i) => ({ id: `p-floral-${i}`, url: `https://picsum.photos/seed/p-floral${i}/200` })) },
            { name: 'Geometric', artworks: Array.from({ length: 20 }, (_, i) => ({ id: `p-geo-${i}`, url: `https://picsum.photos/seed/p-geo${i}/200` })) },
            { name: 'Abstract', artworks: Array.from({ length: 20 }, (_, i) => ({ id: `p-abs-${i}`, url: `https://picsum.photos/seed/p-abs${i}/200` })) },
            { name: 'Animal Prints', artworks: Array.from({ length: 20 }, (_, i) => ({ id: `p-animal-${i}`, url: `https://picsum.photos/seed/p-animal${i}/200` })) },
            { name: 'Kids & Cute', artworks: Array.from({ length: 20 }, (_, i) => ({ id: `p-kids-${i}`, url: `https://picsum.photos/seed/p-kids${i}/200` })) },
        ]
    },
    {
        name: 'Graphics',
        subCategories: [
            { name: 'Cute Animals', artworks: Array.from({ length: 12 }, (_, i) => ({ id: `g-animal-${i}`, url: `https://picsum.photos/seed/g-animal${i}/200` })) },
            { name: 'Objects & Food', artworks: Array.from({ length: 12 }, (_, i) => ({ id: `g-object-${i}`, url: `https://picsum.photos/seed/g-object${i}/200` })) },
            { name: 'Holiday & Seasonal', artworks: Array.from({ length: 12 }, (_, i) => ({ id: `g-holiday-${i}`, url: `https://picsum.photos/seed/g-holiday${i}/200` })) },
            { name: 'Typography', artworks: Array.from({ length: 12 }, (_, i) => ({ id: `g-typo-${i}`, url: `https://picsum.photos/seed/g-typo${i}/200` })) },
        ]
    },
    {
        name: 'Photos',
        subCategories: [
            { name: 'Landscapes', artworks: Array.from({ length: 18 }, (_, i) => ({ id: `ph-land-${i}`, url: `https://picsum.photos/seed/ph-land${i}/200` })) },
            { name: 'Textures', artworks: Array.from({ length: 18 }, (_, i) => ({ id: `ph-tex-${i}`, url: `https://picsum.photos/seed/ph-tex${i}/200` })) },
        ]
    }
];

export const MockupStudioPanel: React.FC<MockupStudioPanelProps> = ({ initialArtwork, initialPrompt, onContinueToListing, onSetImageForInspiration, onAskMeryl }) => {
  const [product, setProduct] = useState('T-shirt');
  const [productColor, setProductColor] = useState('#ffffff');
  const [zoom, setZoom] = useState(1);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(initialArtwork ? 'artwork' : null);
  const [artworkOnCanvas, setArtworkOnCanvas] = useState<Artwork | null>(null);
  const [artworkTransform, setArtworkTransform] = useState({
      x: 150, y: 100, scale: 0.5, rotation: 0, opacity: 1,
  });
  const [backgroundState, setBackgroundState] = useState<'normal' | 'removing' | 'removed'>('normal');
  const [originalArtwork, setOriginalArtwork] = useState<Artwork | null>(null); // New state to hold original image for restore
  const [textLayers, setTextLayers] = useState<TextLayer[]>([]);

  // Left Panel State
  const [openedPanel, setOpenedPanel] = useState<string | null>('Premium');
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [isLoadingArtworks, setIsLoadingArtworks] = useState(false);
  const [userUploadedArtworks, setUserUploadedArtworks] = useState<Artwork[]>([]);
  
  // AI Generation options
  const [prompt, setPrompt] = useState(initialPrompt || 'A cute cat astronaut on a skateboard');
  const [generationType, setGenerationType] = useState<'graphic' | 'pattern'>('graphic');
  const [activeStyle, setActiveStyle] = useState('Vector');
  
  // Artwork Library options
  const [artworkCategory, setArtworkCategory] = useState<'Patterns' | 'Graphics' | 'Photos'>('Patterns');
  const [visibleCounts, setVisibleCounts] = useState<{ [key: string]: number }>({});


  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({x: 0, y: 0});
  const layerStartPos = useRef({x: 0, y: 0});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const productTemplates: { [key: string]: { [color: string]: string } } = {
      'T-shirt': {
        '#ffffff': 'https://unblast.com/wp-content/uploads/2023/10/Blank-T-shirt-Mockup-PSD.jpg',
        '#1f2937': 'https://assets.codepen.io/134441/t-shirt-black.png',
        '#6b7280': 'https://assets.codepen.io/134441/t-shirt-grey.png',
        '#ef4444': 'https://assets.codepen.io/134441/t-shirt-red.png',
        '#3b82f6': 'https://assets.codepen.io/134441/t-shirt-blue.png',
        '#10b981': 'https://assets.codepen.io/134441/t-shirt-green.png',
      },
      'Hoodie': { '#ffffff': 'https://assets.codepen.io/134441/hoodie.png' },
      'Mug': { '#ffffff': 'https://assets.codepen.io/134441/mug.png' },
  };

  const handleArtworkSelect = (art: Artwork) => {
    setArtworkOnCanvas(art);
    setSelectedLayerId('artwork');
    setBackgroundState('normal'); // Reset effects when new art is chosen
    setOriginalArtwork(null); // Also clear any saved original state
  }

  useEffect(() => {
    if(initialArtwork) {
        handleArtworkSelect(initialArtwork);
        if (typeof initialArtwork.id === 'number') { // Only add AI-generated art to the list
            setArtworks(arts => [initialArtwork, ...arts.filter(a => a.id !== initialArtwork.id)]);
        }
    }
  }, [initialArtwork]);
  
  const handleGenerateArtworks = async () => {
    if (!prompt) return;
    setIsLoadingArtworks(true);
    
    const generationPrompt = generationType === 'pattern'
        ? `A beautiful, seamless, tileable pattern. The style is ${activeStyle}. The theme is: ${prompt}`
        : `A professional, high-quality POD (print on demand) t-shirt design graphic. The style is ${activeStyle}. The design is about: ${prompt}, vector style, transparent background.`;

    try {
        if (!process.env.API_KEY) {
            throw new Error("API_KEY not configured.");
        }
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateImages({
            model: 'imagen-3.0-generate-002',
            prompt: generationPrompt,
            config: { numberOfImages: 4, outputMimeType: 'image/png' },
        });

        const newArtworks = response.generatedImages.map((img, i) => ({
            id: Date.now() + i,
            url: `data:image/png;base64,${img.image.imageBytes}`,
        }));

        setArtworks(arts => [...newArtworks, ...arts]);
        if (!artworkOnCanvas) {
            handleArtworkSelect(newArtworks[0]);
        }
    } catch (error: any) {
        console.error("Error generating artwork in mockup studio:", error);
        if (error.message?.includes('RESOURCE_EXHAUSTED') || error.status === 429) {
            console.warn("API quota exceeded. Falling back to placeholder images.");
        }
        const encodedPrompt = encodeURIComponent(prompt.split(' ').slice(0, 5).join(','));
        const fallbackArtworks = [...Array(4)].map((_, i) => ({
            id: Date.now() + i,
            url: `https://picsum.photos/seed/${encodedPrompt}${i}/512`,
        }));
        setArtworks(arts => [...fallbackArtworks, ...arts]);
        if (!artworkOnCanvas) {
            handleArtworkSelect(fallbackArtworks[0]);
        }
    } finally {
        setIsLoadingArtworks(false);
    }
  };

  const handleToggleBgRemoval = async () => {
    if (backgroundState === 'removing' || !artworkOnCanvas) return;

    // This is now the "Restore" functionality
    if (backgroundState === 'removed' && originalArtwork) {
        setArtworkOnCanvas(originalArtwork);
        setOriginalArtwork(null);
        setBackgroundState('normal');
        return;
    }

    // This is the "Remove Background" functionality
    setBackgroundState('removing');
    setOriginalArtwork(artworkOnCanvas); // Save the original artwork for restoration

    try {
        if (!process.env.API_KEY) {
            throw new Error("API Key not configured.");
        }
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        // 1. Convert image to a file part Gemini can understand
        const imageFile = await imageUrlToFile(artworkOnCanvas.url, 'artwork-to-edit.png');
        const imagePart = await fileToGenerativePart(imageFile);

        // 2. Use AI to get a description of the main subject
        const descriptionPrompt = "Analyze this image and provide a short, descriptive phrase of the main subject, suitable for a text-to-image prompt. Focus only on the foreground subject. Be specific. For example: 'a cute cartoon corgi wearing a party hat'.";
        const descriptionResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-04-17',
            contents: { parts: [imagePart, { text: descriptionPrompt }] },
        });
        const subjectDescription = descriptionResponse.text;

        // 3. Use the description to generate a new image with a transparent background
        const generationPrompt = `A professional, high-quality POD (print on demand) t-shirt design graphic, vector art style, on a transparent background. The design should be a clean re-creation of: ${subjectDescription}`;
        const imageResponse = await ai.models.generateImages({
            model: 'imagen-3.0-generate-002',
            prompt: generationPrompt,
            config: { numberOfImages: 1, outputMimeType: 'image/png' },
        });

        if (imageResponse.generatedImages.length > 0) {
            const newArtwork: Artwork = {
                id: `bg-removed-${Date.now()}`,
                url: `data:image/png;base64,${imageResponse.generatedImages[0].image.imageBytes}`,
            };
            setArtworkOnCanvas(newArtwork);
            setBackgroundState('removed');
        } else {
            throw new Error("AI failed to generate a new image.");
        }

    } catch (error: any) {
        console.error("Error removing background with AI:", error);
        let alertMessage = `Sorry, the AI background removal failed. Restoring original image. Error: ${(error as Error).message}`;
        if (error.message?.includes('RESOURCE_EXHAUSTED') || error.status === 429) {
            alertMessage = "AI is experiencing high demand. Please try again later. Restoring original image."
        }
        alert(alertMessage);
        // Restore original state on failure
        if (originalArtwork) {
            setArtworkOnCanvas(originalArtwork);
        }
        setBackgroundState('normal');
    }
  };

  useEffect(() => {
      if (initialPrompt && !initialArtwork) {
          setPrompt(initialPrompt);
          setOpenedPanel('AI Generator');
          handleGenerateArtworks();
      }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPrompt, initialArtwork]);
  
  const handleNavClick = (panelName: string) => {
    setOpenedPanel(current => (current === panelName ? null : panelName));
     if (panelName === 'Product') {
        setSelectedLayerId('product');
    }
  };

  const currentProductImage = productTemplates[product]?.[productColor] || productTemplates[product]['#ffffff'];

  const handleLayerMouseDown = (e: React.MouseEvent<HTMLElement | SVGSVGElement>, id: string) => {
      e.preventDefault(); e.stopPropagation();
      setSelectedLayerId(id);
      setIsDragging(true);
      dragStartPos.current = { x: e.clientX / zoom, y: e.clientY / zoom };
      
      if (id === 'artwork') {
          layerStartPos.current = { x: artworkTransform.x, y: artworkTransform.y };
      } else {
          const textLayer = textLayers.find(l => l.id === id);
          if (textLayer) {
              layerStartPos.current = { x: textLayer.x, y: textLayer.y };
          }
      }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isDragging || !selectedLayerId) return;
      const dx = (e.clientX / zoom) - dragStartPos.current.x;
      const dy = (e.clientY / zoom) - dragStartPos.current.y;
      
      const newX = layerStartPos.current.x + dx;
      const newY = layerStartPos.current.y + dy;

      if (selectedLayerId === 'artwork') {
          setArtworkTransform(prev => ({ ...prev, x: newX, y: newY }));
      } else {
          setTextLayers(prev => prev.map(l => l.id === selectedLayerId ? {...l, x: newX, y: newY} : l));
      }
  };

  const handleMouseUp = () => setIsDragging(false);

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  const handleContinue = () => {
      if (!artworkOnCanvas && textLayers.length === 0) {
          alert('Please add an artwork or text to your design first!');
          return;
      }
      const mockupData: MockupData = {
          productType: product,
          artworkUrl: artworkOnCanvas?.url || '', // This would need to be a composite image in a real app
          mockupUrl: currentProductImage
      };
      onContinueToListing(mockupData);
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
            const newArtwork: Artwork = {
                id: `user-${Date.now()}`,
                url: e.target.result as string,
            };
            setUserUploadedArtworks(prev => [newArtwork, ...prev]);
            handleArtworkSelect(newArtwork);
        }
      };
      reader.readAsDataURL(file);
    }
    if(event.target) {
      event.target.value = '';
    }
  };
  
  const handleAddTextFromTemplate = (template: TextTemplate) => {
    const newTextLayer: TextLayer = {
        id: `text-${Date.now()}`,
        content: template.content,
        fontFamily: template.fontFamily,
        fontSize: template.fontSize,
        fontWeight: template.fontWeight,
        fontStyle: template.fontStyle,
        color: template.color,
        textShadow: template.textShadow,
        path: template.path,
        letterSpacing: template.letterSpacing,
        backgroundImage: template.backgroundImage,
        backgroundClip: template.backgroundClip,
        // Default properties for a new layer
        outlineColor: '#000000',
        outlineWidth: 0,
        x: 150,
        y: 200,
        scale: 0.5,
        rotation: 0,
        opacity: 1,
    };
    setTextLayers(prev => [...prev, newTextLayer]);
    setSelectedLayerId(newTextLayer.id);
  };
    
  const handleAddText = () => {
        handleAddTextFromTemplate({
            name: 'Default',
            content: 'Your Text Here',
            fontFamily: 'Inter',
            fontSize: 48,
            fontWeight: '700',
            fontStyle: 'normal',
            color: '#333333',
            letterSpacing: 0
        });
    };

    const handleUpdateTextLayer = (id: string, updates: Partial<TextLayer>) => {
        setTextLayers(layers => layers.map(l =>
            l.id === id ? { ...l, ...updates } : l
        ));
    };

  const leftNavTabs = [
    { name: 'Product', icon: TShirtIcon },
    { name: 'Premium', icon: SparklesIcon },
    { name: 'AI Generator', icon: MagicWandIcon },
    { name: 'Uploads', icon: ArrowUpOnSquareIcon },
    { name: 'Text', icon: ChatBubbleLeftEllipsisIcon },
    { name: 'Layers', icon: LayersUpIcon },
  ];
   
  const renderLeftPanelContent = (panel: string) => {
      const selectedTextLayer = textLayers.find(l => l.id === selectedLayerId);
      switch(panel) {
          case 'Product':
              return <ProductPanelInfo />;
          case 'Premium':
              return <PremiumLibraryPanel
                premiumLibrary={premiumLibrary}
                artworkCategory={artworkCategory}
                onCategoryChange={setArtworkCategory}
                visibleCounts={visibleCounts}
                onSetVisibleCounts={setVisibleCounts}
                onArtworkSelect={handleArtworkSelect}
                onInspire={onSetImageForInspiration}
                selectedArtworkId={artworkOnCanvas?.id}
              />;
          case 'AI Generator':
              return <AIGeneratorPanel
                prompt={prompt}
                onPromptChange={setPrompt}
                generationType={generationType}
                onGenerationTypeChange={setGenerationType}
                activeStyle={activeStyle}
                onStyleChange={setActiveStyle}
                isLoading={isLoadingArtworks}
                onGenerate={handleGenerateArtworks}
                artworks={artworks}
                onArtworkSelect={handleArtworkSelect}
                onInspire={onSetImageForInspiration}
                selectedArtworkId={artworkOnCanvas?.id}
              />;
          case 'Uploads':
              return <UploadsPanel
                  userUploadedArtworks={userUploadedArtworks}
                  onUploadClick={handleUploadClick}
                  onArtworkSelect={handleArtworkSelect}
                  onInspire={onSetImageForInspiration}
                  selectedArtworkId={artworkOnCanvas?.id}
              />;
          case 'Text':
              return <TextPanel
                onAddText={handleAddText}
                onAddTextFromTemplate={handleAddTextFromTemplate}
                selectedTextLayer={selectedTextLayer}
                onUpdateTextLayer={handleUpdateTextLayer}
               />;
          case 'Layers':
              return <LayersPanelInfo />;
          default:
              return null;
      }
  }

    const getArcPath = (layer: TextLayer, width: number): string => {
        const amount = layer.path?.amount || 0;
        const isReversed = layer.path?.type === 'arc-down';
        if (amount === 0) {
            return `M 0,${width/2} L ${width},${width/2}`;
        }
        const r = width / 2 / (Math.sin(Math.abs(amount) / 100 * (Math.PI / 2)));
        const sweepFlag = isReversed ? (amount > 0 ? 0 : 1) : (amount > 0 ? 1 : 0);
        const yOffset = r - Math.sqrt(r*r - (width/2)*(width/2));
        
        if(isReversed) {
            return `M ${width},${yOffset} A ${r},${r} 0 0,${sweepFlag} 0,${yOffset}`;
        }
        return `M 0,${yOffset} A ${r},${r} 0 0,${sweepFlag} ${width},${yOffset}`;
    };

    const getCirclePath = (layer: TextLayer): string => {
        const radius = layer.path?.amount || 100;
        const cx = radius;
        const cy = radius;
        return `M ${cx - radius}, ${cy} A ${radius},${radius} 0 1,1 ${cx + radius - 0.01},${cy}`;
    };

    const isStaticArtwork = typeof artworkOnCanvas?.id === 'string' && artworkOnCanvas.id.startsWith('p-');
    const selectedTextLayer = textLayers.find(l => l.id === selectedLayerId);
  
  return (
    <div className={`mockup-studio ${openedPanel ? 'panel-open' : ''}`}>
        <div className="mockup-studio-left-panel-container">
            <nav className="mockup-studio-icon-nav">
                <ul className="mockup-nav-menu">
                    {leftNavTabs.map(tool => (
                        <li key={tool.name}>
                            <a 
                                href="#"
                                className={`mockup-nav-link ${openedPanel === tool.name ? 'active' : ''}`} 
                                onClick={(e) => { e.preventDefault(); handleNavClick(tool.name); }}
                                title={tool.name}
                            >
                                <tool.icon/>
                                <span className="mockup-nav-text">{tool.name}</span>
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="mockup-studio-content-panel">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    accept="image/png, image/jpeg, image/webp"
                />
                {openedPanel && renderLeftPanelContent(openedPanel)}
            </div>
        </div>
        
        <main className="mockup-studio-canvas-area" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
            <div className="canvas-toolbar">
                <div className="toolbar-group-left">
                     <button className="tool-button"><ArrowUturnLeftIcon/></button>
                     <button className="tool-button"><ArrowUturnRightIcon/></button>
                     <div className="divider"></div>
                     <AskMerylButton query="How do I use the Mockup Studio?" onClick={onAskMeryl}/>
                </div>
                <div className="toolbar-group-center">
                    <span className="file-name">{product} Mockup</span>
                </div>
                <div className="toolbar-group-right">
                    <button className="tool-button"><EyeIcon/> Preview</button>
                    <button className="primary-btn" onClick={handleContinue}>
                        <RocketIcon/> Continue
                    </button>
                </div>
            </div>

            <div className="canvas-workspace" onClick={() => setSelectedLayerId('product')}>
                <div className="canvas-zoom-container" style={{ transform: `scale(${zoom})` }}>
                    <div className="mockup-container">
                        <img src={currentProductImage} alt={`${product} mockup`} className="product-layer" />
                        {artworkOnCanvas && (
                            <div 
                                className={`artwork-layer ${selectedLayerId === 'artwork' ? 'selected' : ''} ${backgroundState === 'removing' ? 'removing-background' : ''}`}
                                style={{
                                    top: `${artworkTransform.y}px`,
                                    left: `${artworkTransform.x}px`,
                                    width: `${200 * artworkTransform.scale}px`,
                                    height: `${200 * artworkTransform.scale}px`,
                                    transform: `rotate(${artworkTransform.rotation}deg)`,
                                    opacity: artworkTransform.opacity,
                                    cursor: isDragging ? 'grabbing' : 'grab',
                                }}
                                onMouseDown={(e) => handleLayerMouseDown(e, 'artwork')}
                            >
                                <InspireButton onClick={() => onSetImageForInspiration(artworkOnCanvas.url)} />
                                <img 
                                    src={artworkOnCanvas.url} 
                                    alt="user design" 
                                    className="artwork-image"
                                />
                            </div>
                        )}
                        {textLayers.map(layer => {
                            const containerWidth = 400; // Base width for text container
                            const layerStyle: React.CSSProperties = {
                                top: `${layer.y}px`,
                                left: `${layer.x}px`,
                                transform: `scale(${layer.scale}) rotate(${layer.rotation}deg)`,
                                opacity: layer.opacity,
                                cursor: isDragging ? 'grabbing' : 'grab',
                            };

                            if (layer.path) {
                                const pathId = `path-${layer.id}`;
                                const pathWidth = layer.path.type === 'circle' ? (layer.path.amount || 100) * 2 : containerWidth;
                                const pathHeight = layer.path.type === 'circle' ? (layer.path.amount || 100) * 2 : containerWidth;
                                const svgPath = layer.path.type === 'circle' ? getCirclePath(layer) : getArcPath(layer, pathWidth);

                                return (
                                    <svg
                                        key={layer.id}
                                        className={`text-layer-svg ${selectedLayerId === layer.id ? 'selected' : ''}`}
                                        style={{...layerStyle, width: pathWidth, height: pathHeight}}
                                        viewBox={`0 0 ${pathWidth} ${pathHeight}`}
                                        onMouseDown={(e) => handleLayerMouseDown(e, layer.id)}
                                    >
                                        <defs>
                                            <path id={pathId} d={svgPath} fill="none" />
                                        </defs>
                                        <text
                                            style={{
                                                '--font-weight': layer.fontWeight,
                                                '--font-style': layer.fontStyle,
                                                '--font-family-name': `'${layer.fontFamily}', sans-serif`,
                                                '--letter-spacing': `${layer.letterSpacing}px`,
                                                '--fill-color': layer.color,
                                            } as React.CSSProperties}
                                            fontSize={layer.fontSize}
                                        >
                                            <textPath href={`#${pathId}`} startOffset="50%">{layer.content}</textPath>
                                        </text>
                                    </svg>
                                );
                            } else {
                                return (
                                    <div
                                        key={layer.id}
                                        className={`text-layer ${selectedLayerId === layer.id ? 'selected' : ''} ${layer.backgroundImage ? 'gradient-text' : ''}`}
                                        style={{
                                            ...layerStyle,
                                            color: layer.color,
                                            fontFamily: `'${layer.fontFamily}', sans-serif`,
                                            fontSize: `${layer.fontSize}px`,
                                            fontWeight: layer.fontWeight,
                                            fontStyle: layer.fontStyle,
                                            letterSpacing: `${layer.letterSpacing}px`,
                                            textShadow: layer.textShadow,
                                            backgroundImage: layer.backgroundImage,
                                            WebkitBackgroundClip: layer.backgroundClip,
                                            backgroundClip: layer.backgroundClip,
                                        }}
                                        onMouseDown={(e) => handleLayerMouseDown(e, layer.id)}
                                    >
                                        {layer.content}
                                    </div>
                                );
                            }
                        })}
                    </div>
                </div>
            </div>
            
            <div className="canvas-controls">
                <button className="tool-button" onClick={() => setZoom(z => Math.max(0.2, z - 0.1))}><MinusIcon/></button>
                <input type="range" min="20" max="200" value={zoom * 100} onChange={e => setZoom(parseInt(e.target.value, 10) / 100)} />
                <button className="tool-button" onClick={() => setZoom(z => Math.min(3, z + 0.1))}><PlusIcon/></button>
                <span className="zoom-percentage">{Math.round(zoom * 100)}%</span>
            </div>
        </main>

        <LayerPropertiesPanel
            selectedLayerId={selectedLayerId}
            product={product}
            setProduct={setProduct}
            productColor={productColor}
            setProductColor={setProductColor}
            artworkTransform={artworkTransform}
            setArtworkTransform={setArtworkTransform}
            textLayers={textLayers}
            onUpdateTextLayer={handleUpdateTextLayer}
            onReplaceArtwork={() => setOpenedPanel('Premium')}
            onGenerateSimilar={handleGenerateArtworks}
            isStaticArtwork={isStaticArtwork}
            backgroundState={backgroundState}
            onToggleBgRemoval={handleToggleBgRemoval}
        />
    </div>
  );
}