/** @jsxRuntime classic */
/** @jsx jsx */
/// <reference types="@emotion/react/types/css-prop" />
import { jsx } from '@emotion/react';
import { Drawer, List } from '@material-ui/core';
import { FC } from 'react';
import { TMenuSection, NavBarSection } from '../NavBarSection';
import { UsernameAndOrg, UsernameAndOrgProps } from '../../layout';
import { IconLink } from '../../icons';
import { EnergyWebLogo } from '@energyweb/origin-ui-assets';
import { useComponentStyles } from './styles';

export interface DesktopNavProps {
  userAndOrgData: UsernameAndOrgProps;
  menuSections: TMenuSection[];
}

export const DesktopNav: FC<DesktopNavProps> = ({
  userAndOrgData,
  menuSections,
}) => {
  const { drawerCss, logoCss, userAndOrgCss, listCss } = useComponentStyles();
  return (
    <Drawer anchor="left" open variant="permanent" css={drawerCss}>
      <IconLink url="/" css={logoCss}>
        <EnergyWebLogo />
      </IconLink>
      <UsernameAndOrg css={userAndOrgCss} {...userAndOrgData} />
      <List css={listCss}>
        {menuSections?.map((section) => (
          <NavBarSection key={section.sectionTitle} {...section} />
        ))}
      </List>
    </Drawer>
  );
};
