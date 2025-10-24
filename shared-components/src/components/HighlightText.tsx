import React from 'react';

export interface HighlightTextProps {
  text: string;
  highlight: string;
  caseSensitive?: boolean;
}

/**
 * HighlightText Component
 *
 * Highlights matching text within a string. Useful for search results
 * to show users what matched their query.
 *
 * @example
 * ```tsx
 * <HighlightText text="Project Proposal.docx" highlight="project" />
 * // Renders: <mark>Project</mark> Proposal.docx
 * ```
 */
export const HighlightText: React.FC<HighlightTextProps> = ({
  text,
  highlight,
  caseSensitive = false,
}) => {
  if (!highlight || !highlight.trim()) {
    return <>{text}</>;
  }

  // Escape special regex characters in the highlight string
  const escapeRegex = (str: string) => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  const escapedHighlight = escapeRegex(highlight.trim());
  const flags = caseSensitive ? 'g' : 'gi';
  const regex = new RegExp(`(${escapedHighlight})`, flags);

  // Split text by matches
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, index) => {
        // Check if this part matches the highlight
        const isMatch = regex.test(part);
        regex.lastIndex = 0; // Reset regex for next test

        if (isMatch) {
          return (
            <mark
              key={index}
              style={{
                backgroundColor: '#fff3cd',
                color: '#222222',
                padding: '2px 0',
                borderRadius: '2px',
                fontWeight: 500,
              }}
            >
              {part}
            </mark>
          );
        }

        return <span key={index}>{part}</span>;
      })}
    </>
  );
};

export default HighlightText;
