import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import { Default } from './SelectAutocomplete.stories';

describe('SelectAutocomplete', () => {
  it('should render default SelectAutocomplete', () => {
    const { baseElement } = render(<Default {...Default.args} />);
    expect(baseElement).toBeInTheDocument();

    expect(
      baseElement.querySelector('.MuiAutocomplete-input')
    ).toBeInTheDocument();
  });
});
