import React from 'react';

import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import { Default } from './ProgressLine.stories';

describe('ProgressLine', () => {
  it('render progress line', () => {
    const { baseElement } = render(<Default />);

    expect(baseElement).toBeInTheDocument();
  });
});
