import React from 'react';
import { composeStories } from '@storybook/testing-react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import * as stories from '../../components/layout/PageWrapper/PageWrapper.stories';
import { PageWrapperProps } from '../../components/layout/PageWrapper/PageWrapper';

const { Default } = composeStories(stories);

describe('PageWrapper', () => {
  it('should render default PageWrapper', () => {
    const { baseElement, getByText } = render(
      <Default {...(Default.args as PageWrapperProps)} />
    );
    expect(baseElement).toBeInTheDocument();
    expect(getByText('Children content')).toBeInTheDocument();
  });
});
