/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface HighlightTextProps {
  text: string;
  highlight: string;
}

export default function HighlightText({ text, highlight }: HighlightTextProps) {
  if (!highlight || !text) {
    return <span>{text}</span>;
  }

  // Safety escape for regex special characters
  const escapedHighlight = highlight.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escapedHighlight})`, 'gi'));

  return (
    <span>
      {parts.map((part, i) => {
        const isMatch = part.toLowerCase() === highlight.toLowerCase();
        return isMatch ? (
          <mark
            key={i}
            className="bg-amber-100 dark:bg-amber-955/65 text-amber-950 dark:text-amber-100 rounded-sm px-0.5 border-b border-amber-300 dark:border-amber-700 font-bold"
          >
            {part}
          </mark>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        );
      })}
    </span>
  );
}
