/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { FireIcon } from '../icons';

interface TrendScoreProps {
  score: number;
}

export const TrendScore: React.FC<TrendScoreProps> = ({ score }) => {
  const maxScore = 5;
  return (
    <div className="trend-score" aria-label={`Trend score: ${score} out of ${maxScore}`}>
      {[...Array(maxScore)].map((_, i) => (
        <FireIcon key={i} className={i < score ? 'active' : ''} />
      ))}
    </div>
  );
};
