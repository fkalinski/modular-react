import React from 'react';

export type FileType = 'folder' | 'excel' | 'word' | 'powerpoint' | 'pdf' | 'image' | 'video' | 'audio' | 'text' | 'zip' | 'code' | 'file';

export interface FileIconProps {
  type: FileType;
  size?: number;
  isOpen?: boolean; // For folder icons
}

export const FileIcon: React.FC<FileIconProps> = ({ type, size = 20, isOpen = false }) => {
  const getFileIcon = () => {
    switch (type) {
      case 'folder':
        if (isOpen) {
          return (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
              <path
                d="M22 19C22 19.5304 21.7893 20.0391 21.4142 20.4142C21.0391 20.7893 20.5304 21 20 21H4C3.46957 21 2.96086 20.7893 2.58579 20.4142C2.21071 20.0391 2 19.5304 2 19V5C2 4.46957 2.21071 3.96086 2.58579 3.58579C2.96086 3.21071 3.46957 3 4 3H9L11 6H20C20.5304 6 21.0391 6.21071 21.4142 6.58579C21.7893 6.96086 22 7.46957 22 8V19Z"
                fill="#FDB022"
                stroke="#FDB022"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          );
        }
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <path
              d="M22 19C22 19.5304 21.7893 20.0391 21.4142 20.4142C21.0391 20.7893 20.5304 21 20 21H4C3.46957 21 2.96086 20.7893 2.58579 20.4142C2.21071 20.0391 2 19.5304 2 19V5C2 4.46957 2.21071 3.96086 2.58579 3.58579C2.96086 3.21071 3.46957 3 4 3H9L11 6H20C20.5304 6 21.0391 6.21071 21.4142 6.58579C21.7893 6.96086 22 7.46957 22 8V19Z"
              fill="#E8A54D"
              stroke="#E8A54D"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );

      case 'excel':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <rect x="3" y="2" width="18" height="20" rx="2" fill="#217346" />
            <path
              d="M8 8L12 12M12 12L16 16M12 12L16 8M12 12L8 16"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        );

      case 'word':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <rect x="3" y="2" width="18" height="20" rx="2" fill="#2B579A" />
            <path
              d="M7 8L9 16L12 10L15 16L17 8"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );

      case 'powerpoint':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <rect x="3" y="2" width="18" height="20" rx="2" fill="#D24726" />
            <path
              d="M8 8H13C14.6569 8 16 9.34315 16 11C16 12.6569 14.6569 14 13 14H8V8ZM8 14V18"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );

      case 'pdf':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <rect x="3" y="2" width="18" height="20" rx="2" fill="#F40F02" />
            <text
              x="12"
              y="16"
              fontSize="8"
              fontWeight="bold"
              fill="white"
              textAnchor="middle"
            >
              PDF
            </text>
          </svg>
        );

      case 'image':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="18" height="18" rx="2" fill="#6B46C1" stroke="#6B46C1" strokeWidth="1.5" />
            <circle cx="8.5" cy="8.5" r="1.5" fill="white" />
            <path d="M21 15L16 10L5 21" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );

      case 'video':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <rect x="2" y="5" width="20" height="14" rx="2" fill="#E53E3E" stroke="#E53E3E" strokeWidth="1.5" />
            <path d="M10 9L15 12L10 15V9Z" fill="white" />
          </svg>
        );

      case 'audio':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <rect x="3" y="2" width="18" height="20" rx="2" fill="#9F7AEA" />
            <path
              d="M15 6V13C15 14.1046 14.1046 15 13 15C11.8954 15 11 14.1046 11 13C11 11.8954 11.8954 11 13 11C13.3506 11 13.6872 11.0602 14 11.1707V6H15ZM15 6H16"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );

      case 'text':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <rect x="3" y="2" width="18" height="20" rx="2" fill="#718096" />
            <line x1="7" y1="8" x2="17" y2="8" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="7" y1="12" x2="17" y2="12" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="7" y1="16" x2="14" y2="16" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        );

      case 'zip':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <rect x="3" y="2" width="18" height="20" rx="2" fill="#F6AD55" />
            <rect x="11" y="6" width="2" height="2" fill="white" />
            <rect x="11" y="10" width="2" height="2" fill="white" />
            <rect x="11" y="14" width="2" height="2" fill="white" />
          </svg>
        );

      case 'code':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <rect x="3" y="2" width="18" height="20" rx="2" fill="#48BB78" />
            <path
              d="M8 9L6 12L8 15M16 9L18 12L16 15M13 7L11 17"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );

      case 'file':
      default:
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <path
              d="M13 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V9L13 2Z"
              fill="#CBD5E0"
              stroke="#CBD5E0"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M13 2V9H20"
              fill="#A0AEC0"
              stroke="#A0AEC0"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
    }
  };

  return <div style={{ display: 'inline-flex', alignItems: 'center' }}>{getFileIcon()}</div>;
};

// Helper function to determine file type from extension
export const getFileTypeFromName = (filename: string): FileType => {
  const ext = filename.split('.').pop()?.toLowerCase() || '';

  const typeMap: Record<string, FileType> = {
    // Excel
    xls: 'excel',
    xlsx: 'excel',
    xlsm: 'excel',
    csv: 'excel',

    // Word
    doc: 'word',
    docx: 'word',

    // PowerPoint
    ppt: 'powerpoint',
    pptx: 'powerpoint',

    // PDF
    pdf: 'pdf',

    // Images
    jpg: 'image',
    jpeg: 'image',
    png: 'image',
    gif: 'image',
    svg: 'image',
    webp: 'image',
    bmp: 'image',

    // Video
    mp4: 'video',
    avi: 'video',
    mov: 'video',
    wmv: 'video',
    mkv: 'video',
    webm: 'video',

    // Audio
    mp3: 'audio',
    wav: 'audio',
    ogg: 'audio',
    flac: 'audio',
    m4a: 'audio',

    // Text
    txt: 'text',
    md: 'text',
    log: 'text',

    // Zip
    zip: 'zip',
    rar: 'zip',
    '7z': 'zip',
    tar: 'zip',
    gz: 'zip',

    // Code
    js: 'code',
    jsx: 'code',
    ts: 'code',
    tsx: 'code',
    html: 'code',
    css: 'code',
    json: 'code',
    xml: 'code',
    py: 'code',
    java: 'code',
    cpp: 'code',
    c: 'code',
    php: 'code',
    rb: 'code',
    go: 'code',
    rs: 'code',
  };

  return typeMap[ext] || 'file';
};

export default FileIcon;
