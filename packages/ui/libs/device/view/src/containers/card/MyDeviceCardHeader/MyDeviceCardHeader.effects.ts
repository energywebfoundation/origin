import { useNavigate } from 'react-router';

export const useMyDeviceCardHeaderEffects = (link: string) => {
  const navigate = useNavigate();

  const clickHandler = () => {
    navigate(link);
  };

  return clickHandler;
};
