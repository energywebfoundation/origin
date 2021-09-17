import {
  Box,
  Card,
  CardActionArea,
  CardActionAreaProps,
  CardContent,
  CardProps,
  Typography,
} from '@material-ui/core';
import React, {
  DetailedHTMLProps,
  FC,
  HTMLAttributes,
  ImgHTMLAttributes,
  ReactNode,
} from 'react';
import { ImageWithHoverText } from '../../images';
import { FallbackIcon } from '../../icons';
import { useStyles } from './CardWithImage.styles';

export interface CardWithImageProps {
  heading: string;
  content: ReactNode;
  imageUrl: string;
  onActionClick?: () => void;
  fallbackIcon?: FC<React.SVGProps<SVGSVGElement>>;
  fallbackIconWrapperProps?: DetailedHTMLProps<
    HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >;
  fallbackIconProps?: React.SVGProps<SVGSVGElement>;
  hoverText?: string;
  cardProps?: CardProps;
  cardActionAreaProps?: CardActionAreaProps;
  imageWrapperProps?: DetailedHTMLProps<
    HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >;
  imageProps?: ImgHTMLAttributes<HTMLImageElement>;
  overlayProps?: DetailedHTMLProps<
    HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >;
  overlayTextProps?: DetailedHTMLProps<
    HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >;
}

export const CardWithImage: FC<CardWithImageProps> = ({
  heading,
  content,
  fallbackIcon,
  fallbackIconWrapperProps,
  fallbackIconProps,
  imageUrl,
  hoverText,
  onActionClick,
  cardProps,
  cardActionAreaProps,
  imageWrapperProps,
  imageProps,
  overlayProps,
  overlayTextProps,
}) => {
  const classes = useStyles();
  return (
    <Card className={classes.card} {...cardProps}>
      <CardActionArea onClick={onActionClick} {...cardActionAreaProps}>
        {imageUrl ? (
          <ImageWithHoverText
            src={imageUrl}
            text={hoverText}
            imageWrapperProps={
              imageWrapperProps || { className: classes.imageWrapper }
            }
            imageProps={imageProps || { className: classes.image }}
            overlayProps={overlayProps}
            overlayTextProps={overlayTextProps}
          />
        ) : (
          <FallbackIcon
            icon={fallbackIcon}
            hoverText={hoverText}
            iconProps={fallbackIconProps || { className: classes.image }}
            wrapperProps={fallbackIconWrapperProps}
            overlayProps={overlayProps}
            overlayTextProps={overlayTextProps}
          />
        )}
      </CardActionArea>
      <Box py={1} px={2} className={classes.heading}>
        <Typography variant="h6">{heading}</Typography>
      </Box>
      <CardContent>{content}</CardContent>
    </Card>
  );
};
