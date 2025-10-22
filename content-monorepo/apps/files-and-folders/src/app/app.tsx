import React, { useContext } from 'react';
// @ts-ignore
import Button from 'content/Button';
// @ts-ignore
import { ContentContext } from 'content/App';

export function App() {
  const { searchTerm } = useContext(ContentContext);

  return (
    <div>
      <h2>Files & Folders</h2>
      <p>Current search term: {searchTerm}</p>
      <Button />
    </div>
  );
}

export default App;
