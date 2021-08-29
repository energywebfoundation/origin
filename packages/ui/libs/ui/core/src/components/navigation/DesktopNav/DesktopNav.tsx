import { BoxProps, Drawer, List } from '@material-ui/core';
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
}

export const DesktopNav: FC<DesktopNavProps> = ({
  userAndOrgData,
  menuSections = [],
  isAuthenticated,
  icon,
  iconWrapperProps,
}) => {
  const classes = useStyles();
  return (
    <Drawer anchor="left" open variant="permanent" className={classes.drawer}>
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
