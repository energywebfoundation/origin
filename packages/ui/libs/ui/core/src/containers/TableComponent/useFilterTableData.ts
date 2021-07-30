import { useState } from 'react';
import { TableFilter, TableRowData } from './TableComponent.types';

export const useFilterTableData = <Id>(
  data: TableRowData<Id>[],
  tableFilters: TableFilter[]
) => {
  const [filters, setFilters] = useState<TableFilter[]>(tableFilters);

  const filterTableData = (
    tableData: TableRowData<Id>[],
    filtersToApply: TableFilter[]
  ) => {
    const newData =
      !!filtersToApply && filtersToApply.length > 0
        ? tableData.filter((item) => {
            const itemMatchesFilters = filtersToApply.every((filter) => {
              if (!filter.value) {
                return true;
              }
              return filter.filterFunc(item[filter.name], filter.value);
            });
            if (itemMatchesFilters) {
              return item;
            }
          })
        : tableData;
    return newData;
  };

  const filteredData = filterTableData(data, filters);

  return { filteredData, filters, setFilters };
};
