import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import { Default } from './DesktopNav.stories';

describe('DesktopNav', () => {
  it('render desktop nav with logo, user and org name, menu sections when user is authenticated', () => {
    const { container } = render(
      <BrowserRouter>
        <Default isAuthenticated={true} {...Default.args} />
      </BrowserRouter>
    );

    expect(container.querySelector('.MuiPaper-root')).toBeInTheDocument();
    expect(container.querySelector('img')).toBeInTheDocument();
    expect(container.querySelector('h6')).toBeInTheDocument();
    expect(container.querySelector('p')).toBeInTheDocument();
    expect(container.querySelector('ul')).toBeInTheDocument();
  });

  it('render desktop nav with logo,but no user and or info, when user is not authenticated', () => {
    const { container } = render(
      <BrowserRouter>
        <Default isAuthenticated={false} {...Default.args} />
      </BrowserRouter>
    );

    expect(container.querySelector('.MuiPaper-root')).toBeInTheDocument();
    expect(container.querySelector('img')).toBeInTheDocument();
    expect(container.querySelector('h6')).not.toBeInTheDocument();
    expect(container.querySelector('p')).not.toBeInTheDocument();
    expect(container.querySelector('ul')).toBeInTheDocument();
  });
});
