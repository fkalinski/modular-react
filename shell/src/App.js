import React, { Suspense } from 'react';
import layout from './layout.json';
import DynamicComponent from './DynamicComponent';

function App() {
  return (
    <div>
      <h1>Shell Application</h1>
      <Suspense fallback={<div>Loading...</div>}>
        {layout.components.map((component) => (
          <DynamicComponent key={component.component} componentPath={component.path} />
        ))}
      </Suspense>
    </div>
  );
}

export default App;
