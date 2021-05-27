import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Typography,
} from '@material-ui/core';
import React, { FC, ReactNode } from 'react';
import { ImageWithHoverText } from '../../images';
import { FallbackIcon } from '../../icons';
import { useStyles } from './CardWithImage.styles';

export interface CardWithImageProps {
  heading: string;
  content: ReactNode;
  fallbackIcon?: FC<React.SVGProps<SVGSVGElement>>;
  fallbackIconProps?: React.SVGProps<SVGSVGElement>;
  imageUrl?: string;
  hoverText?: string;
}

export const CardWithImage: FC<CardWithImageProps> = ({
  heading,
  content,
  fallbackIcon,
  fallbackIconProps,
  imageUrl,
  hoverText,
}) => {
  const classes = useStyles();
  return (
    <Card>
      <CardActionArea>
        {imageUrl ? (
          <ImageWithHoverText
            src={imageUrl}
            text={hoverText}
            imageProps={{ className: classes.image }}
          />
        ) : (
          <FallbackIcon
            icon={fallbackIcon}
            hoverText={hoverText}
            {...fallbackIconProps}
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
