import { useMemo, useState } from 'react';

export const usePaginateData = <T>(data: T[], pageSize: number) => {
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
