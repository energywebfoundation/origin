import React, { DetailedHTMLProps, FC, ImgHTMLAttributes } from 'react';
import Carousel, { CarouselProps } from 'react-material-ui-carousel';
import { ImageTintedBottom } from '../ImageTintedBottom';

export interface ImagesCarouselProps {
  items: string[];
  carouselProps?: CarouselProps;
  itemProps?: DetailedHTMLProps<
    ImgHTMLAttributes<HTMLImageElement>,
    HTMLImageElement
  >;
}

export const ImagesCarousel: FC<ImagesCarouselProps> = ({
  items,
  carouselProps,
  itemProps,
  children,
}) => {
  return (
    <Carousel {...carouselProps}>
      {items.map((item) => (
        <ImageTintedBottom src={item} key={item} {...itemProps}>
          {children}
        </ImageTintedBottom>
      ))}
    </Carousel>
  );
};
