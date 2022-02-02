import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { provideTheme } from '../utils';

import { TableComponentCell } from '../../components/table/TableComponentCell';

describe('TableComponentCell', () => {
  it('should render default TableComponentCell', () => {
    const { baseElement, getByText } = render(
      provideTheme(<TableComponentCell cellData={'John Doe'} />)
    );
    expect(baseElement).toBeInTheDocument();
    expect(getByText('John Doe')).toBeInTheDocument();
  });
});
