/** @jsxRuntime classic */
/** @jsx jsx */
/// <reference types="@emotion/react/types/css-prop" />
import { css, jsx } from '@emotion/react';
import { Drawer, List } from '@material-ui/core';
import { FC } from 'react';
import { TMenuSection, NavBarSection } from '../NavBarSection';
import { UsernameAndOrg, UsernameAndOrgProps } from '../../layout';
import { IconLink } from '../../icons';
import { EnergyWebLogo } from '@energyweb/origin-ui-assets';

export interface DesktopNavProps {
  userAndOrgData: UsernameAndOrgProps;
  menuSections: TMenuSection[];
}

const drawerCss = css({
  '& > .MuiDrawer-paper': {
    width: 200,
  },
});
const logoCss = css({
  margin: '20px',
  '& img': {
    width: 120,
  },
});
const userAndOrgCss = css({
  margin: '0 10px 20px 20px',
});
const listCss = css({
  padding: 0,
});

export const DesktopNav: FC<DesktopNavProps> = ({
  userAndOrgData,
  menuSections,
}) => {
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
