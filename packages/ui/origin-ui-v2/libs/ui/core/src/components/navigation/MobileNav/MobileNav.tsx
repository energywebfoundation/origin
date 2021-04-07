/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx, css } from '@emotion/react';
import { Drawer, List } from '@material-ui/core';
import { FC, memo } from 'react';
import { CloseButton } from '../../icons/CloseButton';
import { TMenuSection, NavBarSection } from '../NavBarSection';

export interface MobileNavProps {
  open: boolean;
  onClose: () => void;
  menuSections: TMenuSection[];
}
const drawerCss = css({
  '& > .MuiDrawer-paper': {
    width: '100%',
  },
});
const listCss = css({
  padding: 0,
});

export const MobileNav: FC<MobileNavProps> = memo(
  ({ open, onClose, menuSections }) => {
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
