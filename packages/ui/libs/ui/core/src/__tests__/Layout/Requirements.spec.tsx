import React from 'react';
import { composeStories } from '@storybook/testing-react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import * as stories from '../../components/layout/Requirements/Requirements.stories';
import { RequirementsProps } from '../../components/layout/Requirements/Requirements';

const { Default } = composeStories(stories);

describe('Requirements', () => {
  it('should render default Requirements', () => {
    const { baseElement, getByText } = render(
      <Default {...(Default.args as RequirementsProps)} />
    );
    expect(baseElement).toBeInTheDocument();
    expect(baseElement.querySelector('p'));
    expect(getByText(Default.args.rules[0].label)).toBeInTheDocument();
    expect(getByText(Default.args.rules[1].label)).toBeInTheDocument();
    expect(getByText(Default.args.rules[2].label)).toBeInTheDocument();

    expect(baseElement.querySelectorAll('.MuiListItemText-root')).toHaveLength(
      Default.args.rules.length
    );
    expect(baseElement.querySelectorAll('.MuiCheckbox-root')).toHaveLength(
      Default.args.rules.length
    );
  });
});
