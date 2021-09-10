import { useState } from 'react';
import { CarouselModeEnum } from '../CarouselControls';

export const useDetailViewCarouselEffects = () => {
  const [carouselMode, setCarouselMode] = useState(CarouselModeEnum.Photo);

  const handleModeChange = (
    event: React.MouseEvent<HTMLElement>,
    mode: CarouselModeEnum
  ) => {
    setCarouselMode(mode);
  };

  return { carouselMode, handleModeChange };
};
