import React from 'react';
import { render } from '@testing-library/react';
import { provideTheme } from '../utils';

import FilterIcon from '../../components/icons/FilterIcon/FilterIcon';

describe('FilterIcon', () => {
  it('should render successfully', () => {
    const { baseElement } = render(provideTheme(<FilterIcon />));
    expect(baseElement).toBeTruthy();
  });
});
