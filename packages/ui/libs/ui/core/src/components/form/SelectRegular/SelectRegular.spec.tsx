import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import { Default } from './SelectRegular.stories';

describe('SelectRegular', () => {
  it('should render default SelectRegular', () => {
    const { baseElement } = render(<Default {...Default.args} />);
    expect(baseElement).toBeInTheDocument();
    expect(baseElement.querySelector('.MuiSelect-root')).toBeInTheDocument();
  });
});
