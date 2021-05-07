import React, { DetailedHTMLProps, FC, ImgHTMLAttributes } from 'react';
import { useStyles } from './ImageTintedBottom.styles';

export interface ImageTintedBottomProps
  extends DetailedHTMLProps<
    ImgHTMLAttributes<HTMLImageElement>,
    HTMLImageElement
  > {
  src: string;
}

export const ImageTintedBottom: FC<ImageTintedBottomProps> = ({
  src,
  children,
  ...props
}) => {
  const classes = useStyles();
  return (
    <div className={classes.imgHolder}>
      <img src={src} {...props} />
      {children}
      <div className={classes.tintedBottom}></div>
    </div>
  );
};
