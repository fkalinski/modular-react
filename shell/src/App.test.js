import { render, screen } from '@testing-library/react';
import App from './App';

test('renders shell application heading', () => {
  render(<App />);
  const headingElement = screen.getByText(/Shell Application/i);
  expect(headingElement).toBeInTheDocument();
});
