import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import { Default } from './MobileNav.stories';

describe('MobileNav', () => {
  it('render mobile navigation', () => {
    const { getByTestId, container } = render(
      <BrowserRouter>
        <Default {...Default.args} />
      </BrowserRouter>
    );

    const paper = container.querySelector('.MuiPaper-root');
    expect(paper).toBeInTheDocument();

    expect(getByTestId('CloseIcon')).toBeInTheDocument();

    expect(paper.querySelector('img')).not.toBeInTheDocument();

    expect(paper.querySelector('h6')).not.toBeInTheDocument();

    expect(paper.querySelector('p')).not.toBeInTheDocument();

    expect(paper.querySelector('ul')).toBeInTheDocument();
  });
});
