/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@emotion/react';
import { Drawer, List } from '@material-ui/core';
import { FC, memo } from 'react';
import { CloseButton } from '../../icons/CloseButton';
import { TMenuSection, NavBarSection } from '../NavBarSection';
import { useComponentStyles } from './styles';

export interface MobileNavProps {
  open: boolean;
  onClose: () => void;
  menuSections: TMenuSection[];
}

export const MobileNav: FC<MobileNavProps> = memo(
  ({ open, onClose, menuSections }) => {
    const { drawerCss, listCss } = useComponentStyles();
    return (
      <Drawer anchor="left" open={open} variant="persistent" css={drawerCss}>
        <CloseButton onClose={onClose} />
        <List css={listCss}>
          {menuSections?.map(({ sectionTitle, rootUrl, show, menuList }) => (
            <NavBarSection
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
