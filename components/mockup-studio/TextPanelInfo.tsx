/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ChatBubbleLeftEllipsisIcon } from '../icons';
import { TextLayer, TextTemplate } from '../../types';

interface TextPanelProps {
    onAddText: () => void;
    onAddTextFromTemplate: (template: TextTemplate) => void;
    selectedTextLayer: TextLayer | undefined;
    onUpdateTextLayer: (id: string, updates: Partial<TextLayer>) => void;
}

const fonts = ['Inter', 'Bebas Neue', 'Lobster', 'Pacifico', 'Roboto', 'Source Code Pro', 'Anton', 'Oswald'];
const colors = ['#000000', '#FFFFFF', '#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

const textTemplates: TextTemplate[] = [
    {
      name: 'Arc Up',
      content: 'YOUR TEXT',
      fontFamily: 'Anton',
      fontSize: 60,
      fontWeight: '400',
      fontStyle: 'normal',
      color: '#333333',
      path: { type: 'arc-up', amount: 50 },
      letterSpacing: 2,
    },
    {
      name: 'Arc Down',
      content: 'CURVED',
      fontFamily: 'Anton',
      fontSize: 60,
      fontWeight: '400',
      fontStyle: 'normal',
      color: '#333333',
      path: { type: 'arc-down', amount: 50 },
      letterSpacing: 2,
    },
    {
      name: 'Circle Text',
      content: '• AROUND • THE • WORLD •',
      fontFamily: 'Inter',
      fontSize: 30,
      fontWeight: '700',
      fontStyle: 'normal',
      color: '#333333',
      path: { type: 'circle', amount: 100 }, // amount is radius here
      letterSpacing: 5,
    },
    {
      name: '3D Retro',
      content: 'RETRO',
      fontFamily: 'Bebas Neue',
      fontSize: 90,
      fontWeight: '400',
      fontStyle: 'normal',
      color: '#FBBF24',
      textShadow: '3px 3px 0 #EF4444, 6px 6px 0 #3B82F6',
      letterSpacing: 1,
    },
    {
      name: 'Neon Glow',
      content: 'NEON',
      fontFamily: 'Bebas Neue',
      fontSize: 90,
      fontWeight: '400',
      fontStyle: 'normal',
      color: '#FFFFFF',
      textShadow: '0 0 4px #fff, 0 0 10px #fff, 0 0 18px #EC4899, 0 0 25px #EC4899',
      letterSpacing: 1,
    },
    {
      name: 'Fire Gradient',
      content: 'HOT',
      fontFamily: 'Anton',
      fontSize: 100,
      fontWeight: '400',
      fontStyle: 'normal',
      color: 'transparent', // Important for gradient
      backgroundImage: 'linear-gradient(45deg, #FBBF24, #F87171, #F59E0B)',
      backgroundClip: 'text',
      letterSpacing: 1,
    },
    {
      name: 'Double Vision',
      content: 'DOUBLE',
      fontFamily: 'Inter',
      fontSize: 80,
      fontWeight: '700',
      fontStyle: 'normal',
      color: 'transparent',
      textShadow: '2px 2px 0 #3B82F6, -2px -2px 0 #F87171',
      letterSpacing: 1,
    },
    {
      name: 'Simple & Bold',
      content: 'BOLD',
      fontFamily: 'Inter',
      fontSize: 80,
      fontWeight: '700',
      fontStyle: 'normal',
      color: '#212121',
      letterSpacing: 0,
    },
];


export const TextPanel: React.FC<TextPanelProps> = ({ onAddText, onAddTextFromTemplate, selectedTextLayer, onUpdateTextLayer }) => {

    const handleUpdate = (updates: Partial<TextLayer>) => {
        if (selectedTextLayer) {
            onUpdateTextLayer(selectedTextLayer.id, updates);
        }
    };

    const hasSelection = !!selectedTextLayer;

    return (
        <>
            <h3 className="panel-content-header"><ChatBubbleLeftEllipsisIcon /> Text Tools</h3>
            
            <div className="property-group">
                <button className="primary-full-btn" onClick={onAddText}>Add new text</button>
            </div>
            
            <div className="property-group">
                <label>Style Library</label>
                <div className="text-style-library-grid">
                    {textTemplates.map(template => (
                        <div 
                            key={template.name} 
                            className="text-style-item" 
                            title={`Add "${template.name}" style`}
                            onClick={() => onAddTextFromTemplate(template)}
                        >
                            <span style={{
                                fontFamily: `'${template.fontFamily}', sans-serif`,
                                fontWeight: template.fontWeight,
                                fontStyle: template.fontStyle,
                                color: template.color,
                                textShadow: template.textShadow,
                                lineHeight: 1.1,
                                backgroundImage: template.backgroundImage,
                                backgroundClip: template.backgroundClip,
                                WebkitBackgroundClip: template.backgroundClip,
                                WebkitTextFillColor: template.backgroundImage ? 'transparent' : undefined,
                            }}>
                                {template.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="property-group" style={{opacity: hasSelection ? 1 : 0.5, borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginTop: '1.5rem'}}>
                <label>Font Style</label>
                <select 
                    className="property-select" 
                    value={selectedTextLayer?.fontFamily || 'Inter'} 
                    onChange={e => handleUpdate({ fontFamily: e.target.value })}
                    disabled={!hasSelection}
                >
                    {fonts.map(font => <option key={font} value={font}>{font}</option>)}
                </select>
                <div className="font-style-btns">
                    <button 
                        className={selectedTextLayer?.fontWeight === '700' ? 'active' : ''} 
                        onClick={() => handleUpdate({ fontWeight: selectedTextLayer?.fontWeight === '700' ? '400' : '700' })}
                        disabled={!hasSelection}
                        style={{fontWeight: 'bold'}}
                    >
                        Bold
                    </button>
                    <button 
                        className={selectedTextLayer?.fontStyle === 'italic' ? 'active' : ''} 
                        onClick={() => handleUpdate({ fontStyle: selectedTextLayer?.fontStyle === 'italic' ? 'normal' : 'italic' })}
                        disabled={!hasSelection}
                        style={{fontStyle: 'italic'}}
                    >
                        Italic
                    </button>
                </div>
            </div>

             <div className="property-group" style={{opacity: hasSelection ? 1 : 0.5}}>
                <label>Text Color</label>
                <div className="color-swatches">
                    {colors.map(c => (
                        <button 
                            key={c} 
                            className={`color-swatch ${selectedTextLayer?.color === c ? 'active' : ''}`}
                            style={{ backgroundColor: c }}
                            onClick={() => handleUpdate({ color: c, backgroundImage: undefined, backgroundClip: undefined })}
                            aria-label={`Select color ${c}`}
                            disabled={!hasSelection}
                        />
                    ))}
                </div>
            </div>

            <div className="property-group" style={{opacity: hasSelection ? 1 : 0.5}}>
                <label>Edit Text</label>
                 <textarea 
                    rows={3} 
                    value={selectedTextLayer?.content || ''} 
                    onChange={e => handleUpdate({ content: e.target.value })}
                    disabled={!hasSelection}
                />
            </div>
            
             <div className="property-group" style={{opacity: hasSelection ? 1 : 0.5}}>
                <label>Text Size</label>
                <input 
                    type="range" 
                    min="12" 
                    max="128" 
                    value={selectedTextLayer?.fontSize || 48} 
                    onChange={e => handleUpdate({ fontSize: parseInt(e.target.value, 10) })}
                    disabled={!hasSelection}
                />
            </div>
            
            <div className="property-group" style={{opacity: hasSelection ? 1 : 0.5}}>
                <label>Outline</label>
                <div className="input-grid-2">
                    <input type="color" value={selectedTextLayer?.outlineColor || '#ffffff'} onChange={e => handleUpdate({outlineColor: e.target.value})} disabled={!hasSelection}/>
                     <input type="number" value={selectedTextLayer?.outlineWidth || 0} min="0" max="10" onChange={e => handleUpdate({outlineWidth: parseInt(e.target.value, 10)})} disabled={!hasSelection} />
                </div>
            </div>
            
            <div className="property-group" style={{opacity: hasSelection && selectedTextLayer.path ? 1 : 0.5}}>
                <label>Shape</label>
                <div className="input-with-percent">
                     <input 
                        type="range" 
                        min="-100" 
                        max="100" 
                        value={selectedTextLayer?.path?.amount || 0} 
                        onChange={e => {
                            if (selectedTextLayer?.path) {
                                handleUpdate({ path: {...selectedTextLayer.path, amount: parseInt(e.target.value, 10)} });
                            }
                        }}
                        disabled={!hasSelection || !selectedTextLayer?.path}
                    />
                    <span>{selectedTextLayer?.path?.amount || 0}%</span>
                </div>
            </div>
        </>
    );
};