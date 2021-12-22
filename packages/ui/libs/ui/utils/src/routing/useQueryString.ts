import { useLocation } from 'react-router';
import queryString from 'query-string';

export const useQueryString = () => {
  const location = useLocation();
  return queryString.parse(location.search);
};
