/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
    RocketIcon, SparklesIcon, MagicWandIcon, LockClosedIcon, 
    PaintBrushIcon, EraseIcon
} from '../icons';
import { TextLayer } from '../../types';

interface LayerPropertiesPanelProps {
    selectedLayerId: string | null;
    // Product props
    product: string;
    setProduct: (p: string) => void;
    productColor: string;
    setProductColor: (c: string) => void;
    // Artwork props
    artworkTransform: { x: number, y: number, scale: number, rotation: number, opacity: number };
    setArtworkTransform: React.Dispatch<React.SetStateAction<any>>;
    onReplaceArtwork: () => void;
    onGenerateSimilar: () => void;
    isStaticArtwork: boolean;
    backgroundState: 'normal' | 'removing' | 'removed';
    onToggleBgRemoval: () => void;
    // Text props
    textLayers: TextLayer[];
    onUpdateTextLayer: (id: string, updates: Partial<TextLayer>) => void;
}

const ProductProperties = ({ color, setColor, product, setProduct }) => {
    const colors = ['#ffffff', '#1f2937', '#6b7280', '#ef4444', '#3b82f6', '#10b981'];
    return (
        <>
            <div className="property-group">
                <label>Product Type</label>
                <select className="property-select" value={product} onChange={e => setProduct(e.target.value)}>
                    <option>T-shirt</option>
                    <option>Hoodie</option>
                    <option>Mug</option>
                </select>
            </div>
            <div className="property-group">
                <label>Color</label>
                <div className="color-swatches">
                    {colors.map(c => (
                        <button 
                            key={c} 
                            className={`color-swatch ${color === c ? 'active' : ''}`}
                            style={{ backgroundColor: c }}
                            onClick={() => setColor(c)}
                            aria-label={`Select color ${c}`}
                        />
                    ))}
                </div>
            </div>
        </>
    );
};


const LayerProperties: React.FC<LayerPropertiesPanelProps> = (props) => {
    const isArtwork = props.selectedLayerId === 'artwork';
    const selectedTextLayer = props.textLayers.find(l => l.id === props.selectedLayerId);
    
    const currentTransform = isArtwork ? props.artworkTransform : selectedTextLayer;

    if (!currentTransform) {
        return (
            <div className="property-group">
                <p style={{color: 'var(--text-secondary)'}}>Select a layer from the canvas to see its properties.</p>
            </div>
        );
    }
    
    const setTransform = (updates: Partial<typeof currentTransform>) => {
        if (isArtwork) {
            props.setArtworkTransform(prev => ({...prev, ...updates}));
        } else if (selectedTextLayer) {
            props.onUpdateTextLayer(selectedTextLayer.id, updates as Partial<TextLayer>);
        }
    };

    return (
        <>
            <div className="property-group">
                <label>Position</label>
                <div className="input-grid-2">
                    <div className="input-field-with-label"><label>X</label><input type="number" value={Math.round(currentTransform.x)} onChange={e => setTransform({ x: parseInt(e.target.value,10)})} /></div>
                    <div className="input-field-with-label"><label>Y</label><input type="number" value={Math.round(currentTransform.y)} onChange={e => setTransform({ y: parseInt(e.target.value,10)})} /></div>
                </div>
            </div>
            <div className="property-group">
                <label>Size</label>
                <input type="range" min="10" max="200" value={currentTransform.scale * 100} onChange={e => setTransform({ scale: parseInt(e.target.value,10) / 100})} />
            </div>
            <div className="property-group">
                <label>Rotation</label>
                <input type="range" min="0" max="360" value={currentTransform.rotation} onChange={e => setTransform({ rotation: parseInt(e.target.value,10)})} />
            </div>
            <div className="property-group">
                <label>Opacity</label>
                <input type="range" min="0" max="100" value={currentTransform.opacity * 100} onChange={e => setTransform({ opacity: parseInt(e.target.value,10) / 100})} />
            </div>

            {selectedTextLayer && (
                <>
                    <div className="property-group">
                        <label>Letter Spacing</label>
                        <input type="range" min="-5" max="20" step="0.5" value={selectedTextLayer.letterSpacing} onChange={e => props.onUpdateTextLayer(selectedTextLayer.id, { letterSpacing: parseFloat(e.target.value)})} />
                    </div>
                    {selectedTextLayer.path && (
                        <div className="property-group">
                            <label>{selectedTextLayer.path.type === 'circle' ? 'Circle Radius' : 'Curve Amount'}</label>
                            <div className="input-with-percent">
                                <input 
                                    type="range" 
                                    min={selectedTextLayer.path.type === 'circle' ? 50 : -100} 
                                    max={selectedTextLayer.path.type === 'circle' ? 200 : 100} 
                                    value={selectedTextLayer.path.amount} 
                                    onChange={e => props.onUpdateTextLayer(selectedTextLayer.id, { path: { ...selectedTextLayer.path, amount: parseInt(e.target.value, 10) }})}
                                />
                                <span>{selectedTextLayer.path.amount}</span>
                            </div>
                        </div>
                    )}
                </>
            )}

            {isArtwork && (
             <>
                <div className="property-group">
                    <label>AI Background Tools</label>
                    <button 
                        className="secondary-full-btn" 
                        onClick={props.onToggleBgRemoval}
                        disabled={props.isStaticArtwork || props.backgroundState === 'removing'}
                    >
                        {props.backgroundState === 'removing' 
                            ? <><div className="loading-spinner mini-spinner" style={{marginRight: '0.5rem'}}></div> Removing...</>
                            : (props.backgroundState === 'removed' ? 'Restore Background' : 'AI Remove Background')
                        }
                    </button>
                    <div className="brush-tools-group">
                        <button className="secondary-full-btn" disabled>
                            <EraseIcon /> Erase
                        </button>
                        <button className="secondary-full-btn" disabled>
                            <PaintBrushIcon /> Restore
                        </button>
                    </div>
                    <small>The AI will regenerate the subject on a transparent background. Quality may vary.</small>
                </div>
                <div className="property-group button-group">
                    <button className="secondary-full-btn" onClick={props.onReplaceArtwork}><SparklesIcon /> Replace Artwork</button>
                    <button className="primary-full-btn" onClick={props.onGenerateSimilar} disabled={props.isStaticArtwork || props.backgroundState === 'removing'}>
                        {props.isStaticArtwork ? <><LockClosedIcon/> Static Art</> : <><MagicWandIcon /> Generate Similar</>}
                    </button>
                </div>
             </>
            )}
        </>
    );
};


export const LayerPropertiesPanel: React.FC<LayerPropertiesPanelProps> = (props) => {
    const [activeTab, setActiveTab] = React.useState<'Product' | 'Layer'>('Layer');

    React.useEffect(() => {
        if (props.selectedLayerId === 'product') {
            setActiveTab('Product');
        } else if (props.selectedLayerId) {
            setActiveTab('Layer');
        }
    }, [props.selectedLayerId]);

    const handleTabClick = (tab: 'Product' | 'Layer') => {
        setActiveTab(tab);
        if (tab === 'Product') {
            props.setProduct(props.product); // This doesn't make sense, but it forces a selection change
        } else {
             if (!props.selectedLayerId || props.selectedLayerId === 'product') {
                const lastLayer = props.textLayers[props.textLayers.length - 1];
                // A bit of a hack to select a layer if none is selected
                if (lastLayer) props.onUpdateTextLayer(lastLayer.id, {});
                else if (props.artworkTransform) props.setArtworkTransform(props.artworkTransform);
            }
        }
    };

    const isLayerSelected = props.selectedLayerId !== null && props.selectedLayerId !== 'product';

    return (
        <aside className="mockup-studio-properties">
            <header className="properties-header">
                 <h3>
                    {activeTab === 'Product' ? 'Product Properties' : 'Layer Properties'}
                </h3>
            </header>
            <div className="properties-tabs">
                <button className={`prop-tab ${activeTab === 'Product' ? 'active' : ''}`} onClick={() => handleTabClick('Product')}>Product</button>
                <button className={`prop-tab ${activeTab === 'Layer' ? 'active' : ''}`} onClick={() => handleTabClick('Layer')} disabled={!isLayerSelected}>Layer</button>
            </div>
            <div className="properties-content">
                {activeTab === 'Product' &&
                    <ProductProperties color={props.productColor} setColor={props.setProductColor} product={props.product} setProduct={props.setProduct}/>
                }
                {activeTab === 'Layer' &&
                    <LayerProperties {...props} /> 
                }
            </div>
        </aside>
    );
};