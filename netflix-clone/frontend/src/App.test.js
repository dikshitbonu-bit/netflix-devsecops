import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('axios', () => ({
  get: jest.fn().mockResolvedValue({ data: { results: [] } }),
  defaults: { headers: { common: {} } }
}));

jest.mock('./components/Home', () => () => <div data-testid="home-mock">Home Component</div>);
jest.mock('./components/MovieDetails', () => () => <div>Movie Details</div>);
jest.mock('./components/Watchlist', () => () => <div>Watchlist</div>);
jest.mock('./components/Login', () => () => <div>Login</div>);
jest.mock('./components/Register', () => () => <div>Register</div>);

describe('App Component', () => {
  test('renders Netflix logo', () => {
    render(<App />);
    expect(screen.getByText(/NETFLIX/i)).toBeInTheDocument();
  });

  test('renders navigation links', () => {
    render(<App />);
    expect(screen.getByRole('link', { name: /Home/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Sign In/i })).toBeInTheDocument();
  });
});