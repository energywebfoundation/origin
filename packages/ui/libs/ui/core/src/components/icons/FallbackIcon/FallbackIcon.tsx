import React, { FC } from 'react';
import { useStyles } from './FallbackIcon.styles';

export interface FallbackIconProps {
  icon: FC<React.SVGProps<SVGSVGElement>>;
  wrapperProps?: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >;
  hoverText?: string;
  iconProps?: React.SVGProps<SVGSVGElement>;
}

export const FallbackIcon: FC<FallbackIconProps> = ({
  icon: Icon,
  wrapperProps,
  hoverText,
  iconProps,
}) => {
  const classes = useStyles();
  return (
    <div className={classes.wrapper} {...wrapperProps}>
      <Icon {...iconProps} />
      {!!hoverText && (
        <div className={classes.overlay}>
          <div className={classes.text}>{hoverText}</div>
        </div>
      )}
    </div>
  );
};
