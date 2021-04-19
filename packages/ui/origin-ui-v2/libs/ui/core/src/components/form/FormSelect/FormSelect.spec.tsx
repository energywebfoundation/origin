import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import { Default } from './FormSelect.stories';

describe('FormSelect', () => {
  it('should render default form select', () => {
    const { baseElement } = render(<Default {...Default.args} />);
    expect(baseElement).toBeInTheDocument();
    expect(
      baseElement.querySelector('.MuiSelect-nativeInput')
    ).toBeInTheDocument();
  });
});
