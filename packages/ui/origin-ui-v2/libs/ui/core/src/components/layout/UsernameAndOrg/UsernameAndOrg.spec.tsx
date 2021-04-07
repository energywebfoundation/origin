import React from 'react';

import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import { Default } from './UsernameAndOrg.stories';

describe('UsernameAndOrg', () => {
  it('render username and orgName', () => {
    const { container } = render(<Default {...Default.args} />);

    expect(container.querySelector('h6')).toHaveTextContent(
      Default.args.username
    );
    expect(container.querySelector('p')).toHaveTextContent(
      Default.args.orgName
    );
  });
});
