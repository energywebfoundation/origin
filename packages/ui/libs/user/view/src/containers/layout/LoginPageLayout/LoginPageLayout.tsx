import React, { FC, ReactNode } from 'react';
import { EnergyWebBackground } from '@energyweb/origin-ui-assets';
import { useStyles } from './LoginPageLayout.styles';

export interface LoginPageLayoutProps {
  children: ReactNode;
  bgImage?: string;
}

export const LoginPageLayout: FC<LoginPageLayoutProps> = ({
  bgImage,
  children,
}) => {
  const classes = useStyles();
  return (
    <>
      <img
        className={classes.background}
        src={bgImage || EnergyWebBackground}
        alt="login-page-background"
      />
      {children}
    </>
  );
};
