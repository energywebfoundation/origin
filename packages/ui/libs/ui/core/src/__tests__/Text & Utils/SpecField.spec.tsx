import React from 'react';
import { composeStories } from '@storybook/testing-react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import * as stories from '../../components/text/SpecField/SpecField.stories';
import { SpecFieldProps } from '../../components/text/SpecField/SpecField';

const { Default, Multiple } = composeStories(stories);

describe('SpecField', () => {
  it('should render default SpecField', () => {
    const { baseElement, getByText } = render(
      <Default {...(Default.args as SpecFieldProps)} />
    );
    expect(baseElement).toBeInTheDocument();
    expect(getByText(Default.args.label)).toBeInTheDocument();
    expect(getByText(Default.args.value)).toBeInTheDocument();
  });

  it('should render multiple', () => {
    const { baseElement } = render(
      <Multiple {...(Multiple.args as SpecFieldProps)} />
    );
    expect(baseElement).toBeInTheDocument();
    expect(baseElement.querySelectorAll('p')).toHaveLength(6);
  });
});
