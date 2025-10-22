import React from 'react';

const DynamicComponent = ({ componentPath }) => {
  const Component = React.lazy(() => import(`${componentPath}`));
  return <Component />;
};

export default DynamicComponent;
