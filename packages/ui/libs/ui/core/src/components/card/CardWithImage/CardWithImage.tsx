import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardProps,
  Typography,
} from '@material-ui/core';
import React, { FC, ReactNode } from 'react';
import { ImageWithHoverText } from '../../images';
import { FallbackIcon } from '../../icons';
import { useStyles } from './CardWithImage.styles';

export interface CardWithImageProps {
  heading: string;
  content: ReactNode;
  onActionClick?: () => void;
  fallbackIcon?: FC<React.SVGProps<SVGSVGElement>>;
  fallbackIconProps?: React.SVGProps<SVGSVGElement>;
  imageUrl?: string;
  hoverText?: string;
  cardProps?: CardProps;
}

export const CardWithImage: FC<CardWithImageProps> = ({
  heading,
  content,
  fallbackIcon,
  fallbackIconProps,
  imageUrl,
  hoverText,
  onActionClick,
  cardProps,
}) => {
  const classes = useStyles();
  return (
    <Card {...cardProps}>
      <CardActionArea onClick={onActionClick}>
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
