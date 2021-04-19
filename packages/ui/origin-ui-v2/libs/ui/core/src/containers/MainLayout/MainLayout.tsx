import React from 'react';
import { FC } from 'react';
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
}

export const MainLayout: FC<MainLayoutProps> = ({
  topbarButtons,
  children,
  menuSections,
  userData,
  orgData,
}) => {
  const { mobileNavOpen, setMobileNavOpen } = useMainLayoutEffects();

  return (
    <>
      <TopBar
        buttons={topbarButtons}
        onMobileNavOpen={() => setMobileNavOpen(true)}
      />
      <NavBar
        openMobile={mobileNavOpen}
        onMobileClose={() => setMobileNavOpen(false)}
        menuSections={menuSections}
        userData={userData}
        orgData={orgData}
      />
      <PageWrapper>{children}</PageWrapper>
    </>
  );
};
