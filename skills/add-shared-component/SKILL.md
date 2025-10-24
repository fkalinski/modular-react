---
name: add-shared-component
description: Guide for adding new components to the shared-components library and exposing them via Module Federation for use across all federated modules.
---

# Adding Shared Components

This skill guides you through creating and exposing new components in the shared-components library for use across all federated modules in the platform.

## When to Use This Skill

Use this skill when you need to:
- Create a new reusable component
- Add a component to the shared library
- Expose a component via Module Federation
- Update component exports and types
- Version shared components
- Test components across federated modules

## Understanding Shared Components

The `shared-components` package is a **federated remote** that exposes UI components at runtime. All other modules consume these components via Module Federation.

**Key characteristics:**
- Exposed via Module Federation
- Loaded at runtime (not bundled)
- Shared as singletons (one instance)
- Versioned independently
- No rebuild required for consumers on compatible updates

## Step-by-Step Guide

### Step 1: Create Component File

Navigate to `shared-components/src/components/`:

```bash
cd /Users/fkalinski/dev/fkalinski/modular-react/shared-components/src/components
```

Create your component file `MyComponent.tsx`:

```typescript
import React, { FC } from 'react';

export interface MyComponentProps {
  /** Component title */
  title: string;

  /** Optional description */
  description?: string;

  /** Click handler */
  onClick?: () => void;

  /** Custom CSS class */
  className?: string;

  /** Children elements */
  children?: React.ReactNode;
}

/**
 * MyComponent - Brief description
 *
 * @example
 * ```tsx
 * <MyComponent
 *   title="Hello"
 *   description="World"
 *   onClick={() => console.log('clicked')}
 * >
 *   Content here
 * </MyComponent>
 * ```
 */
export const MyComponent: FC<MyComponentProps> = ({
  title,
  description,
  onClick,
  className = '',
  children,
}) => {
  return (
    <div className={`my-component ${className}`} onClick={onClick}>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      {children}
    </div>
  );
};

// Default export for easier Module Federation imports
export default MyComponent;
```

**Best practices:**
- Export both named and default
- Define TypeScript interface for props
- Add JSDoc comments
- Include usage example
- Use semantic prop names

### Step 2: Export from Main Index

Update `shared-components/src/index.ts`:

```typescript
// Existing exports
export { Button } from './components/Button';
export { Table } from './components/Table';
export { Tree } from './components/Tree';

// Add your new component
export { MyComponent } from './components/MyComponent';
export type { MyComponentProps } from './components/MyComponent';

// Re-export types
export type { ButtonProps } from './components/Button';
export type { TableProps } from './components/Table';
// ... etc
```

### Step 3: Expose via Module Federation

Update `shared-components/webpack.config.js`:

```javascript
new ModuleFederationPlugin({
  name: 'shared_components',
  filename: 'remoteEntry.js',

  exposes: {
    // Existing exposes
    './Button': './src/components/Button',
    './Table': './src/components/Table',
    './Tree': './src/components/Tree',

    // Add your new component
    './MyComponent': './src/components/MyComponent',
  },

  shared: {
    react: {
      singleton: true,
      requiredVersion: '^18.0.0',
      strictVersion: false,
    },
    'react-dom': {
      singleton: true,
      requiredVersion: '^18.0.0',
      strictVersion: false,
    },
  },

  dts: false, // Keep disabled for production
}),
```

**Naming convention:**
- Use PascalCase for component names
- Path should be `./ComponentName`
- Points to component file (not index)

### Step 4: Update Component Showcase

Update `shared-components/src/App.tsx` to showcase your component:

```typescript
import React from 'react';
import { MyComponent } from './components/MyComponent';
// ... other imports

const App: React.FC = () => {
  return (
    <div>
      <h1>Shared Components Showcase</h1>

      {/* Existing component demos */}

      {/* Add your component demo */}
      <section>
        <h2>MyComponent</h2>
        <MyComponent
          title="Example Title"
          description="This demonstrates MyComponent"
          onClick={() => alert('Clicked!')}
        >
          <p>Child content goes here</p>
        </MyComponent>
      </section>
    </div>
  );
};

export default App;
```

### Step 5: Build and Test Locally

```bash
cd /Users/fkalinski/dev/fkalinski/modular-react/shared-components

# Install dependencies (if needed)
npm install

# Start dev server
npm run dev

# In another terminal, build
npm run build
```

**Test standalone:**
- Visit http://localhost:3001
- Verify your component appears in showcase
- Test all props and interactions

### Step 6: Test in Consumer Module

Update a consumer (e.g., `top-level-shell/src/App.tsx`):

```typescript
import React, { lazy, Suspense } from 'react';

// Lazy load from federated remote
const MyComponent = lazy(() => import('shared_components/MyComponent'));

const App = () => {
  return (
    <div>
      <h1>Testing MyComponent</h1>

      <Suspense fallback={<div>Loading component...</div>}>
        <MyComponent
          title="Federated Component"
          description="Loaded at runtime via Module Federation"
          onClick={() => console.log('Works!')}
        />
      </Suspense>
    </div>
  );
};

export default App;
```

**Test integration:**
```bash
# Start shared-components (if not running)
cd shared-components && npm run dev

# Start consumer
cd ../top-level-shell && npm run dev

# Visit http://localhost:3000
```

### Step 7: Add TypeScript Types for Consumers

If consumers need type definitions, they can add type stubs:

Create/update `consumer/src/types/shared-components.d.ts`:

```typescript
declare module 'shared_components/MyComponent' {
  import { FC } from 'react';

  export interface MyComponentProps {
    title: string;
    description?: string;
    onClick?: () => void;
    className?: string;
    children?: React.ReactNode;
  }

  export const MyComponent: FC<MyComponentProps>;
  export default MyComponent;
}
```

### Step 8: Version and Deploy

If this is a breaking change (v1.x.x → v2.0.0), update version:

```bash
cd shared-components

# Update package.json version
npm version major  # For breaking changes
npm version minor  # For new features
npm version patch  # For bug fixes

# Build for production
npm run build

# Deploy to Vercel
vercel --prod
```

**After deployment:**
- Update remote URLs in consumers (if needed)
- Or use environment variables (preferred)
- Redeploy consumers to pick up new version

## Component Patterns

### Pattern 1: Basic Component

Simple component with props:

```typescript
export interface GreetingProps {
  name: string;
}

export const Greeting: FC<GreetingProps> = ({ name }) => {
  return <div>Hello, {name}!</div>;
};

export default Greeting;
```

### Pattern 2: Component with Children

Component that wraps content:

```typescript
export interface CardProps {
  title: string;
  children: React.ReactNode;
}

export const Card: FC<CardProps> = ({ title, children }) => {
  return (
    <div className="card">
      <h3>{title}</h3>
      <div className="card-body">{children}</div>
    </div>
  );
};

export default Card;
```

### Pattern 3: Generic Component

Component with type parameter:

```typescript
export interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string;
}

export function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <ul>
      {items.map((item) => (
        <li key={keyExtractor(item)}>{renderItem(item)}</li>
      ))}
    </ul>
  );
}

export default List;
```

### Pattern 4: Component with Hooks

Component with internal state:

```typescript
export interface CounterProps {
  initialValue?: number;
  onChange?: (value: number) => void;
}

export const Counter: FC<CounterProps> = ({ initialValue = 0, onChange }) => {
  const [count, setCount] = useState(initialValue);

  const increment = () => {
    const newValue = count + 1;
    setCount(newValue);
    onChange?.(newValue);
  };

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>Increment</button>
    </div>
  );
};

export default Counter;
```

### Pattern 5: Compound Component

Component with sub-components:

```typescript
export const Dialog: FC<{ children: React.ReactNode }> & {
  Header: FC<{ children: React.ReactNode }>;
  Body: FC<{ children: React.ReactNode }>;
  Footer: FC<{ children: React.ReactNode }>;
} = ({ children }) => {
  return <div className="dialog">{children}</div>;
};

Dialog.Header = ({ children }) => {
  return <div className="dialog-header">{children}</div>;
};

Dialog.Body = ({ children }) => {
  return <div className="dialog-body">{children}</div>;
};

Dialog.Footer = ({ children }) => {
  return <div className="dialog-footer">{children}</div>;
};

// Usage:
// <Dialog>
//   <Dialog.Header>Title</Dialog.Header>
//   <Dialog.Body>Content</Dialog.Body>
//   <Dialog.Footer>Actions</Dialog.Footer>
// </Dialog>

export default Dialog;
```

## Styling Components

### Option 1: CSS Modules

```typescript
import styles from './MyComponent.module.css';

export const MyComponent: FC = () => {
  return <div className={styles.container}>Content</div>;
};
```

### Option 2: Inline Styles

```typescript
export const MyComponent: FC = () => {
  return (
    <div style={{ padding: '1rem', backgroundColor: '#f0f0f0' }}>
      Content
    </div>
  );
};
```

### Option 3: Styled Components (if installed)

```typescript
import styled from 'styled-components';

const Container = styled.div`
  padding: 1rem;
  background-color: #f0f0f0;
`;

export const MyComponent: FC = () => {
  return <Container>Content</Container>;
};
```

## Testing Components

### Unit Testing Example (if tests exist)

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders title', () => {
    render(<MyComponent title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<MyComponent title="Test" onClick={handleClick} />);

    fireEvent.click(screen.getByText('Test'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## Semantic Versioning

Follow semantic versioning for shared components:

### Patch (1.0.0 → 1.0.1)
- Bug fixes
- No API changes
- No new features
- **Consumers:** Auto-update, no rebuild needed

### Minor (1.0.0 → 1.1.0)
- New features
- Backward compatible
- New optional props
- **Consumers:** Auto-update, no rebuild needed

### Major (1.0.0 → 2.0.0)
- Breaking changes
- Removed/renamed props
- Changed behavior
- **Consumers:** Must update code, rebuild required

## Best Practices

1. **Export both named and default** - Flexibility for consumers
2. **Define TypeScript interfaces** - Clear prop types
3. **Add JSDoc comments** - Document usage
4. **Include examples** - Show how to use
5. **Test standalone first** - Verify in showcase
6. **Test in consumer** - Verify federation works
7. **Follow naming conventions** - PascalCase for components
8. **Keep components focused** - Single responsibility
9. **Make props optional where possible** - Better DX
10. **Use semantic versioning** - Communicate changes clearly

## Common Issues

### Component Not Loading

**Symptoms:**
```
Module not found: Error: Can't resolve 'shared_components/MyComponent'
```

**Solution:**
1. Verify component is exposed in webpack.config.js
2. Check spelling matches exactly
3. Ensure shared-components is running (dev) or deployed (prod)
4. Check browser network tab for remoteEntry.js

### Type Errors in Consumer

**Symptoms:**
```
Cannot find module 'shared_components/MyComponent' or its corresponding type declarations
```

**Solution:**
Add type stub in consumer's `src/types/shared-components.d.ts`:

```typescript
declare module 'shared_components/MyComponent' {
  export const MyComponent: React.FC<any>;
  export default MyComponent;
}
```

### Styles Not Applying

**Symptoms:**
Component renders but has no styling

**Solution:**
- Ensure CSS is imported in component
- Check CSS modules are configured in webpack
- Verify style loader is installed and configured
- Check browser DevTools for applied styles

## Quick Reference

```bash
# Create new component
cd shared-components/src/components
touch MyComponent.tsx

# Update exports
# Edit src/index.ts - add export

# Update Module Federation
# Edit webpack.config.js - add to exposes

# Update showcase
# Edit src/App.tsx - add demo

# Test locally
npm run dev    # http://localhost:3001
npm run build  # Build for production

# Deploy
vercel --prod

# Versioning
npm version patch  # 1.0.0 → 1.0.1
npm version minor  # 1.0.0 → 1.1.0
npm version major  # 1.0.0 → 2.0.0
```

## Component Checklist

- [ ] Component file created in `src/components/`
- [ ] Props interface defined with JSDoc
- [ ] Both named and default export
- [ ] Exported from `src/index.ts`
- [ ] Exposed in `webpack.config.js`
- [ ] Showcase added to `src/App.tsx`
- [ ] Tested standalone at http://localhost:3001
- [ ] Tested in consumer module
- [ ] Type stub added to consumer (if needed)
- [ ] Styled appropriately
- [ ] Semantic version updated (if releasing)
- [ ] Deployed to Vercel

## Related Skills

- **dev-workflow**: For development environment setup
- **module-federation-types**: For handling TypeScript types
- **add-federated-tab**: For creating tabs that use shared components
- **vercel-deployment**: For deploying shared components to production

## References

- Shared components: `shared-components/src/components/`
- Exports: `shared-components/src/index.ts`
- Webpack config: `shared-components/webpack.config.js`
- Showcase: `shared-components/src/App.tsx`
- Example components:
  - `shared-components/src/components/Button.tsx`
  - `shared-components/src/components/Table.tsx`
  - `shared-components/src/components/Tree.tsx`
