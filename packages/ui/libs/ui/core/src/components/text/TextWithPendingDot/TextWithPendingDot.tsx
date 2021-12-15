import React, { FC } from 'react';
import { Tooltip, Typography, TypographyProps } from '@mui/material';
import { Dot } from './Dot';
import { useStyles } from './TextWithPendingDot.styles';
import { useTheme } from '@mui/styles';

export interface TextWithPendingDotProps {
  textContent: string;
  pending?: boolean;
  tooltipText?: string;
  typographyProps?: TypographyProps & { component?: 'span' | 'p' };
  showSuccessDot?: boolean;
}

export const TextWithPendingDot: FC<TextWithPendingDotProps> = ({
  textContent,
  pending = false,
  tooltipText = '',
  typographyProps,
  showSuccessDot = false,
}) => {
  const classes = useStyles();
  const theme = useTheme();
  const dotBgColor = showSuccessDot ? theme.palette.primary.main : undefined;

  return (
    <div className={classes.blockWrapper}>
      <div>
        <Typography {...typographyProps}>{textContent}</Typography>
      </div>
      {(pending || showSuccessDot) && (
        <Tooltip title={tooltipText}>
          <div className={classes.dotWrapper}>
            <Dot backgroundColor={dotBgColor} />
          </div>
        </Tooltip>
      )}
    </div>
  );
};
