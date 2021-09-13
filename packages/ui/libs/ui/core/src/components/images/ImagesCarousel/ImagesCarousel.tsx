import React, { DetailedHTMLProps, FC, ImgHTMLAttributes } from 'react';
// import Carousel, { CarouselProps } from 'react-material-ui-carousel';

export interface ImagesCarouselProps {
  carouselProps?: any; //CarouselProps;
  itemProps?: DetailedHTMLProps<
    ImgHTMLAttributes<HTMLImageElement>,
    HTMLImageElement
  >;
}

export const ImagesCarousel: FC<ImagesCarouselProps> = ({
  carouselProps,
  children,
}) => {
  return <div></div>;
  // return <Carousel {...carouselProps}>{children}</Carousel>;
};
