/**
 * Base content item interface
 * Used by Preview and other components that work with content items
 */
export interface ContentItem {
  id: string;
  name: string;
  type: string;
  ownerId?: string;
  owner?: string;
  size?: string | number;
  createdAt: string;
  updatedAt: string;
  mimeType?: string;
  [key: string]: any; // Allow extensions
}
