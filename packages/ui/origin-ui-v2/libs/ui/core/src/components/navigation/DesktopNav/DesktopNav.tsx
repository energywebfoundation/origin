import { Drawer, List } from '@material-ui/core';
import React, { FC } from 'react';
import { TMenuSection, NavBarSection } from '../NavBarSection';
import { UsernameAndOrg, UsernameAndOrgProps } from '../../layout';
import { IconLink } from '../../icons';
import { EnergyWebLogo } from '@energyweb/origin-ui-assets';
import { useStyles } from './DesktopNav.styles';
import { useDesktopNavEffects } from './DesktopNav.effects';
export interface DesktopNavProps {
  userAndOrgData: UsernameAndOrgProps;
  menuSections: TMenuSection[];
}

export const DesktopNav: FC<DesktopNavProps> = ({
  userAndOrgData,
  menuSections,
}) => {
  // @should-update to a robust and real default value
  const { openSection, setOpenSection } = useDesktopNavEffects(
    menuSections[0].rootUrl
  );
  const classes = useStyles();
  return (
    <Drawer anchor="left" open variant="permanent" className={classes.drawer}>
      <IconLink url="/">
        <EnergyWebLogo className={classes.logo} />
      </IconLink>
      <UsernameAndOrg className={classes.userAndOrg} {...userAndOrgData} />
      <List className={classes.list}>
        {menuSections.map((section) => (
          <NavBarSection
            key={section.sectionTitle}
            isOpen={section.rootUrl === openSection}
            titleClickHandler={() => setOpenSection(section.rootUrl)}
            {...section}
          />
        ))}
      </List>
    </Drawer>
  );
};
