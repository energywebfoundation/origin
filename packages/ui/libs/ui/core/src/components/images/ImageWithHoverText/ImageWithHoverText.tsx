import React, { FC, ImgHTMLAttributes } from 'react';
import { useStyles } from './ImageWithHoverText.styles';

export interface ImageWithHoverTextProps {
  src: string;
  text: string;
  alt?: string;
  imageProps?: ImgHTMLAttributes<HTMLImageElement>;
}

export const ImageWithHoverText: FC<ImageWithHoverTextProps> = ({
  src,
  text,
  alt,
  imageProps,
}) => {
  const classes = useStyles();
  return (
    <div {...imageProps}>
      <img src={src} alt={alt} {...imageProps} />
      <div className={classes.overlay}>
        <div className={classes.text}>{text}</div>
      </div>
    </div>
  );
};
