import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import { Default } from './NavSectionTitle.stories';

describe('NavSectionTitle', () => {
  it('render section title with link', () => {
    const { container } = render(
      <BrowserRouter>
        <Default {...Default.args} />
      </BrowserRouter>
    );
    const sectionHeader = container.querySelector('li');

    expect(sectionHeader.querySelector('a')).toHaveAttribute(
      'href',
      Default.args.url
    );
    expect(sectionHeader.querySelector('span')).toHaveTextContent(
      Default.args.title
    );
  });
});
