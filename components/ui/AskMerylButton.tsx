/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ChatBubbleLeftRightIcon } from '../icons';

interface AskMerylButtonProps {
    query: string;
    onClick: (query: string) => void;
    className?: string;
}

export const AskMerylButton: React.FC<AskMerylButtonProps> = ({ query, onClick, className }) => {
    return (
        <button className={`ask-meryl-btn ${className || ''}`} onClick={() => onClick(query)}>
            <ChatBubbleLeftRightIcon />
            Ask Meryl
        </button>
    );
};
