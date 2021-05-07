import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import { Default } from './DesktopNav.stories';

describe('DesktopNav', () => {
  it('render desktop nav with logo, user and org name, menu sections', () => {
    const { container } = render(
      <BrowserRouter>
        <Default {...Default.args} />
      </BrowserRouter>
    );

    expect(container.querySelector('.MuiPaper-root')).toBeInTheDocument();
    expect(container.querySelector('img')).toBeInTheDocument();
    expect(container.querySelector('h6')).toBeInTheDocument();
    expect(container.querySelector('p')).toBeInTheDocument();
    expect(container.querySelector('ul')).toBeInTheDocument();
  });
});
