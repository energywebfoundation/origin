import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import { Web3ContextProvider } from './Web3ContextProvider';

describe('Web3ContextProvider', () => {
  it('renders Web3ContextProvider successfully', () => {
    const { baseElement } = render(
      <Web3ContextProvider>
        <div>Child component</div>
      </Web3ContextProvider>
    );
    expect(baseElement).toBeTruthy();
  });
});
