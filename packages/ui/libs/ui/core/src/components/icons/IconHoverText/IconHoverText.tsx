import { Typography, TypographyProps } from '@mui/material';
import React, { DetailedHTMLProps, FC, HTMLAttributes } from 'react';
import { useStyles } from './IconHoverText.styles';

export interface IconHoverTextProps {
  icon: FC<React.SVGProps<SVGSVGElement>>;
  hoverText?: string;
  wrapperProps?: DetailedHTMLProps<
    HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >;
  iconProps?: React.SVGProps<SVGSVGElement>;
  overlayProps?: DetailedHTMLProps<
    HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >;
  overlayTextProps?: TypographyProps;
}

export const IconHoverText: FC<IconHoverTextProps> = ({
  icon: Icon,
  hoverText = '',
  wrapperProps,
  iconProps,
  overlayProps,
  overlayTextProps,
}) => {
  const classes = useStyles();
  return (
    <div className={classes.wrapper} {...wrapperProps}>
      <Icon {...iconProps} />
      {hoverText ? (
        <div className={classes.overlay} {...overlayProps}>
          <Typography {...overlayTextProps}>{hoverText}</Typography>
        </div>
      ) : null}
    </div>
  );
};
