import { Drawer, List } from '@material-ui/core';
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
}

export const DesktopNav: FC<DesktopNavProps> = ({
  userAndOrgData,
  menuSections = [],
  isAuthenticated,
  icon,
}) => {
  const classes = useStyles();
  return (
    <Drawer anchor="left" open variant="permanent" className={classes.drawer}>
      <IconLink url="/">
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
