import React, { useState } from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { provideTheme } from '../utils';

import { TableComponentFilters } from '../../components/table/TableComponentFilters';
import { TableFilter } from '../../containers';

const tableFilters = [
  {
    name: 'generationStart',
    filterFunc: () => true,
    component: () => <div />,
  },
];

const Filters = () => {
  const [filters, setFilters] = useState<TableFilter[]>(tableFilters);
  return <TableComponentFilters filters={filters} setFilters={setFilters} />;
};

describe('TableComponentFilters', () => {
  it('should render default TableComponentFilters', () => {
    const { baseElement } = render(provideTheme(<Filters />));
    expect(baseElement).toBeInTheDocument();
  });
});
