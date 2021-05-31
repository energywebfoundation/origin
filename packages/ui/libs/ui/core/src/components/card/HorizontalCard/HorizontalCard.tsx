import React from 'react';
import {
  Box,
  Card,
  CardMedia,
  CardContent,
  CardContentProps,
} from '@material-ui/core';
import { FallbackIcon } from '@energyweb/origin-ui-core';
import { useStyles } from './HorizontalCard.styles';
import { FallbackIconProps } from '../../icons';

export interface HorizontalCardProps {
  onClick: () => void;
  selected: boolean;
  header: React.ReactNode;
  content: React.ReactNode;
  imageUrl?: string;
  fallbackIcon?: FallbackIconProps['icon'];
  fallbackIconProps?: FallbackIconProps['wrapperProps'];
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
          <FallbackIcon icon={fallbackIcon} wrapperProps={fallbackIconProps} />
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
