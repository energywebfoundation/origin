import { render } from '@testing-library/react';

import UiWeb3 from './UiWeb3';

describe('UiWeb3', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<UiWeb3 />);
    expect(baseElement).toBeTruthy();
  });
});
