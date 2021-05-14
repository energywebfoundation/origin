import { Hidden } from '@material-ui/core';
import React, { FC } from 'react';
import { UsernameAndOrgProps } from '../../layout';
import { DesktopNav } from '../DesktopNav';
import { MobileNav } from '../MobileNav';
import { TMenuSection } from '../NavBarSection';

export type UserNavData = Pick<
  UsernameAndOrgProps,
  'username' | 'userPending' | 'userTooltip'
>;
export type OrgNavData = Pick<
  UsernameAndOrgProps,
  'orgName' | 'orgPending' | 'orgTooltip'
>;

export interface NavBarProps {
  userData: UserNavData;
  orgData: OrgNavData;
  openMobile: boolean;
  onMobileClose: () => void;
  menuSections: TMenuSection[];
  isAuthenticated: boolean;
}

export const NavBar: FC<NavBarProps> = ({
  menuSections,
  openMobile,
  onMobileClose,
  userData,
  orgData,
  isAuthenticated,
}) => {
  return (
    <>
      <Hidden lgUp>
        <MobileNav
          open={openMobile}
          onClose={onMobileClose}
          menuSections={menuSections}
        />
      </Hidden>
      <Hidden lgDown>
        <DesktopNav
          isAuthenticated={isAuthenticated}
          userAndOrgData={{ ...userData, ...orgData }}
          menuSections={menuSections}
        />
      </Hidden>
    </>
  );
};
