import React from 'react';

import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import { Default } from './CloseButton.stories';

describe('CloseButton', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Default {...Default.args} />);

    expect(baseElement).toBeInTheDocument();
  });

  it('renders close button with CloseIcon', () => {
    const { container, getByTestId } = render(<Default {...Default.args} />);

    expect(container.querySelector('button')).toBeInTheDocument();
    expect(getByTestId('CloseIcon')).toBeInTheDocument();
  });
});
