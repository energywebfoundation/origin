import React from 'react';

import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import { Default } from './Dot.stories';

describe('Dot', () => {
  it('render dot icon', () => {
    const { baseElement } = render(<Default />);

    expect(baseElement).toBeInTheDocument();
  });
});
