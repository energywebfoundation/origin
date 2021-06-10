import { useMemo, useState } from 'react';

export const TABLE_COMPONENT__DEFAULT_PAGE_SIZE = 5;

export const usePaginateData = <T>(
  data: T[],
  pageSize: number = TABLE_COMPONENT__DEFAULT_PAGE_SIZE
) => {
  const [activePage, setActivePage] = useState(0);
  const startIndex = activePage * pageSize;
  const endIndex = startIndex + pageSize;
  return {
    setActivePage,
    activePage,
    paginatedData: useMemo(
      () => data.slice(startIndex, endIndex),
      [data, startIndex, endIndex]
    ),
  };
};
