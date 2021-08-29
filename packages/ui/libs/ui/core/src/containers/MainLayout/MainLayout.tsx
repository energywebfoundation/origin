import { BoxProps } from '@material-ui/core';
import React, { ReactNode } from 'react';
import { FC } from 'react';
import { Outlet } from 'react-router-dom';
import {
  NavBar,
  OrgNavData,
  PageWrapper,
  TMenuSection,
  TopBar,
  TopBarButtonData,
  UserNavData,
} from '../../components';
import { useMainLayoutEffects } from './MainLayout.effects';

interface MainLayoutProps {
  topbarButtons: TopBarButtonData[];
  menuSections: TMenuSection[];
  userData: UserNavData;
  orgData: OrgNavData;
  isAuthenticated: boolean;
  icon?: ReactNode;
  iconWrapperProps?: BoxProps;
}

export const MainLayout: FC<MainLayoutProps> = ({
  topbarButtons,
  menuSections,
  userData,
  orgData,
  isAuthenticated,
  icon,
  iconWrapperProps,
}) => {
  const { mobileNavOpen, setMobileNavOpen } = useMainLayoutEffects();
  return (
    <>
      <TopBar
        isAuthenticated={isAuthenticated}
        buttons={topbarButtons}
        onMobileNavOpen={() => setMobileNavOpen(true)}
      />
      <NavBar
        isAuthenticated={isAuthenticated}
        openMobile={mobileNavOpen}
        onMobileClose={() => setMobileNavOpen(false)}
        menuSections={menuSections}
        userData={userData}
        orgData={orgData}
        icon={icon}
        iconWrapperProps={iconWrapperProps}
      />
      <PageWrapper>
        <Outlet />
      </PageWrapper>
    </>
  );
};
