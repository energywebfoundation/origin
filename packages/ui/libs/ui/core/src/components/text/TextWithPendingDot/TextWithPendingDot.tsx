import React, { FC } from 'react';
import {
  Box,
  Tooltip,
  Typography,
  TypographyProps,
  BoxProps,
} from '@mui/material';
import { Dot } from '../../icons';
import { useStyles } from './TextWithPendingDot.styles';
import { useTheme } from '@mui/styles';

export interface TextWithPendingDotProps {
  textContent: string;
  pending: boolean;
  tooltipText?: string;
  typographyProps?: TypographyProps & { component?: 'span' | 'p' };
  showSuccessDot?: boolean;
  dotWrapperProps?: BoxProps & { ['data-cy']: string };
}

export const TextWithPendingDot: FC<TextWithPendingDotProps> = ({
  textContent,
  pending = false,
  tooltipText,
  typographyProps,
  showSuccessDot = false,
  dotWrapperProps,
}) => {
  const classes = useStyles();
  const theme = useTheme();
  return (
    <div className={classes.blockWrapper}>
      <div>
        <Typography {...typographyProps}>{textContent}</Typography>
      </div>
      {(pending || showSuccessDot) && (
        <Tooltip title={tooltipText}>
          <Box className={classes.dotWrapper} {...dotWrapperProps}>
            <Dot
              backgroundColor={
                showSuccessDot ? theme.palette.primary.main : undefined
              }
            />
          </Box>
        </Tooltip>
      )}
    </div>
  );
};
