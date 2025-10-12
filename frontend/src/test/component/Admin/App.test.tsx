import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '@/App';

describe('App Component', () => {
  it('renders without crashing', () => {
    render(<App />);
    
    // Tomar App component e je text ache ta check koro
    expect(document.body).toBeInTheDocument();
  });
});
