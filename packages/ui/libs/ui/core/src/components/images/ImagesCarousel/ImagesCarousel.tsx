import React, { DetailedHTMLProps, FC, ImgHTMLAttributes } from 'react';
import Carousel, { CarouselProps } from 'react-material-ui-carousel';

export interface ImagesCarouselProps {
  carouselProps?: CarouselProps;
  itemProps?: DetailedHTMLProps<
    ImgHTMLAttributes<HTMLImageElement>,
    HTMLImageElement
  >;
}

export const ImagesCarousel: FC<ImagesCarouselProps> = ({
  carouselProps,
  children,
}) => {
  return <Carousel {...carouselProps}>{children}</Carousel>;
};
