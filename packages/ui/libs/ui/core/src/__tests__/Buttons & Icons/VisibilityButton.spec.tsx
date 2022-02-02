import React from 'react';
import { composeStories } from '@storybook/testing-react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import * as stories from '../../components/buttons/VisibilityButton/VisibilityButton.stories';
import { VisibilityButtonProps } from '../../components/buttons/VisibilityButton/VisibilityButton';

const { Default } = composeStories(stories);

describe('VisibilityButton', () => {
  it('should render default VisibilityButton', () => {
    const { baseElement, getByTestId } = render(
      <Default {...(Default.args as VisibilityButtonProps)} />
    );
    expect(baseElement).toBeInTheDocument();
    expect(getByTestId('VisibilityIcon')).toBeInTheDocument();
  });
});
