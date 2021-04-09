/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@emotion/react';
import { Collapse, List } from '@material-ui/core';
import { FC, memo } from 'react';
import { MenuItem } from '../MenuItem';
import { TModuleMenuItem } from '../NavBarSection';
import { useComponentStyles } from './styles';

export interface NavSubMenuProps {
  open: boolean;
  rootUrl: string;
  menuList: TModuleMenuItem[];
}

export const NavSubMenu: FC<NavSubMenuProps> = memo(
  ({ open, menuList, rootUrl }) => {
    const { listCss } = useComponentStyles();
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
