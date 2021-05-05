import React, { FC } from 'react';
import { useStyles } from './FallbackIcon.styles';

export interface FallbackIconProps {
  icon: FC<React.SVGProps<SVGSVGElement>>;
  hoverText?: string;
}

export const FallbackIcon: FC<FallbackIconProps> = ({
  icon: Icon,
  hoverText,
  ...props
}) => {
  const classes = useStyles();
  return (
    <div className={classes.wrapper}>
      <Icon {...props} />
      <div className={classes.overlay}>
        <div className={classes.text}>{hoverText}</div>
      </div>
    </div>
  );
};
