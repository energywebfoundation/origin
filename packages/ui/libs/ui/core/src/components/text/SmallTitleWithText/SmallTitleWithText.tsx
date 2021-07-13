import { Typography } from '@material-ui/core';
import React, { ReactNode } from 'react';
import { useStyles } from './SmallTitleWithText.styles';

export interface SmallTitleWithTextProps {
  title?: string;
  titleElement?: ReactNode;
  text: string;
  wrapperProps?: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >;
}

export const SmallTitleWithText: React.FC<SmallTitleWithTextProps> = ({
  title,
  titleElement,
  text,
  wrapperProps,
}) => {
  const classes = useStyles();
  return (
    <div {...wrapperProps}>
      {!titleElement ? (
        <Typography color="textSecondary" margin="normal">
          {title || ''}
        </Typography>
      ) : (
        titleElement
      )}
      <Typography margin="dense" className={classes.text}>
        {text}
      </Typography>
    </div>
  );
};
