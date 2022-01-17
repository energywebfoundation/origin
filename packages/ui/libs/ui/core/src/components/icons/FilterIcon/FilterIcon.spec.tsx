import React from 'react';
import { render } from '@testing-library/react';
import { provideTheme } from '../../../__tests__/utils';

import FilterIcon from './FilterIcon';

describe('FilterIcon', () => {
  it('should render successfully', () => {
    const { baseElement } = render(provideTheme(<FilterIcon />));
    expect(baseElement).toBeTruthy();
  });
});
