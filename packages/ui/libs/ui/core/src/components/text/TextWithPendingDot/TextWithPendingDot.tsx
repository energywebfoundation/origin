import React, { FC, memo } from 'react';
import { Tooltip, Typography, TypographyVariant } from '@material-ui/core';
import { Dot } from '../../icons';
import { useStyles } from './TextWithPendingDot.styles';

export interface TextWithPendingDotProps {
  textContent: string;
  pending: boolean;
  tooltipText?: string;
  variant?: TypographyVariant;
}

export const TextWithPendingDot: FC<TextWithPendingDotProps> = memo(
  ({ textContent, pending = false, tooltipText, variant }) => {
    const classes = useStyles();
    return (
      <div className={classes.blockWrapper}>
        <Typography variant={variant}>{textContent}</Typography>
        {pending && (
          <Tooltip title={tooltipText}>
            <div className={classes.dotWrapper}>
              <Dot />
            </div>
          </Tooltip>
        )}
      </div>
    );
  }
);
