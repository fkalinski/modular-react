import React, { useState, Suspense } from 'react';
import { ContentContext } from './ContentContext';

const FilesAndFolders = React.lazy(() => import('files_and_folders/App'));

export function App() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <ContentContext.Provider value={{ searchTerm, setSearchTerm }}>
      <div>
        <h1>Content Platform</h1>
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <hr />
        <Suspense fallback={<div>Loading...</div>}>
          <FilesAndFolders />
        </Suspense>
      </div>
    </ContentContext.Provider>
  );
}

export default App;
