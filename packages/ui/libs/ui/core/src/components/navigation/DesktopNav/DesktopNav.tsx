import { BoxProps, Drawer, List, PaperProps } from '@material-ui/core';
import React, { FC, ReactNode } from 'react';
import { TMenuSection, NavBarSection } from '../NavBarSection';
import { UsernameAndOrg, UsernameAndOrgProps } from '../../layout';
import { IconLink } from '../../icons';
import { EnergyWebLogo } from '@energyweb/origin-ui-assets';
import { useStyles } from './DesktopNav.styles';

export interface DesktopNavProps {
  userAndOrgData: UsernameAndOrgProps;
  isAuthenticated: boolean;
  menuSections: TMenuSection[];
  icon?: ReactNode;
  iconWrapperProps?: BoxProps;
  sidebarPaperProps?: PaperProps;
}

export const DesktopNav: FC<DesktopNavProps> = ({
  userAndOrgData,
  menuSections = [],
  isAuthenticated,
  icon,
  iconWrapperProps,
  sidebarPaperProps,
}) => {
  const classes = useStyles();
  return (
    <Drawer
      open
      anchor="left"
      variant="permanent"
      className={classes.drawer}
      PaperProps={sidebarPaperProps}
    >
      <IconLink url="/" wrapperProps={iconWrapperProps}>
        {icon ? icon : <EnergyWebLogo className={classes.logo} />}
      </IconLink>
      {isAuthenticated && (
        <UsernameAndOrg className={classes.userAndOrg} {...userAndOrgData} />
      )}
      <List className={classes.list}>
        {menuSections.map((section) => (
          <NavBarSection key={section.sectionTitle} {...section} />
        ))}
      </List>
    </Drawer>
  );
};
