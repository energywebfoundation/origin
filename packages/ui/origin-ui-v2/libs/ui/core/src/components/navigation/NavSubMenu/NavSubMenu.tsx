/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx, css } from '@emotion/react';
import { Collapse, List } from '@material-ui/core';
import React, { FC, memo } from 'react';
import { MenuItem } from '../MenuItem';
import { TModuleMenuItem } from '../NavBarSection';

export interface NavSubMenuProps {
  open: boolean;
  rootUrl: string;
  menuList: TModuleMenuItem[];
  // add OriginFeature
  enabledFeatures?: any[];
}

const listCss = css({
  padding: 0,
});

export const NavSubMenu: FC<NavSubMenuProps> = memo(
  ({ open, menuList, rootUrl, enabledFeatures }) => {
    return (
      <Collapse in={open} timeout="auto">
        <List css={listCss}>
          {menuList?.map((item) => {
            if (
              item.show &&
              (item.features
                ? item.features.every((flag) => enabledFeatures?.includes(flag))
                : true)
            ) {
              const link = `${rootUrl}/${item.url}`;

              return (
                <MenuItem url={link} label={item.label} key={item.label} />
              );
            }
          })}
        </List>
      </Collapse>
    );
  }
);
