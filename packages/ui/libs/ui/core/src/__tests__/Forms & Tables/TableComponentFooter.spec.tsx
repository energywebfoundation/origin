import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { provideTheme } from '../utils';

import { TableComponentFooter } from '../../components/table/TableComponentFooter';

describe('TableComponentFooter', () => {
  it('should render default TableComponentFooter', () => {
    const handlePageChangeMock = jest.fn();
    const { baseElement } = render(
      provideTheme(
        <TableComponentFooter
          pageSize={3}
          handlePageChange={handlePageChangeMock}
          currentPage={0}
          totalRows={1}
        />
      )
    );
    expect(baseElement).toBeInTheDocument();
  });
});
