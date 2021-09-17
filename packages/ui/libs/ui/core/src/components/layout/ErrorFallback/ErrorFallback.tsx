import {
  Paper,
  PaperProps,
  Typography,
  TypographyProps,
} from '@material-ui/core';
import { Global, css } from '@emotion/react';
import React, { DetailedHTMLProps, FC, HTMLAttributes } from 'react';
import { useStyles } from './ErrorFallback.styles';

interface ErrorFallbackProps {
  error: Error;
  title?: string;
  wrapperProps?: DetailedHTMLProps<
    HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >;
  paperProps?: PaperProps;
  titleProps?: TypographyProps;
  messageProps?: TypographyProps;
}

export const ErrorFallback: FC<ErrorFallbackProps> = ({
  title,
  error,
  wrapperProps,
  paperProps,
  titleProps,
  messageProps,
  children,
}) => {
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
