import React, { DetailedHTMLProps, FC, HTMLAttributes } from 'react';
import { useStyles } from './FallbackIcon.styles';

export interface FallbackIconProps {
  icon: FC<React.SVGProps<SVGSVGElement>>;
  wrapperProps?: DetailedHTMLProps<
    HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >;
  hoverText?: string;
  iconProps?: React.SVGProps<SVGSVGElement>;
  overlayProps?: DetailedHTMLProps<
    HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >;
  overlayTextProps?: DetailedHTMLProps<
    HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >;
}

export const FallbackIcon: FC<FallbackIconProps> = ({
  icon: Icon,
  wrapperProps,
  hoverText,
  iconProps,
  overlayProps,
  overlayTextProps,
}) => {
  const classes = useStyles();
  return (
    <div className={classes.wrapper} {...wrapperProps}>
      <Icon {...iconProps} />
      {!!hoverText && (
        <div className={classes.overlay} {...overlayProps}>
          <div className={classes.text} {...overlayTextProps}>
            {hoverText}
          </div>
        </div>
      )}
    </div>
  );
};
