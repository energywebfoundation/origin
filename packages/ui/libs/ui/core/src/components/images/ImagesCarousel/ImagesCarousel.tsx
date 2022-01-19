import React, { FC } from 'react';
import { useImagesCarouselEffects } from './ImagesCarousel.effects';

export interface ImagesCarouselProps {
  images: string[];
  refreshInterval?: number;
  imagesProps?: React.SVGAttributes<HTMLOrSVGElement>;
}

export const ImagesCarousel: FC<ImagesCarouselProps> = ({
  images,
  refreshInterval,
  imagesProps,
}) => {
  const { currentIndex } = useImagesCarouselEffects(
    images.length,
    refreshInterval
  );

  return (
    <div>
      <img src={images[currentIndex]} {...imagesProps} />
    </div>
  );
};
