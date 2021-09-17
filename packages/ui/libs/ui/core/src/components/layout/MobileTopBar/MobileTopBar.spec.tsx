import React from 'react';

import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import { Default } from './MobileTopBar.stories';

describe('MobileTopBar', () => {
  it('render mobile top bar with menu icon', () => {
    const { container, getByTestId } = render(<Default {...Default.args} />);

    expect(container.querySelector('.MuiToolbar-root')).toBeInTheDocument();
    expect(getByTestId('MenuIcon')).toBeInTheDocument();
  });
});
