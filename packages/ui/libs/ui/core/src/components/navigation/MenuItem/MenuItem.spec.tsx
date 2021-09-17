import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import { Default } from './MenuItem.stories';

describe('MenuItem', () => {
  it('render menu item', () => {
    const { container } = render(
      <BrowserRouter>
        <Default {...Default.args} />
      </BrowserRouter>
    );
    const listItem = container.querySelector('li');
    expect(listItem).toBeInTheDocument();

    const link = listItem.querySelector('a');
    expect(link).toHaveAttribute('role', 'button');
    expect(link).toHaveAttribute('href', Default.args.url);

    const label = link.querySelector('span');
    expect(label).toHaveTextContent(Default.args.label);
  });
});
