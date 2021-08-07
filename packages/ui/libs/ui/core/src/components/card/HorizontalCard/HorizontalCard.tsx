import React from 'react';
import {
  Box,
  Card,
  CardMedia,
  CardContent,
  CardContentProps,
} from '@material-ui/core';
import { FallbackIconProps, FallbackIcon } from '../../icons';
import { useStyles } from './HorizontalCard.styles';

export interface HorizontalCardProps {
  onClick: () => void;
  selected: boolean;
  header: React.ReactNode;
  content: React.ReactNode;
  imageUrl?: string;
  fallbackIcon?: FallbackIconProps['icon'];
  fallbackIconProps?: FallbackIconProps['iconProps'];
  fallbackIconWrapperProps?: FallbackIconProps['wrapperProps'];
  cardHeaderProps?: CardContentProps;
  cardContentProps?: CardContentProps;
}

export const HorizontalCard: React.FC<HorizontalCardProps> = ({
  onClick,
  selected,
  header,
  content,
  imageUrl,
  fallbackIcon,
  fallbackIconProps,
  fallbackIconWrapperProps,
  cardHeaderProps,
  cardContentProps,
}) => {
  const classes = useStyles();
  const cardClass = `${classes.card} ${selected && classes.selectedCard}`;

  return (
    <Card className={cardClass} onClick={onClick}>
      {imageUrl ? (
        <CardMedia image={imageUrl} className={classes.image} />
      ) : fallbackIcon ? (
        <CardMedia className={classes.image}>
          <FallbackIcon
            icon={fallbackIcon}
            iconProps={fallbackIconProps}
            wrapperProps={fallbackIconWrapperProps}
          />
        </CardMedia>
      ) : null}
      <Box className={classes.contentWrapper}>
        <CardContent className={classes.header} {...cardHeaderProps}>
          {header}
        </CardContent>
        <CardContent {...cardContentProps}>{content}</CardContent>
      </Box>
    </Card>
  );
};
