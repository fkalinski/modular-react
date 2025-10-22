import React from 'react';
export type FileType = 'folder' | 'excel' | 'word' | 'powerpoint' | 'pdf' | 'image' | 'video' | 'audio' | 'text' | 'zip' | 'code' | 'file';
export interface FileIconProps {
    type: FileType;
    size?: number;
    isOpen?: boolean;
}
export declare const FileIcon: React.FC<FileIconProps>;
export declare const getFileTypeFromName: (filename: string) => FileType;
export default FileIcon;
