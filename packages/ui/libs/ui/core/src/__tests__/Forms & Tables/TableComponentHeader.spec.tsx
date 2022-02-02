import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { provideTheme } from '../utils';

import { TableComponentHeader } from '../../components/table/TableComponentHeader';

describe('TableComponentHeader', () => {
  it('should render default TableComponentHeader', () => {
    const { baseElement, getByText } = render(
      provideTheme(
        <TableComponentHeader
          headerData={{
            id: 'ID',
            fullName: 'Full name',
            role: 'Role',
          }}
        />
      )
    );
    expect(baseElement).toBeInTheDocument();
    expect(getByText('Full name')).toBeInTheDocument();
    expect(getByText('Role')).toBeInTheDocument();
  });
});
