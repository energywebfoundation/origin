import { useEffect, useState } from 'react';

const REFRESH_INTERVAL_MS = 5000;

export const useImagesCarouselEffects = (
  imagesLength: number,
  refreshInterval?: number
) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const updateIndex = () => {
    if (currentIndex + 1 <= imagesLength - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  useEffect(() => {
    const intervalRef = setInterval(
      updateIndex,
      refreshInterval ?? REFRESH_INTERVAL_MS
    );
    return () => {
      clearInterval(intervalRef);
    };
  }, [currentIndex]);

  return { currentIndex };
};
