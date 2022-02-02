import React from 'react';
import { composeStories } from '@storybook/testing-react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import * as stories from '../../components/layout/GenericMap/GenericMap.stories';
import { GenericMapProps } from '../../components/layout/GenericMap/GenericMap';

const { Default, WithLabels, WithInfoWindow } = composeStories(stories);

describe('GenericMap', () => {
  it('should render default GenericMap', () => {
    const { baseElement } = render(
      <Default {...(Default.args as GenericMapProps)} />
    );
    expect(baseElement).toBeInTheDocument();
  });

  it('should render with labels', () => {
    const { baseElement } = render(
      <WithLabels {...(WithLabels.args as GenericMapProps)} />
    );
    expect(baseElement).toBeInTheDocument();
  });

  it('should render with info window', () => {
    const { baseElement } = render(
      <WithInfoWindow {...(WithInfoWindow.args as GenericMapProps)} />
    );
    expect(baseElement).toBeInTheDocument();
  });
});
