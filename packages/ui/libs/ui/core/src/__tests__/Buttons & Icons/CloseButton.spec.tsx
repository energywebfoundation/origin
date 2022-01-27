import React from 'react';

import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import { Default } from '../../components/buttons/CloseButton/CloseButton.stories';
import { CloseButtonProps } from '../../components/buttons/CloseButton/CloseButton';

describe('CloseButton', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <Default {...(Default.args as CloseButtonProps)} />
    );

    expect(baseElement).toBeInTheDocument();
  });

  it('renders close button with CloseIcon', () => {
    const { container, getByTestId } = render(
      <Default {...(Default.args as CloseButtonProps)} />
    );

    expect(container.querySelector('button')).toBeInTheDocument();
    expect(getByTestId('CloseIcon')).toBeInTheDocument();
  });
});
