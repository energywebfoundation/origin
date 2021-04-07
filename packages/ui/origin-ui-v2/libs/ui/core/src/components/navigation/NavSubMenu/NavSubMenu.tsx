/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx, css } from '@emotion/react';
import { Collapse, List } from '@material-ui/core';
import { FC, memo } from 'react';
import { MenuItem } from '../MenuItem';
import { TModuleMenuItem } from '../NavBarSection';

export interface NavSubMenuProps {
  open: boolean;
  rootUrl: string;
  menuList: TModuleMenuItem[];
}

const listCss = css({
  padding: 0,
});

export const NavSubMenu: FC<NavSubMenuProps> = memo(
  ({ open, menuList, rootUrl }) => {
    return (
      <Collapse in={open} timeout="auto">
        <List css={listCss}>
          {menuList?.map((item) => {
            if (item.show) {
              const link = `${rootUrl}/${item.url}`;
              return <MenuItem key={link} url={link} label={item.label} />;
            }
            return;
          })}
        </List>
      </Collapse>
    );
  }
);
