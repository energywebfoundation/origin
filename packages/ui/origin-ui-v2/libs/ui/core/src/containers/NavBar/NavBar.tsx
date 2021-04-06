import { Hidden } from '@material-ui/core';
import React, { FC } from 'react';
import {
  DesktopNav,
  MobileNav,
  TMenuSection,
  UsernameAndOrgProps,
} from '../../components';

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
}

export const NavBar: FC<NavBarProps> = ({
  menuSections,
  openMobile,
  onMobileClose,
  userData,
  orgData,
}) => {
  return (
    <>
      <Hidden mdUp>
        <MobileNav
          open={openMobile}
          onClose={onMobileClose}
          menuSections={menuSections}
        />
      </Hidden>
      <Hidden mdDown>
        <DesktopNav
          userAndOrgData={{ ...userData, ...orgData }}
          menuSections={menuSections}
        />
      </Hidden>
    </>
  );
};
