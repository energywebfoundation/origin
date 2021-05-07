import React, { FC } from 'react';
import { NavSectionTitle } from '../NavSectionTitle';
import { NavSubMenu } from '../NavSubMenu';
import { useStyles } from './NavBarSection.styles';

export type TMenuSection = Omit<
  NavBarSectionProps,
  'titleClickHandler' | 'isOpen'
>;

export type TModuleMenuItem = {
  url: string;
  label: string;
  show: boolean;
};

export interface NavBarSectionProps {
  sectionTitle: string;
  show: boolean;
  rootUrl: string;
  isOpen: boolean;
  menuList: TModuleMenuItem[];
  titleClickHandler?: () => void;
  closeMobileNav?: () => void;
}

export const NavBarSection: FC<NavBarSectionProps> = ({
  sectionTitle,
  show,
  rootUrl,
  isOpen,
  menuList,
  titleClickHandler,
  closeMobileNav,
}) => {
  const classes = useStyles();

  return (
    <div className={classes.wrapper}>
      {show && (
        <>
          <NavSectionTitle
            url={rootUrl}
            title={sectionTitle}
            clickHandler={titleClickHandler}
          />
          <NavSubMenu
            closeMobileNav={closeMobileNav}
            rootUrl={rootUrl}
            open={isOpen}
            menuList={menuList}
          />
        </>
      )}
    </div>
  );
};
