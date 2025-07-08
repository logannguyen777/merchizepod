/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LayersUpIcon } from '../icons';

export const LayersPanelInfo: React.FC = () => {
    return (
        <>
            <h3 className="panel-content-header"><LayersUpIcon /> Layers</h3>
            <div className="feature-placeholder">
                <LayersUpIcon className="feature-placeholder-icon" />
                <h4>Layer Management</h4>
                <p>Arrange, lock, and manage design layers. Coming soon!</p>
            </div>
        </>
    );
};
