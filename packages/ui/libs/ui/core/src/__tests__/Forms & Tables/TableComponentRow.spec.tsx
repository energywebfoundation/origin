import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { provideTheme } from '../utils';

import { TableComponentRow } from '../../components/table/TableComponentRow';

describe('TableComponentRow', () => {
  it('should render default TableComponentRow', () => {
    const { baseElement, getByText } = render(
      provideTheme(
        <TableComponentRow
          row={{ id: 1, fullName: 'John Doe', role: 'Manager' }}
          headerData={{
            id: 'ID',
            fullName: 'Full name',
            role: 'Role',
          }}
        />
      )
    );
    expect(baseElement).toBeInTheDocument();
    expect(getByText('John Doe')).toBeInTheDocument();
    expect(getByText('Manager')).toBeInTheDocument();
  });
});
