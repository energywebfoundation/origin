import React from 'react';
import { composeStories } from '@storybook/testing-react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import * as stories from '../../components/buttons/ClearButton/ClearButton.stories';

const { Default } = composeStories(stories);

describe('ClearButton', () => {
  it('should render default ClearButton', () => {
    const { baseElement, getByTestId } = render(<Default />);
    expect(baseElement).toBeInTheDocument();
    expect(getByTestId('ClearIcon')).toBeInTheDocument();
  });
});
