import { render, screen } from '@testing-library/react';
import App from './App';

test('renders hubs heading', () => {
  render(<App />);
  const headingElement = screen.getByText(/Hubs/i);
  expect(headingElement).toBeInTheDocument();
});
