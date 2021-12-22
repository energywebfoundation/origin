import { BoxProps, PaperProps, SwitchProps } from '@mui/material';
import { ThemeModeEnum } from '@energyweb/origin-ui-theme';
import React, { ReactNode, useState } from 'react';
import { FC } from 'react';
import { Outlet } from 'react-router-dom';
import {
  NavBar,
  OrgNavData,
  TMenuSection,
  UserNavData,
} from '../../navigation';
import { TopBar, TopBarButtonData } from '../TopBar';
import { PageWrapper } from '../PageWrapper';

export interface MainLayoutProps {
  topbarButtons: TopBarButtonData[];
  menuSections: TMenuSection[];
  userData: UserNavData;
  orgData: OrgNavData;
  isAuthenticated: boolean;
  icon?: ReactNode;
  iconWrapperProps?: BoxProps;
  topBarClassName?: string;
  navBarPaperProps?: PaperProps;
  themeSwitcher?: boolean;
  themeMode?: ThemeModeEnum;
  changeThemeMode?: () => void;
  themeSwitchProps?: Omit<SwitchProps, 'checked' | 'onChange'>;
}

export const MainLayout: FC<MainLayoutProps> = ({
  topbarButtons,
  menuSections,
  userData,
  orgData,
  isAuthenticated,
  icon = null,
  iconWrapperProps,
  topBarClassName = '',
  navBarPaperProps,
  themeSwitcher = false,
  themeMode = ThemeModeEnum.Dark,
  changeThemeMode,
  themeSwitchProps,
}) => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const handleMobileNavOpen = () => setMobileNavOpen(true);
  const handleMobileNavClose = () => setMobileNavOpen(false);

  return (
    <>
      <TopBar
        buttons={topbarButtons}
        onMobileNavOpen={handleMobileNavOpen}
        toolbarClassName={topBarClassName}
        themeSwitcher={themeSwitcher}
        themeMode={themeMode}
        changeThemeMode={changeThemeMode}
        themeSwitchProps={themeSwitchProps}
      />
      <NavBar
        isAuthenticated={isAuthenticated}
        openMobile={mobileNavOpen}
        onMobileClose={handleMobileNavClose}
        menuSections={menuSections}
        userData={userData}
        orgData={orgData}
        icon={icon}
        iconWrapperProps={iconWrapperProps}
        paperProps={navBarPaperProps}
      />
      <PageWrapper>
        <Outlet />
      </PageWrapper>
    </>
  );
};
