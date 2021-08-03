import React, { FC } from 'react';
import {
  Tooltip,
  Typography,
  TypographyVariant,
  TypographyProps,
} from '@material-ui/core';
import { Dot } from '../../icons';
import { useStyles } from './TextWithPendingDot.styles';

export interface TextWithPendingDotProps {
  textContent: string;
  pending: boolean;
  tooltipText?: string;
  variant?: TypographyVariant;
  typographyProps?: TypographyProps;
}

export const TextWithPendingDot: FC<TextWithPendingDotProps> = ({
  textContent,
  pending = false,
  tooltipText,
  variant,
  typographyProps,
}) => {
  const classes = useStyles();
  return (
    <div className={classes.blockWrapper}>
      <div>
        <Typography variant={variant} {...typographyProps}>
          {textContent}
        </Typography>
      </div>
      {pending && (
        <Tooltip title={tooltipText}>
          <div className={classes.dotWrapper}>
            <Dot />
          </div>
        </Tooltip>
      )}
    </div>
  );
};
