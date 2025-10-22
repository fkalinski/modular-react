import React from 'react';

export const ContentContext = React.createContext({
  searchTerm: '',
  setSearchTerm: (searchTerm: string) => {},
});
