import { Drawer, List } from '@material-ui/core';
import React, { FC, memo } from 'react';
import { CloseButton } from '../../icons/CloseButton';
import { TMenuSection, NavBarSection } from '../NavBarSection';
import { useStyles } from './MobileNav.styles';

export interface MobileNavProps {
  open: boolean;
  onClose: () => void;
  menuSections: TMenuSection[];
}

export const MobileNav: FC<MobileNavProps> = memo(
  ({ open, onClose, menuSections }) => {
    const classes = useStyles();
    return (
      <Drawer
        anchor="left"
        open={open}
        variant="persistent"
        className={classes.drawer}
      >
        <CloseButton onClose={onClose} />
        <List className={classes.list}>
          {menuSections?.map(({ sectionTitle, rootUrl, show, menuList }) => (
            <NavBarSection
              closeMobileNav={onClose}
              key={sectionTitle}
              sectionTitle={sectionTitle}
              isOpen={true}
              rootUrl={rootUrl}
              show={show}
              menuList={menuList}
            />
          ))}
        </List>
      </Drawer>
    );
  }
);
