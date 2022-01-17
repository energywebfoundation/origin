import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { provideTheme } from '../utils';

import { TableComponentBody } from '../../components/table/TableComponentBody';

describe('TableComponentBody', () => {
  it('should render default TableComponentBody', () => {
    const { baseElement, getByText } = render(
      provideTheme(
        <TableComponentBody
          rowData={[{ id: 1, fullName: 'John Doe', role: 'Manager' }]}
          headerData={{
            id: 'ID',
            fullName: 'Full name',
            role: 'Role',
          }}
          pageSize={1}
          loading={false}
        />
      )
    );
    expect(baseElement).toBeInTheDocument();
    expect(getByText('John Doe')).toBeInTheDocument();
    expect(getByText('Manager')).toBeInTheDocument();
  });
});
