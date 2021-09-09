import { useLocation } from 'react-router';

export const useQueryParams = () => {
  const location = useLocation();
  return new URLSearchParams(location.search);
};
