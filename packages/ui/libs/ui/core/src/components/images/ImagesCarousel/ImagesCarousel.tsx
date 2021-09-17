import React, { FC } from 'react';
import { useImagesCarouselEffects } from './ImagesCarousel.effects';

export interface ImagesCarouselProps {
  images: string[];
  imagesProps?: React.SVGAttributes<HTMLOrSVGElement>;
}

export const ImagesCarousel: FC<ImagesCarouselProps> = ({
  images,
  imagesProps,
}) => {
  const { currentIndex } = useImagesCarouselEffects(images.length);

  return (
    <div>
      <img src={images[currentIndex]} {...imagesProps} />
    </div>
  );
};
