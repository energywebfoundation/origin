import { Typography, TypographyProps } from '@mui/material';
import React, {
  DetailedHTMLProps,
  FC,
  HTMLAttributes,
  ImgHTMLAttributes,
} from 'react';
import { useStyles } from './ImageWithHoverText.styles';

export interface ImageWithHoverTextProps {
  src: string;
  text: string;
  alt?: string;
  imageWrapperProps?: DetailedHTMLProps<
    HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >;
  imageProps?: ImgHTMLAttributes<HTMLImageElement>;
  overlayProps?: DetailedHTMLProps<
    HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >;
  overlayTextProps?: TypographyProps;
}

export const ImageWithHoverText: FC<ImageWithHoverTextProps> = ({
  src,
  text,
  alt,
  imageWrapperProps,
  imageProps,
  overlayProps,
  overlayTextProps,
}) => {
  const classes = useStyles();
  return (
    <div className={classes.wrapper} {...imageWrapperProps}>
      <img src={src} alt={alt} {...imageProps} />
      <div className={classes.overlay} {...overlayProps}>
        <Typography {...overlayTextProps}>{text}</Typography>
      </div>
    </div>
  );
};
