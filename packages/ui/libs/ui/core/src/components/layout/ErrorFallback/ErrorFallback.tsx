import { Paper, PaperProps, Typography, TypographyProps } from '@mui/material';
import { Global, css } from '@emotion/react';
import React, { DetailedHTMLProps, HTMLAttributes, ReactNode } from 'react';
import { useStyles } from './ErrorFallback.styles';

export interface ErrorFallbackProps {
  error: Error;
  title?: string;
  children?: ReactNode;
  wrapperProps?: DetailedHTMLProps<
    HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >;
  paperProps?: PaperProps;
  titleProps?: TypographyProps;
  messageProps?: TypographyProps;
}

export const ErrorFallback = ({
  error,
  title = '',
  wrapperProps,
  paperProps,
  titleProps,
  messageProps,
  children,
}: ErrorFallbackProps) => {
  const classes = useStyles();
  return (
    <div className={classes.wrapper} {...wrapperProps}>
      <Paper className={classes.paper} {...paperProps}>
        {title && (
          <Typography variant="h5" align="center" gutterBottom {...titleProps}>
            {title}
          </Typography>
        )}
        <Typography color="textSecondary" align="center" {...messageProps}>
          {error.message}
        </Typography>
        {children}
      </Paper>
      <Global styles={css({ body: { margin: 0 } })} />
    </div>
  );
};
