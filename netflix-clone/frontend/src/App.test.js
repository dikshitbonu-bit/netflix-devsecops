import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Netflix app', () => {
  render(<App />);
  const linkElement = screen.getByText(/NETFLIX/i);
  expect(linkElement).toBeInTheDocument();
});

test('renders home page', () => {
  render(<App />);
  expect(screen.getByText(/Unlimited movies/i)).toBeInTheDocument();
});
