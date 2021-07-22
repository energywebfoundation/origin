import React from 'react';

import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import { Default } from './TextWithPendingDot.stories';

describe('TextWithPendingDot', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Default {...Default.args} />);

    expect(baseElement).toBeInTheDocument();
  });

  it('render child components', () => {
    const { getByText, getByLabelText, container } = render(
      <Default {...Default.args} />
    );
    expect(getByText(Default.args.textContent)).toBeInTheDocument();
    expect(container.querySelector('span')).toBeInTheDocument();
    expect(getByLabelText(Default.args.tooltipText)).toBeInTheDocument();
  });
});
