import React from 'react';
import { composeStories } from '@storybook/testing-react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import * as stories from '../../components/utils/ConditionalWrapper/ConditionalWrapper.stories';
import { ConditionalWrapperProps } from '../../components/utils/ConditionalWrapper/ConditionalWrapper';

const { FalsyCondition, TruthyCondition } = composeStories(stories);

describe('ConditionalWrapper', () => {
  it('should render with falsy condition', () => {
    const { baseElement, getByText } = render(
      <FalsyCondition {...(FalsyCondition.args as ConditionalWrapperProps)} />
    );
    expect(baseElement).toBeInTheDocument();
    expect(getByText('Some text content as children')).toBeInTheDocument();
  });

  it('should render with truthy condition', () => {
    const { baseElement, getByText } = render(
      <TruthyCondition {...(TruthyCondition.args as ConditionalWrapperProps)} />
    );
    expect(baseElement).toBeInTheDocument();
    expect(getByText('Some text content as children')).toBeInTheDocument();
  });
});
