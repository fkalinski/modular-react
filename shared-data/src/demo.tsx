import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { createStore } from './store';
import { setSearchText, setFilter, clearFilters } from './store/slices/filtersSlice';
import { toggleSelection, clearSelection } from './store/slices/selectionSlice';
import { navigate, setActiveTab } from './store/slices/navigationSlice';
import { PlatformContextProvider, usePlatformContext } from './context/PlatformContext';
import { eventBus, PlatformEvent } from './events';

const store = createStore();

const DemoComponent: React.FC = () => {
  const dispatch = useDispatch();
  const context = usePlatformContext();

  const containerStyle: React.CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  };

  const buttonStyle: React.CSSProperties = {
    padding: '10px 20px',
    marginRight: '10px',
    marginBottom: '10px',
    backgroundColor: '#0066cc',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  };

  const codeStyle: React.CSSProperties = {
    backgroundColor: '#f5f5f5',
    padding: '12px',
    borderRadius: '4px',
    fontFamily: 'monospace',
    fontSize: '12px',
    overflow: 'auto',
    maxHeight: '300px',
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={{ marginBottom: '10px' }}>Shared Data Layer - Demo</h1>
        <p style={{ color: '#666', marginBottom: '10px' }}>
          Redux store with dynamic reducer injection, GraphQL client, and event bus.
        </p>
        <p style={{ fontSize: '12px', color: '#999' }}>
          <strong>Version:</strong> 1.0.0 | <strong>Port:</strong> 3002
        </p>
      </div>

      <div style={cardStyle}>
        <h2 style={{ marginBottom: '15px' }}>Filters (Redux Slice)</h2>
        <div>
          <button
            style={buttonStyle}
            onClick={() => {
              dispatch(setSearchText('test query'));
              eventBus.emit(PlatformEvent.FILTER_CHANGED, { searchText: 'test query' }, 'demo');
            }}
          >
            Set Search Text
          </button>
          <button
            style={buttonStyle}
            onClick={() => {
              dispatch(setFilter({ field: 'type', operator: 'equals', value: 'file' }));
              eventBus.emit(PlatformEvent.FILTER_CHANGED, { type: 'file' }, 'demo');
            }}
          >
            Add Filter
          </button>
          <button
            style={buttonStyle}
            onClick={() => {
              dispatch(clearFilters());
              eventBus.emit(PlatformEvent.FILTER_CHANGED, {}, 'demo');
            }}
          >
            Clear Filters
          </button>
        </div>
        <pre style={codeStyle}>
          {JSON.stringify(context.filters, null, 2)}
        </pre>
      </div>

      <div style={cardStyle}>
        <h2 style={{ marginBottom: '15px' }}>Selection (Redux Slice)</h2>
        <div>
          <button
            style={buttonStyle}
            onClick={() => {
              dispatch(toggleSelection('item-1'));
              eventBus.emit(PlatformEvent.SELECTION_CHANGED, { id: 'item-1' }, 'demo');
            }}
          >
            Toggle Item 1
          </button>
          <button
            style={buttonStyle}
            onClick={() => {
              dispatch(toggleSelection('item-2'));
              eventBus.emit(PlatformEvent.SELECTION_CHANGED, { id: 'item-2' }, 'demo');
            }}
          >
            Toggle Item 2
          </button>
          <button
            style={buttonStyle}
            onClick={() => {
              dispatch(clearSelection());
              eventBus.emit(PlatformEvent.SELECTION_CHANGED, {}, 'demo');
            }}
          >
            Clear Selection
          </button>
        </div>
        <pre style={codeStyle}>
          {JSON.stringify(context.selection, null, 2)}
        </pre>
      </div>

      <div style={cardStyle}>
        <h2 style={{ marginBottom: '15px' }}>Navigation (Redux Slice)</h2>
        <div>
          <button
            style={buttonStyle}
            onClick={() => {
              dispatch(navigate('/documents/folder-1'));
              eventBus.emit(PlatformEvent.NAVIGATION, { path: '/documents/folder-1' }, 'demo');
            }}
          >
            Navigate to Folder
          </button>
          <button
            style={buttonStyle}
            onClick={() => {
              dispatch(setActiveTab('files'));
              eventBus.emit(PlatformEvent.TAB_ACTIVATED, { tab: 'files' }, 'demo');
            }}
          >
            Activate Files Tab
          </button>
        </div>
        <pre style={codeStyle}>
          {JSON.stringify(context.navigation, null, 2)}
        </pre>
      </div>

      <div style={cardStyle}>
        <h2 style={{ marginBottom: '15px' }}>Event Bus</h2>
        <p style={{ marginBottom: '10px', color: '#666' }}>
          All button clicks above also emit platform events. Check the console to see event logs.
        </p>
        <button
          style={buttonStyle}
          onClick={() => {
            eventBus.emit(PlatformEvent.ACTION_EXECUTED, {
              action: 'custom-action',
              payload: { foo: 'bar' }
            }, 'demo');
          }}
        >
          Emit Custom Event
        </button>
      </div>
    </div>
  );
};

const DemoApp: React.FC = () => {
  return (
    <Provider store={store}>
      <PlatformContextProvider>
        <DemoComponent />
      </PlatformContextProvider>
    </Provider>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<DemoApp />);
}
