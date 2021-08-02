import { Collapse, List } from '@material-ui/core';
import React, { FC, memo } from 'react';
import { useLocation } from 'react-router-dom';
import { MenuItem } from '../MenuItem';
import { TModuleMenuItem } from '../NavBarSection';
import { useStyles } from './NavSubMenu.styles';

export interface NavSubMenuProps {
  open: boolean;
  rootUrl: string;
  menuList: TModuleMenuItem[];
  closeMobileNav?: () => void;
}

export const NavSubMenu: FC<NavSubMenuProps> = memo(
  ({ open, menuList, rootUrl, closeMobileNav }) => {
    const classes = useStyles();
    const location = useLocation();
    return (
      <Collapse in={open} timeout="auto">
        <List className={classes.list}>
          {menuList?.map((item) => {
            if (item.show) {
              const link = `${rootUrl}/${item.url}`;
              return (
                <MenuItem
                  closeMobileNav={closeMobileNav}
                  key={link}
                  url={link}
                  label={item.label}
                  selected={location.pathname === link}
                />
              );
            }
            return;
          })}
        </List>
      </Collapse>
    );
  }
);
