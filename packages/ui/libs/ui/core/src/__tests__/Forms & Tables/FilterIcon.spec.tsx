import React, { FC } from 'react';
import { render } from '@testing-library/react';

import { FilterIcon } from '../../components';
import { provideTheme } from '../utils';

describe('FilterIcon', () => {
  it('should render successfully', () => {
    const { baseElement } = render(provideTheme(<FilterIcon />));
    expect(baseElement).toBeTruthy();
  });
});
