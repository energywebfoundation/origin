import React from 'react';
import { composeStories } from '@storybook/testing-react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import * as stories from '../../components/layout/PageNotFound/PageNotFound.stories';

const { Default } = composeStories(stories);

describe('PageNotFound', () => {
  it('should render default PageNotFound', () => {
    const { baseElement, getByRole, getByText } = render(<Default />);
    expect(baseElement).toBeInTheDocument();
    expect(
      getByText('Page you are trying to access is not existing')
    ).toBeInTheDocument();
    expect(getByRole('button')).toBeInTheDocument();
    expect(getByRole('button')).toHaveTextContent('Go back');
  });
});
