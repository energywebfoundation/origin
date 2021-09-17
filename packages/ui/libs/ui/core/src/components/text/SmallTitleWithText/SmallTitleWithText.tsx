import { Typography, TypographyProps } from '@material-ui/core';
import React, { ReactNode } from 'react';
import { useStyles } from './SmallTitleWithText.styles';

export interface SmallTitleWithTextProps {
  title?: string;
  titleElement?: ReactNode;
  titleProps?: TypographyProps;
  text: string;
  textProps?: TypographyProps;
  wrapperProps?: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >;
}

export const SmallTitleWithText: React.FC<SmallTitleWithTextProps> = ({
  title,
  titleElement,
  titleProps,
  text,
  textProps,
  wrapperProps,
}) => {
  const classes = useStyles();
  return (
    <div {...wrapperProps}>
      {!titleElement ? (
        <Typography color="textSecondary" margin="normal" {...titleProps}>
          {title || ''}
        </Typography>
      ) : (
        titleElement
      )}
      <Typography margin="dense" className={classes.text} {...textProps}>
        {text}
      </Typography>
    </div>
  );
};
