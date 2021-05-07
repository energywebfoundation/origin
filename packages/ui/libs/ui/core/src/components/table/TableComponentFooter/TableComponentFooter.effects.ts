import { useState } from 'react';

export const useTableFooterEffects = () => {
  const [currentPage, setCurrentPage] = useState(1);

  return { currentPage, setCurrentPage };
};
